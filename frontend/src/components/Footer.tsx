import Link from "next/link";
import { Calendar, Users, FileText, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/70 bg-white/70 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-[#D8573B]" />
      <div className="container px-4 py-14 md:px-8">
        <div className="mb-12 grid gap-8 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)] lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              StageWay
            </p>
            <h2 className="font-display text-3xl font-semibold text-foreground">
              Give every event a sharper edge.
            </h2>
            <p className="text-sm text-muted-foreground">
              From ticketing to check-in, StageWay keeps your crowd, team, and insights in sync.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              asChild
              variant="outline"
              className="border-white/70 bg-white/70 hover:bg-white"
            >
              <Link href="/events">Browse Events</Link>
            </Button>
            <Button asChild className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]">
              <Link href="/host/request">
                Host an Event
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-semibold uppercase tracking-[0.3em] text-foreground">
                StageWay
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Built for bold organizers and curious attendees. Discover, register, and check in with
              a platform that moves as fast as your crowd.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-foreground/70">
              <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1">
                Real-time insights
              </span>
              <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1">
                QR check-ins
              </span>
              <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1">
                Smart waitlists
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/events"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Calendar className="h-4 w-4" />
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Users className="h-4 w-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/registrations"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FileText className="h-4 w-4" />
                  My Passes
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Account</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/auth/signin"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Create account
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@stageway.app"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  support@stageway.app
                </a>
              </li>
              <li>
                <a
                  href="mailto:partners@stageway.app"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  partners@stageway.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/70 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground md:flex-row">
            <p>Copyright {new Date().getFullYear()} StageWay. All rights reserved.</p>
            <p>Designed for live audiences worldwide.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
