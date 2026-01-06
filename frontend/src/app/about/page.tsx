import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function AboutPage() {
  return (
    <main className="flex-1">
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-white/60" />
        <div className="container relative px-4 md:px-8">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <Badge className="bg-[#F0B34B] text-[#151515]">
              <Sparkles className="mr-2 h-3 w-3" />
              About StageWay
            </Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Built for both attendees and hosts
            </h1>
            <p className="text-lg text-muted-foreground">
              StageWay connects event organizers with attendees through seamless registration,
              real-time updates, and powerful analytics.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D8573B] text-white">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">For Attendees</CardTitle>
                <CardDescription className="text-base">
                  Discover and register for amazing events happening near you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#D8573B] mt-0.5 shrink-0" />
                    <span className="text-sm">Browse curated events across all categories</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#D8573B] mt-0.5 shrink-0" />
                    <span className="text-sm">Easy one-click registration process</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#D8573B] mt-0.5 shrink-0" />
                    <span className="text-sm">
                      Digital passes with QR codes for seamless check-in
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#D8573B] mt-0.5 shrink-0" />
                    <span className="text-sm">Track all your registrations in one dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#D8573B] mt-0.5 shrink-0" />
                    <span className="text-sm">Real-time notifications and event updates</span>
                  </li>
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="border-green/70 bg-light-green/70 hover:bg-orange-100"
                >
                  <Link href="/events">
                    Browse Events
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E5A55] text-white">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">For Hosts</CardTitle>
                <CardDescription className="text-base">
                  Create and manage events with powerful tools built for organizers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#1E5A55] mt-0.5 shrink-0" />
                    <span className="text-sm">Create beautiful event pages in minutes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#1E5A55] mt-0.5 shrink-0" />
                    <span className="text-sm">Manage registrations and capacity in real-time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#1E5A55] mt-0.5 shrink-0" />
                    <span className="text-sm">QR code check-in system for smooth entry</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#1E5A55] mt-0.5 shrink-0" />
                    <span className="text-sm">Comprehensive analytics and insights dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#1E5A55] mt-0.5 shrink-0" />
                    <span className="text-sm">Automated email notifications to attendees</span>
                  </li>
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="border-green/70 bg-light-green/70 hover:bg-green-100"
                >
                  <Link href="/host/request">
                    Start Hosting
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="relative py-12 md:py-16">
        <div className="absolute inset-0 bg-[#1E5A55]/10" />
        <div className="container relative px-4 md:px-8">
          <div className="mb-12 space-y-4 text-center">
            <Badge className="bg-white/80 text-foreground border border-white/70">
              <TrendingUp className="mr-2 h-3 w-3" />
              Platform Features
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need in one place
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              Everything you need to plan, promote, and welcome guests in one polished workspace.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E5A55]/10">
                  <Zap className="h-5 w-5 text-[#1E5A55]" />
                </div>
                <CardTitle className="text-xl">Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Live updates keep hosts and guests aligned on every change.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8573B]/10">
                  <Users className="h-5 w-5 text-[#D8573B]" />
                </div>
                <CardTitle className="text-xl">Smart Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Waitlists, capacity limits, and easy ticket transfers built in.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0B34B]/20">
                  <Sparkles className="h-5 w-5 text-[#151515]" />
                </div>
                <CardTitle className="text-xl">Beautiful Design</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Modern, responsive interface that works perfectly on all devices.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9BBF9A]/30">
                  <Shield className="h-5 w-5 text-[#151515]" />
                </div>
                <CardTitle className="text-xl">Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Enterprise-grade security with encrypted data and secure authentication.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-8">
          <Card className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#1E5A55]/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-[#D8573B]/20 blur-3xl" />
            <CardHeader className="text-center space-y-4 pb-4">
              <CardTitle className="font-display text-3xl md:text-4xl">
                Ready to get started?
              </CardTitle>
              <CardDescription className="text-base">
                Join thousands of event organizers and attendees using StageWay.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
                asChild
              >
                <Link href="/host/request">
                  Host an Event
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
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
