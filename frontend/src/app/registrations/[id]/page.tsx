"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { fetchRegistration as fetchRegistrationApi } from "@/lib/registration-api";
import { QRCodeDisplay } from "@/components/registration/QRCodeDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Ticket, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { Registration } from "@/types/registration";

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const registrationId = Number(params?.id);
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadRegistration = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        const data = await fetchRegistrationApi(registrationId);
        setRegistration(data);
      } catch (error) {
        console.error("Failed to fetch registration:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.push("/auth/signin");
    } else {
      loadRegistration();
    }
  }, [isAuthenticated, isHydrated, router, registrationId]);

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="container mx-auto flex items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!registration) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Registration not found</h1>
          <Link href="/registrations">
            <Button variant="outline">Back to Registrations</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <Link href="/registrations">
        <Button variant="outline" className="mb-6 border-white/70 bg-white/70 hover:bg-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Registrations
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">{registration.event?.name}</CardTitle>
                <Badge variant="secondary">{registration.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {registration.event && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {format(
                        new Date(registration.event.startDate),
                        "EEEE, MMMM d, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{registration.event.location}</span>
                  </div>
                  {registration.seatNumber && (
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Seat: {registration.seatNumber}</span>
                    </div>
                  )}
                  <div className="pt-2 text-xs text-muted-foreground">
                    Registered:{" "}
                    {format(new Date(registration.registeredAt), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
              )}

              {registration.cancelledAt && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  Cancelled on {format(new Date(registration.cancelledAt), "MMM d, yyyy")}
                  {registration.cancellationReason && (
                    <p className="mt-1">Reason: {registration.cancellationReason}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {registration.qrCode ? (
            <QRCodeDisplay
              qrCode={registration.qrCode}
              registrationId={registration.id}
              eventName={registration.event?.name}
            />
          ) : (
            <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">QR code not available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
