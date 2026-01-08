"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeUp, pageTransition, staggerContainer } from "@/lib/motion";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle2, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

type HeroSectionProps = {
  eventCount: number;
  upcomingCount: number;
  nextEventLabel: string;
};

const features = [
  { icon: Calendar, label: "Event Creation" },
  { icon: Users, label: "Registration" },
  { icon: CheckCircle2, label: "QR Check-in" },
  { icon: TrendingUp, label: "Analytics" },
];

export default function HeroSection({
  eventCount,
  upcomingCount,
  nextEventLabel,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-20 lg:pt-20 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1E5A55]/5 via-transparent to-[#D8573B]/5" />
      <div className="container relative px-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            transition={pageTransition}
            className="text-center space-y-6 sm:space-y-8"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2">
              <Badge className="border-[#1E5A55]/20 bg-[#1E5A55]/10 text-[#1E5A55] text-xs sm:text-sm font-semibold px-3 py-1">
                StageWay Platform
              </Badge>
            </motion.div>
            
            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.1]"
            >
              Professional Event
              <br />
              <span className="bg-gradient-to-r from-[#1E5A55] to-[#D8573B] bg-clip-text text-transparent">
                Management Platform
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="mx-auto max-w-8xl text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed text-center px-4 sm:px-0">
              Create events, manage registrations, track analytics, and handle check-ins with QR codes.
              <br />
              Everything you need in one powerful platform.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button
                asChild
                size="lg"
                className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36] text-sm sm:text-base h-11 sm:h-12 px-6 sm:px-8"
              >
                <Link href="/auth/signin">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-2 border-[#1E5A55]/20 bg-white hover:bg-[#1E5A55]/5 text-sm sm:text-base h-11 sm:h-12 px-6 sm:px-8"
              >
                <Link href="/events">Browse Events</Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <feature.icon className="h-4 w-4 text-[#1E5A55]" />
                  <span>{feature.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            transition={pageTransition}
            className="mt-12 sm:mt-16 lg:mt-20 grid gap-4 sm:gap-6 md:grid-cols-3"
          >
            <motion.div variants={fadeUp}>
              <Card className="border-2 border-[#1E5A55]/10 bg-gradient-to-br from-white to-[#1E5A55]/5 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="space-y-2 p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[#1E5A55]/10 p-2">
                      <Calendar className="h-5 w-5 text-[#1E5A55]" />
                    </div>
                    <CardTitle className="text-base sm:text-lg font-semibold">Active Events</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 pt-0">
                  <div className="text-3xl sm:text-4xl font-bold text-[#1E5A55]">{eventCount || '—'}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{eventCount ? 'Live on platform' : 'Coming soon'}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="border-2 border-[#D8573B]/10 bg-gradient-to-br from-white to-[#D8573B]/5 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="space-y-2 p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[#D8573B]/10 p-2">
                      <Users className="h-5 w-5 text-[#D8573B]" />
                    </div>
                    <CardTitle className="text-base sm:text-lg font-semibold">Upcoming</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 pt-0">
                  <div className="text-3xl sm:text-4xl font-bold text-[#D8573B]">{upcomingCount || '—'}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{upcomingCount ? 'Events scheduled' : 'Stay tuned'}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="border-2 border-[#1E5A55]/10 bg-gradient-to-br from-white to-[#1E5A55]/5 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="space-y-2 p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[#1E5A55]/10 p-2">
                      <TrendingUp className="h-5 w-5 text-[#1E5A55]" />
                    </div>
                    <CardTitle className="text-base sm:text-lg font-semibold">Next Event</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 pt-0">
                  <div className="text-sm sm:text-base font-semibold text-foreground">{nextEventLabel || 'Create your first event'}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{nextEventLabel ? 'Ready to launch' : 'Get started'}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
