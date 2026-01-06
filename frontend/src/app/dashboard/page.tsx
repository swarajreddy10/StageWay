"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useRegistrations } from "@/hooks/useRegistrations";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Ticket, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistrationCard } from "@/components/registration/RegistrationCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { fadeUp, pageTransition, staggerContainer } from "@/lib/motion";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { registrations, isLoading } = useRegistrations();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const now = new Date();
  const upcomingRegistrations = registrations.filter(
    (reg) => reg.event && new Date(reg.event.startDate) > now
  );
  const pastRegistrations = registrations.filter(
    (reg) => reg.event && new Date(reg.event.startDate) <= now
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <main className="container mx-auto px-4 py-10">
      <PageHeader
        badge={
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[#1E5A55] text-white">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <Badge className="bg-white/80 text-foreground border border-white/70">
              Personal Dashboard
            </Badge>
          </div>
        }
        title={`Welcome back, ${user.fullName}`}
        description="Track your registrations, upcoming plans, and host tools in one view."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/registrations">
              <Button variant="outline" className="border-white/70 bg-white/70 hover:bg-white">
                View Tickets
              </Button>
            </Link>
            <Link href="/events">
              <Button className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]">
                Browse Events
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <StatCard
          label="My Registrations"
          value={registrations.length}
          helper="Total registrations"
          icon={<Ticket className="h-4 w-4 text-muted-foreground" />}
          accent="coral"
        />
        <StatCard
          label="Upcoming Events"
          value={upcomingRegistrations.length}
          helper="Events you're attending"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          accent="sky"
        />
        {(user.role === "HOST" || user.role === "ADMIN") && (
          <StatCard
            label="Host Events"
            value={user.role === "ADMIN" ? "Admin" : "Host"}
            helper="Create and manage events"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            accent="lime"
            footer={
              <Link href="/host">
                <Button
                  variant="outline"
                  className="w-full border-white/70 bg-white/70 hover:bg-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Manage Events
                </Button>
              </Link>
            }
          />
        )}
        {user.role !== "HOST" && user.role !== "ADMIN" && (
          <StatCard
            label="Become a Host"
            value="Request"
            helper="Apply for host access"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            accent="lime"
            footer={
              <Link href="/host/request">
                <Button
                  variant="outline"
                  className="w-full border-white/70 bg-white/70 hover:bg-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Request Access
                </Button>
              </Link>
            }
          />
        )}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your schedule</h2>
            <p className="text-sm text-muted-foreground">Keep tabs on what&apos;s next.</p>
          </div>
          <Link href="/registrations">
            <Button variant="outline" className="border-white/70 bg-white/70 hover:bg-white">
              View All
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="flex w-full flex-wrap justify-start gap-2 border border-white/70 bg-white/70">
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
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : upcomingRegistrations.length === 0 ? (
              <EmptyState
                title="No upcoming events"
                description="Browse new events and fill your calendar."
                icon={<Sparkles className="h-10 w-10 text-muted-foreground" />}
                action={
                  <Link href="/events">
                    <Button className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]">
                      Browse Events
                    </Button>
                  </Link>
                }
              />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                transition={pageTransition}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {upcomingRegistrations.map((registration) => (
                  <motion.div key={registration.id} variants={fadeUp}>
                    <RegistrationCard registration={registration} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastRegistrations.length === 0 ? (
              <EmptyState
                title="No past events yet"
                description="Your previous events will appear here once attended."
              />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                transition={pageTransition}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {pastRegistrations.map((registration) => (
                  <motion.div key={registration.id} variants={fadeUp}>
                    <RegistrationCard registration={registration} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
