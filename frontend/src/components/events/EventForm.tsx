"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Loader2 } from "lucide-react";
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

  const tabErrors = {
    basics: Boolean(errors.name || errors.description || errors.category || errors.tags),
    schedule: Boolean(errors.startDate || errors.endDate),
    location: Boolean(errors.location || errors.venueName),
    tickets: Boolean(errors.capacity || errors.price || errors.currency),
    media: Boolean(errors.bannerUrl),
  };

  // Track form changes
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
    // Check file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
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
      setUploadStatus("Banner uploaded. Preview updated.");
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
      setError('endDate', {
        type: 'manual',
        message: 'End time must be after start time'
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
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm">
            <Tabs defaultValue="basics" className="space-y-4">
              <TabsList className="flex w-full flex-wrap justify-start gap-2 border border-white/70 bg-white/70">
                <TabsTrigger value="basics" className="gap-2">
                  Basics
                  {tabErrors.basics && <span className="h-2 w-2 rounded-full bg-destructive" />}
                </TabsTrigger>
                <TabsTrigger value="schedule" className="gap-2">
                  Schedule
                  {tabErrors.schedule && <span className="h-2 w-2 rounded-full bg-destructive" />}
                </TabsTrigger>
                <TabsTrigger value="location" className="gap-2">
                  Location
                  {tabErrors.location && <span className="h-2 w-2 rounded-full bg-destructive" />}
                </TabsTrigger>
                <TabsTrigger value="tickets" className="gap-2">
                  Tickets
                  {tabErrors.tickets && <span className="h-2 w-2 rounded-full bg-destructive" />}
                </TabsTrigger>
                <TabsTrigger value="media" className="gap-2">
                  Media
                  {tabErrors.media && <span className="h-2 w-2 rounded-full bg-destructive" />}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basics">
                <div className="space-y-4 rounded-2xl border border-white/70 bg-white/60 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Event Name *</Label>
                    <Input id="name" {...register("name")} disabled={isLoading} />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      {...register("description")}
                      disabled={isLoading}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={(watch("category") as string) || ""}
                        onValueChange={(value) => setValue("category", value as EventCategory)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        placeholder="tech, conference, networking"
                        {...register("tags")}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule">
                <div className="space-y-4 rounded-2xl border border-white/70 bg-white/60 p-4">
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
              </TabsContent>

              <TabsContent value="location">
                <div className="space-y-4 rounded-2xl border border-white/70 bg-white/60 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={selectedCountry}
                      onValueChange={handleCountryChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location / Address *</Label>
                    <Input
                      id="location"
                      placeholder="City, State or Full Address"
                      {...register("location")}
                      disabled={isLoading}
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venueName">Venue Name</Label>
                    <Input id="venueName" {...register("venueName")} disabled={isLoading} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tickets">
                <div className="space-y-4 rounded-2xl border border-white/70 bg-white/60 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity *</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        {...register("capacity", { valueAsNumber: true })}
                        disabled={isLoading}
                      />
                      {errors.capacity && (
                        <p className="text-sm text-destructive">{errors.capacity.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("price", { valueAsNumber: true })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select
                      value={watch("currency") || "USD"}
                      onValueChange={(value) => setValue("currency", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.currency && (
                      <p className="text-sm text-destructive">{errors.currency.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media">
                <div className="space-y-4 rounded-2xl border border-white/70 bg-white/60 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="bannerUrl">Banner URL</Label>
                    <Input
                      id="bannerUrl"
                      placeholder="https://your-image-url.com/banner.jpg"
                      {...register("bannerUrl")}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste an image URL or upload a banner below.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setBannerFile(event.target.files?.[0] ?? null)}
                      className="w-full rounded-xl border border-white/70 bg-white/80 px-4 py-2 text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-white/80 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-foreground hover:file:bg-white"
                      disabled={isLoading || isUploading}
                    />
                    <Button
                      type="button"
                      onClick={(event) => void handleUpload(event)}
                      disabled={isLoading || isUploading}
                      className="bg-[#1E5A55] text-white shadow-lg hover:bg-[#174844]"
                    >
                      {isUploading ? "Uploading..." : "Upload Banner"}
                    </Button>
                  </div>

                  {uploadStatus && <p className="text-sm text-muted-foreground">{uploadStatus}</p>}

                  {previewBannerUrl && (
                    <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/80">
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
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Live Preview</CardTitle>
              <Badge variant="outline" className="border-white/70 bg-white/70 text-xs">
                {isEditMode ? "Updating" : "Draft"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-white/70 bg-white/80">
                {bannerUrl ? (
                  <Image
                    src={previewBannerUrl}
                    alt="Event banner preview"
                    fill
                    className="object-cover"
                    unoptimized={isBackendAsset}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Upload a banner to preview
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{previewName}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{previewDescription}</p>
              </div>
              <Separator className="bg-white/60" />
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Schedule</span>
                  <span>{endLabel ? `${startLabel} - ${endLabel}` : startLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <span className="text-right">{previewLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Capacity</span>
                  <span>{capacityValue ? `${capacityValue} seats` : "Set capacity"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Price</span>
                  <span>
                    {priceValue === 0 ? "Free" : `${previewCurrency} ${priceValue.toFixed(2)}`}
                  </span>
                </div>
              </div>
              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tagList.slice(0, 4).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-white/70 bg-white/70 text-xs"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle>Publishing checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-600" />
                  <span>Unsaved changes</span>
                </div>
              )}
              <Separator className="bg-white/60" />
              <div className="space-y-2">
                <p>Make sure your dates are in the future.</p>
                <p>Add a banner to boost conversions.</p>
                <p>Set pricing and capacity before publishing.</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(submitNotice || submitError) && (
            <div
              className={`rounded-md px-3 py-2 text-sm ${
                submitError
                  ? "bg-destructive/10 text-destructive"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {submitError || submitNotice}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Create Event"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
