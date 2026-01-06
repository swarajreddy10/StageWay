"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeUp, pageTransition, staggerContainer } from "@/lib/motion";

type HeroSectionProps = {
  eventCount: number;
  upcomingCount: number;
  nextEventLabel: string;
};

const spotlightChips = ["Live music", "Design talks", "Founder socials"];

export default function HeroSection({
  eventCount,
  upcomingCount,
  nextEventLabel,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,90,85,0.12),_transparent_55%)]" />
      <div className="container relative px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            transition={pageTransition}
            className="space-y-6"
          >
            <motion.div variants={fadeUp}>
              <Badge className="w-fit border border-white/70 bg-white/70 text-xs uppercase tracking-[0.3em] text-foreground">
                StageWay
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Moments people remember. A studio for every event.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground">
              One place to plan, launch, and run unforgettable nights.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
              >
                <Link href="/auth/signin">
                  Sign in / Register
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-white/70 bg-white/70 hover:bg-white"
              >
                <Link href="/events">Browse Events</Link>
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {spotlightChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {chip}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            transition={pageTransition}
            className="space-y-4"
          >
            <motion.div variants={fadeUp}>
              <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Next on stage
                  </div>
                  <CardTitle className="text-lg">{nextEventLabel}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Keep your crowd ready for the next headline moment.
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    Live pulse
                  </div>
                  <CardTitle className="text-2xl">{upcomingCount} moments ahead</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Live events
                      </div>
                      <div className="text-2xl font-semibold text-foreground">{eventCount}</div>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Audience readiness
                      </div>
                      <div className="text-base font-semibold text-foreground">High</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    Live sync across host + attendee
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
