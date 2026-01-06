"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { RegistrationRequest } from "@/types/registration";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp, pageTransition } from "@/lib/motion";

const attendeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const registrationSchema = z.object({
  attendees: z.array(attendeeSchema).min(1, "At least one attendee is required"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  eventId: number;
  availableSeats: number;
  onSubmit: (data: RegistrationRequest) => Promise<void>;
  isLoading?: boolean;
}

export function RegistrationForm({
  eventId,
  availableSeats,
  onSubmit,
  isLoading,
}: RegistrationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formTone, setFormTone] = useState<"error" | "success" | "info">("info");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      attendees: [{ name: "", email: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attendees",
  });

  const onFormSubmit = async (data: RegistrationFormData) => {
    setFormMessage(null);
    if (data.attendees.length > availableSeats) {
      setFormTone("error");
      setFormMessage(`Only ${availableSeats} seats available.`);
      return;
    }

    setSubmitting(true);
    try {
      // Register each attendee
      for (const attendee of data.attendees) {
        await onSubmit({
          eventId,
          attendeeName: attendee.name,
          attendeeEmail: attendee.email,
        });
      }
      setFormTone("success");
      setFormMessage("Registration submitted. Check the page for your QR pass.");
    } catch (error) {
      setFormTone("error");
      setFormMessage(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const canAddMore = fields.length < availableSeats;
  const seatsLabel =
    availableSeats === 0
      ? "Sold out"
      : `${availableSeats} seat${availableSeats !== 1 ? "s" : ""} left`;

  return (
    <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Register for Event</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add attendee details and secure your seats.
            </p>
          </div>
          <Badge className="border border-white/70 bg-white/80 text-foreground">{seatsLabel}</Badge>
        </div>
        <Separator className="bg-white/60" />
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <span className="font-semibold text-foreground">{fields.length}</span> attendee
            {fields.length !== 1 ? "s" : ""} selected
          </div>
          <div>Checkout will create one registration per attendee.</div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <AnimatePresence initial={false}>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                variants={fadeUp}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -12 }}
                transition={pageTransition}
                className="space-y-3 rounded-2xl border border-white/70 bg-white/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Attendee {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={isLoading || submitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`attendees.${index}.name`}>Full Name</Label>
                  <Input
                    id={`attendees.${index}.name`}
                    placeholder="John Doe"
                    {...register(`attendees.${index}.name`)}
                    disabled={isLoading || submitting}
                  />
                  {errors.attendees?.[index]?.name && (
                    <p className="text-sm text-destructive">
                      {errors.attendees[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`attendees.${index}.email`}>Email</Label>
                  <Input
                    id={`attendees.${index}.email`}
                    type="email"
                    placeholder="john@example.com"
                    {...register(`attendees.${index}.email`)}
                    disabled={isLoading || submitting}
                  />
                  {errors.attendees?.[index]?.email && (
                    <p className="text-sm text-destructive">
                      {errors.attendees[index]?.email?.message}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {canAddMore && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/70 bg-white/70 hover:bg-white"
              onClick={() => append({ name: "", email: "" })}
              disabled={isLoading || submitting}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Attendee
            </Button>
          )}

          {formMessage && (
            <div
              className={`rounded-md p-3 text-sm ${
                formTone === "error"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {formMessage}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
            disabled={isLoading || submitting || availableSeats === 0}
          >
            {isLoading || submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : availableSeats === 0 ? (
              "Sold Out"
            ) : (
              `Register ${fields.length} Attendee${fields.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
