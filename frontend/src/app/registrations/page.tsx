"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistrationCard } from "@/components/registration/RegistrationCard";
import { Pagination } from "@/components/ui/pagination";
import { motion } from "framer-motion";
import { fadeUp, pageTransition, staggerContainer } from "@/lib/motion";

export default function RegistrationsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { registrations, isLoading, cancelRegistration } = useRegistrations();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 6;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isHydrated, router]);

  const handleCancel = async (id: number) => {
    if (confirm("Are you sure you want to cancel this registration?")) {
      try {
        await cancelRegistration(id);
      } catch (error) {
        console.error("Failed to cancel registration:", error);
      }
    }
  };

  const now = new Date();
  const upcomingRegistrations = registrations.filter(
    (registration) => registration.event && new Date(registration.event.startDate) > now
  );
  const pastRegistrations = registrations.filter(
    (registration) => registration.event && new Date(registration.event.startDate) <= now
  );

  const filteredRegistrations = useMemo(() => {
    switch (activeTab) {
      case "upcoming":
        return upcomingRegistrations;
      case "past":
        return pastRegistrations;
      case "waitlisted":
        return registrations.filter((registration) => registration.status === "WAITLISTED");
      case "cancelled":
        return registrations.filter((registration) => registration.status === "CANCELLED");
      default:
        return registrations;
    }
  }, [activeTab, upcomingRegistrations, pastRegistrations, registrations]);

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

  const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / pageSize));
  const pageRegistrations = filteredRegistrations.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <PageHeader
        badge={
          <Badge className="bg-white/80 text-foreground border border-white/70">
            My Registrations
          </Badge>
        }
        title="Manage your event registrations"
        description="Tickets, QR codes, and updates - all in one place."
        actions={
          <Link href="/events">
            <Button className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]">
              Browse Events
            </Button>
          </Link>
        }
      />

      {registrations.length === 0 ? (
        <EmptyState
          title="No registrations yet"
          description="Start exploring events to register."
          icon={<Ticket className="h-10 w-10 text-muted-foreground" />}
          action={
            <Link href="/events">
              <Button className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]">
                Browse Events
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="mt-8">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setPage(0);
            }}
          >
            <TabsList className="flex w-full flex-wrap justify-start gap-2 border border-white/70 bg-white/70">
              <TabsTrigger value="all" className="gap-2">
                All
                <Badge variant="outline" className="border-white/70 bg-white/80 text-xs">
                  {registrations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="gap-2">
                Upcoming
                <Badge variant="outline" className="border-white/70 bg-white/80 text-xs">
                  {upcomingRegistrations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="past" className="gap-2">
                Past
                <Badge variant="outline" className="border-white/70 bg-white/80 text-xs">
                  {pastRegistrations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="waitlisted" className="gap-2">
                Waitlisted
                <Badge variant="outline" className="border-white/70 bg-white/80 text-xs">
                  {
                    registrations.filter((registration) => registration.status === "WAITLISTED")
                      .length
                  }
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="gap-2">
                Cancelled
                <Badge variant="outline" className="border-white/70 bg-white/80 text-xs">
                  {
                    registrations.filter((registration) => registration.status === "CANCELLED")
                      .length
                  }
                </Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {filteredRegistrations.length === 0 ? (
                <EmptyState
                  title="No registrations in this view"
                  description="Try another filter to see more."
                />
              ) : (
                <>
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    transition={pageTransition}
                    className="grid gap-6 md:grid-cols-2"
                  >
                    {pageRegistrations.map((registration) => (
                      <motion.div key={registration.id} variants={fadeUp}>
                        <RegistrationCard
                          registration={registration}
                          showQr={registration.status === "CONFIRMED"}
                          actions={
                            registration.status === "CONFIRMED" ? (
                              <Button
                                variant="destructive"
                                onClick={() => handleCancel(registration.id)}
                              >
                                Cancel
                              </Button>
                            ) : null
                          }
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                  {filteredRegistrations.length > pageSize && (
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </main>
  );
}
