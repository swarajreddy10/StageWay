"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTimeField } from "@/components/ui/date-time-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isBackendAssetUrl, resolveAssetUrl, resolveFileBaseUrl } from "@/lib/api-base";
import { API_ROUTES } from "@/lib/api-routes";
import { COUNTRIES, CURRENCIES, getCurrencyByCountry } from "@/lib/countries-currencies";
import { uploadFile } from "@/lib/file-api";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import type { CreateEventRequest, EventCategory } from "@/types/event";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  Tag,
  Ticket,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>"']/g, "");
};

const eventSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(200, "Name must not exceed 200 characters")
      .transform(sanitizeInput),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must not exceed 5000 characters")
      .transform(sanitizeInput),
    category: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    location: z
      .string()
      .min(3, "Location is required")
      .max(500, "Location must not exceed 500 characters")
      .transform(sanitizeInput),
    venueName: z
      .string()
      .max(200, "Venue name must not exceed 200 characters")
      .transform(sanitizeInput)
      .optional(),
    capacity: z
      .number()
      .min(1, "Capacity must be at least 1")
      .max(1000000, "Capacity seems unrealistic"),
    price: z
      .number()
      .min(0, "Price cannot be negative")
      .max(1000000, "Price seems unrealistic")
      .optional(),
    currency: z.string().length(3, "Currency must be a 3-letter code").optional(),
    bannerUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    tags: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine((data) => new Date(data.startDate) > new Date(), {
    message: "Start date must be in the future",
    path: ["startDate"],
  });

type EventFormData = z.infer<typeof eventSchema>;

const categories: EventCategory[] = [
  "WORKSHOP",
  "CONCERT",
  "CONFERENCE",
  "SEMINAR",
  "NETWORKING",
  "SPORTS",
  "ARTS",
  "OTHER",
];

const TABS = [
  { id: "basics",   label: "Basics",   icon: Tag },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "location", label: "Location", icon: MapPin },
  { id: "tickets",  label: "Tickets",  icon: Ticket },
  { id: "media",    label: "Media",    icon: ImagePlus },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface EventFormProps {
  initialData?: Partial<CreateEventRequest>;
  onSubmit: (data: CreateEventRequest) => Promise<void>;
  isLoading?: boolean;
  isEditMode?: boolean;
  submitNotice?: string | null;
  submitError?: string | null;
}

export function EventForm({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
  submitNotice,
  submitError,
}: EventFormProps) {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>("basics");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      location: initialData?.location || "",
      venueName: initialData?.venueName || "",
      capacity: initialData?.capacity || 1,
      price: initialData?.price || 0,
      currency: initialData?.currency || "USD",
      bannerUrl: initialData?.bannerUrl || "",
      tags: initialData?.tags?.join(", ") || "",
    },
  });

  const bannerUrl = watch("bannerUrl");
  const previewName = watch("name") || "Untitled event";
  const previewDescription = watch("description") || "Add a short description to set the vibe.";
  const previewLocation = watch("location") || "Location pending";
  const previewStart = watch("startDate");
  const previewEnd = watch("endDate");
  const previewPrice = watch("price");
  const previewCapacity = watch("capacity");
  const previewCurrency = watch("currency") || "USD";
  const previewTags = watch("tags");

  const previewBannerUrl = bannerUrl ? resolveAssetUrl(bannerUrl) : "";
  const isBackendAsset = previewBannerUrl ? isBackendAssetUrl(previewBannerUrl) : false;
  const startDate = previewStart ? new Date(previewStart) : null;
  const endDate = previewEnd ? new Date(previewEnd) : null;
  const startLabel =
    startDate && !Number.isNaN(startDate.getTime())
      ? format(startDate, "MMM d, yyyy")
      : "Start date";
  const endLabel =
    endDate && !Number.isNaN(endDate.getTime()) ? format(endDate, "MMM d, yyyy") : "";
  const priceValue =
    typeof previewPrice === "number" && !Number.isNaN(previewPrice) ? previewPrice : 0;
  const capacityValue =
    typeof previewCapacity === "number" && !Number.isNaN(previewCapacity) ? previewCapacity : 0;
  const tagList = previewTags
    ? previewTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const tabErrors: Record<TabId, boolean> = {
    basics:   Boolean(errors.name || errors.description || errors.category || errors.tags),
    schedule: Boolean(errors.startDate || errors.endDate),
    location: Boolean(errors.location || errors.venueName),
    tickets:  Boolean(errors.capacity || errors.price || errors.currency),
    media:    Boolean(errors.bannerUrl),
  };

  useEffect(() => {
    const subscription = watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const currency = getCurrencyByCountry(countryCode);
    setValue("currency", currency, { shouldValidate: true });
  };

  const handleUpload = async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!bannerFile) {
      setUploadStatus("Select an image to upload.");
      return;
    }
    if (!isAuthenticated) {
      setUploadStatus("Sign in to upload, or paste an image URL instead.");
      return;
    }
    const maxSize = 20 * 1024 * 1024;
    if (bannerFile.size > maxSize) {
      setUploadStatus(
        `File too large. Maximum size is 20MB. Your file is ${(bannerFile.size / 1024 / 1024).toFixed(2)}MB.`
      );
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setUploadStatus("Session expired. Sign in again to upload.");
        return;
      }
      const asset = await uploadFile(bannerFile, token);
      const fileUrl = `${resolveFileBaseUrl()}${API_ROUTES.files}/${asset.id}`;
      setValue("bannerUrl", fileUrl, { shouldValidate: true });
      setUploadStatus("Banner uploaded successfully.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setUploadStatus(message);
    } finally {
      setIsUploading(false);
    }
  };

  const onFormSubmit = async (data: EventFormData) => {
    const startDateTime = new Date(data.startDate);
    const endDateTime = new Date(data.endDate);

    if (startDateTime >= endDateTime) {
      setError("endDate", {
        type: "manual",
        message: "End time must be after start time",
      });
      return;
    }

    const submitData: CreateEventRequest = {
      name: data.name,
      description: data.description,
      category: data.category as EventCategory | undefined,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      location: data.location,
      venueName: data.venueName || undefined,
      capacity: data.capacity,
      price: data.price || 0,
      currency: data.currency || "USD",
      bannerUrl: data.bannerUrl?.trim() || undefined,
      tags:
        data.tags && data.tags.trim()
          ? data.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
    };

    await onSubmit(submitData);
    setHasUnsavedChanges(false);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ── Main form panel ── */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] overflow-hidden">
            {/* Tab strip */}
            <div className="flex gap-1 border-b border-white/[0.06] bg-white/[0.02] p-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={[
                    "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                    activeTab === id
                      ? "bg-white/[0.09] text-white"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {tabErrors[id] && (
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 absolute -top-0.5 -right-0.5" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {/* Basics */}
              {activeTab === "basics" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                      Event Name <span className="text-white/40">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Give your event a great name"
                      {...register("name")}
                      disabled={isLoading}
                      className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-white/25"
                    />
                    {errors.name && (
                      <p className="flex items-center gap-1 text-xs text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                      Description <span className="text-white/40">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="Tell attendees what makes this event special..."
                      {...register("description")}
                      disabled={isLoading}
                      className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-white/25 resize-none"
                    />
                    {errors.description && (
                      <p className="flex items-center gap-1 text-xs text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                        Category
                      </Label>
                      <Select
                        value={(watch("category") as string) || ""}
                        onValueChange={(value) => setValue("category", value as EventCategory)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="bg-white/[0.04] border-white/10 text-white focus:border-white/25">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141720] border-white/10">
                          {categories.map((category) => (
                            <SelectItem
                              key={category}
                              value={category}
                              className="text-white/80 focus:bg-white/[0.08] focus:text-white"
                            >
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                        Tags
                      </Label>
                      <Input
                        id="tags"
                        placeholder="tech, networking, startup"
                        {...register("tags")}
                        disabled={isLoading}
                        className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-white/25"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule */}
              {activeTab === "schedule" && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DateTimeField
                      value={watch("startDate")}
                      onChange={(value) => setValue("startDate", value, { shouldValidate: true })}
                      label="Start Date & Time"
                      disabled={isLoading}
                      error={errors.startDate?.message}
                    />
                    <DateTimeField
                      value={watch("endDate")}
                      onChange={(value) => setValue("endDate", value, { shouldValidate: true })}
                      label="End Date & Time"
                      disabled={isLoading}
                      error={errors.endDate?.message}
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              {activeTab === "location" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                      Country
                    </Label>
                    <Select
                      value={selectedCountry}
                      onValueChange={handleCountryChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/[0.04] border-white/10 text-white focus:border-white/25">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 bg-[#141720] border-white/10">
                        {COUNTRIES.map((country) => (
                          <SelectItem
                            key={country.code}
                            value={country.code}
                            className="text-white/80 focus:bg-white/[0.08] focus:text-white"
                          >
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                      Location / Address <span className="text-white/40">*</span>
                    </Label>
                    <Input
                      id="location"
                      placeholder="City, State or full address"
                      {...register("location")}
                      disabled={isLoading}
                      className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-white/25"
                    />
                    {errors.location && (
                      <p className="flex items-center gap-1 text-xs text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venueName" className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                      Venue Name
                    </Label>
                    <Input
                      id="venueName"
                      placeholder="e.g. Madison Square Garden"
                      {...register("venueName")}
                      disabled={isLoading}
                      className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-white/25"
                    />
                  </div>
                </div>
              )}

              {/* Tickets */}
              {activeTab === "tickets" && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                        Capacity <span className="text-white/40">*</span>
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        {...register("capacity", { valueAsNumber: true })}
                        disabled={isLoading}
                        className="bg-white/[0.04] border-white/10 text-white focus:border-white/25"
                      />
                      {errors.capacity && (
                        <p className="flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          {errors.capacity.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                        Price
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("price", { valueAsNumber: true })}
                        disabled={isLoading}
                        className="bg-white/[0.04] border-white/10 text-white focus:border-white/25"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                      Currency <span className="text-white/40">*</span>
                    </Label>
                    <Select
                      value={watch("currency") || "USD"}
                      onValueChange={(value) => setValue("currency", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/[0.04] border-white/10 text-white focus:border-white/25">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 bg-[#141720] border-white/10">
                        {CURRENCIES.map((currency) => (
                          <SelectItem
                            key={currency.code}
                            value={currency.code}
                            className="text-white/80 focus:bg-white/[0.08] focus:text-white"
                          >
                            {currency.symbol} {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.currency && (
                      <p className="flex items-center gap-1 text-xs text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        {errors.currency.message}
                      </p>
                    )}
                  </div>

                  {/* Free badge indicator */}
                  {priceValue === 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white/50" />
                      <span className="text-xs text-white/55 font-medium">Free event — no ticket price</span>
                    </div>
                  )}
                </div>
              )}

              {/* Media */}
              {activeTab === "media" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="bannerUrl" className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                      Banner URL
                    </Label>
                    <Input
                      id="bannerUrl"
                      placeholder="https://your-image-url.com/banner.jpg"
                      {...register("bannerUrl")}
                      disabled={isLoading}
                      className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-white/25"
                    />
                    <p className="text-xs text-white/30">Paste a URL or upload a file below.</p>
                  </div>

                  {/* Upload area */}
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4">
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                          className="sr-only"
                          disabled={isLoading || isUploading}
                        />
                        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/40 transition hover:border-white/20 hover:text-white/60">
                          <Upload className="h-4 w-4 shrink-0" />
                          <span className="truncate">{bannerFile ? bannerFile.name : "Choose image file…"}</span>
                        </div>
                      </label>
                      <Button
                        type="button"
                        onClick={(e) => void handleUpload(e)}
                        disabled={isLoading || isUploading || !bannerFile}
                        className="bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-btn-violet shrink-0 disabled:opacity-40"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading…
                          </>
                        ) : (
                          "Upload Banner"
                        )}
                      </Button>
                    </div>
                    {uploadStatus && (
                      <p className={`mt-2 text-xs ${uploadStatus.startsWith("Banner uploaded") ? "text-white/60" : "text-white/40"}`}>
                        {uploadStatus}
                      </p>
                    )}
                  </div>

                  {previewBannerUrl && (
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <Image
                        src={previewBannerUrl}
                        alt="Event banner preview"
                        width={800}
                        height={400}
                        className="h-52 w-full object-cover"
                        unoptimized={isBackendAsset}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          {/* Live preview */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <span className="text-sm font-semibold text-white/80">Live Preview</span>
              <Badge className={`text-[10px] font-bold uppercase tracking-wider ${
                isEditMode
                  ? "border-white/[0.10] bg-white/[0.05] text-white/55"
                  : "border-white/[0.08] bg-white/[0.03] text-white/40"
              }`}>
                {isEditMode ? "Editing" : "Draft"}
              </Badge>
            </div>

            {/* Banner */}
            <div className="relative h-36 w-full bg-white/[0.03]">
              {bannerUrl ? (
                <Image
                  src={previewBannerUrl}
                  alt="Event banner"
                  fill
                  className="object-cover"
                  unoptimized={isBackendAsset}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1.5">
                  <ImagePlus className="h-6 w-6 text-white/15" />
                  <span className="text-xs text-white/20">No banner yet</span>
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="space-y-3 p-4">
              <div>
                <h3 className="font-display font-semibold text-white line-clamp-2">{previewName}</h3>
                <p className="mt-1 text-xs text-white/40 line-clamp-2">{previewDescription}</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-white/40">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-white/30" />
                    Schedule
                  </span>
                  <span className="text-white/60">
                    {endLabel ? `${startLabel} – ${endLabel}` : startLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-white/40">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-white/30" />
                    Location
                  </span>
                  <span className="text-right text-white/60 max-w-[120px] truncate">{previewLocation}</span>
                </div>
                <div className="flex items-center justify-between text-white/40">
                  <span className="flex items-center gap-1.5">
                    <Ticket className="h-3 w-3 text-white/30" />
                    Tickets
                  </span>
                  <span className="text-white/60">
                    {capacityValue ? `${capacityValue} seats` : "—"} ·{" "}
                    {priceValue === 0 ? "Free" : `${previewCurrency} ${priceValue.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tagList.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/40"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Checklist
              </span>
              {hasUnsavedChanges && (
                <span className="flex items-center gap-1 text-[10px] text-white/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
                  Unsaved
                </span>
              )}
            </div>
            <div className="space-y-2">
              {[
                "Dates must be in the future",
                "Add a banner to boost conversions",
                "Set capacity before publishing",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2 text-xs text-white/30">
                  <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div>
          {(submitNotice || submitError) && (
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                submitError
                  ? "border border-red-500/20 bg-red-500/[0.08] text-red-400"
                  : "border border-white/[0.10] bg-white/[0.05] text-white/60"
              }`}
            >
              {submitError ? (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              )}
              {submitError || submitNotice}
            </div>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-btn-violet px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : isEditMode ? (
            "Save Changes"
          ) : (
            "Create Event"
          )}
        </Button>
      </div>
    </form>
  );
}
