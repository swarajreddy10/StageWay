"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, User, LogOut, Calendar, Plus, QrCode, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export default function NavBar() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const showUser = isHydrated && isAuthenticated && user;
  const userProfile = showUser ? user : null;
  const role = userProfile?.role;
  const isHost = role === "HOST";
  const isAdmin = role === "ADMIN";
  const canCreate = isHost;
  const dashboardHref = isAdmin ? "/admin/host-requests" : isHost ? "/host" : "/dashboard";
  const dashboardLabel = isAdmin ? "Admin" : "Dashboard";

  const brandMark = (
    <Link href="/" className="group flex items-center">
      <span className="text-2xl font-bold">
        <span className="text-[#D8573B]">Stage</span>
        <span className="text-black">Way</span>
      </span>
    </Link>
  );

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out.");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Sign out failed.");
    } finally {
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/70 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-[#D8573B]" />
      <div className="container relative flex min-h-[72px] items-center justify-between px-4 py-4 md:px-8">
        {brandMark}

        <nav className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/70 px-2 py-1 text-[0.85rem] font-semibold text-muted-foreground shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:flex">
          <Link
            href="/events"
            className="rounded-full px-3 py-1 transition hover:bg-white hover:text-foreground"
          >
            Events
          </Link>
          <Link
            href="/about"
            className="rounded-full px-3 py-1 transition hover:bg-white hover:text-foreground"
          >
            About
          </Link>
          {showUser && (
            <Link
              href={dashboardHref}
              className="rounded-full px-3 py-1 transition hover:bg-white hover:text-foreground"
            >
              {dashboardLabel}
            </Link>
          )}
          {canCreate && (
            <>
              <Link
                href="/events/new"
                className="rounded-full px-3 py-1 transition hover:bg-white hover:text-foreground"
              >
                Create Event
              </Link>
              <Link
                href="/check-in"
                className="rounded-full px-3 py-1 transition hover:bg-white hover:text-foreground"
              >
                Check-in
              </Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {showUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border border-white/70 bg-white/70"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-[#1E5A55] text-white">
                      {getInitials(userProfile?.fullName || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-60 rounded-2xl border border-white/70 bg-white/95 shadow-xl"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>{dashboardLabel}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-full bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]">
                  Get Started
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="rounded-2xl border border-white/70 bg-white/95 shadow-xl"
                align="end"
              >
                <DropdownMenuItem asChild>
                  <Link href="/events" className="cursor-pointer">
                    Attend Events
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/host/request" className="cursor-pointer">
                    Host Events
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/70 bg-white/70"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[320px] bg-white/95 shadow-2xl backdrop-blur-xl sm:w-[420px]"
          >
            <SheetHeader>
              <SheetTitle className="font-display text-xl">Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-3">
              {showUser ? (
                <>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[#1E5A55] text-white">
                        {getInitials(userProfile?.fullName || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{userProfile?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/events"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white hover:text-foreground"
                  >
                    <Calendar className="h-4 w-4" />
                    Events
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white hover:text-foreground"
                  >
                    <Info className="h-4 w-4" />
                    About
                  </Link>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    {dashboardLabel}
                  </Link>
                  {canCreate && (
                    <>
                      <Link
                        href="/events/new"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white hover:text-foreground"
                      >
                        <Plus className="h-4 w-4" />
                        Create Event
                      </Link>
                      <Link
                        href="/check-in"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white hover:text-foreground"
                      >
                        <QrCode className="h-4 w-4" />
                        Check-in
                      </Link>
                    </>
                  )}
                  <div className="pt-4">
                    <Button
                      variant="destructive"
                      onClick={handleSignOut}
                      className="w-full rounded-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/events"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white hover:text-foreground"
                  >
                    <Calendar className="h-4 w-4" />
                    Events
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white hover:text-foreground"
                  >
                    <Info className="h-4 w-4" />
                    About
                  </Link>
                  <div className="pt-4 space-y-2">
                    <Button variant="outline" asChild className="w-full rounded-full">
                      <Link href="/events" onClick={() => setMenuOpen(false)}>
                        Attend Events
                      </Link>
                    </Button>
                    <Button className="w-full rounded-full bg-[#1E5A55] text-white" asChild>
                      <Link href="/host/request" onClick={() => setMenuOpen(false)}>
                        Host Events
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
