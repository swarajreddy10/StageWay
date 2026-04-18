"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Calendar, Plus, QrCode, BarChart2, Zap } from "lucide-react";
import { Button } from "./ui/button";
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
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/about",  label: "About" },
];

const HOST_LINKS = [
  { href: "/events/new", label: "Create",    icon: Plus },
  { href: "/check-in",   label: "Check-in",  icon: QrCode },
  { href: "/analytics",  label: "Analytics", icon: BarChart2 },
];

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200",
        active
          ? "text-white bg-white/[0.08]"
          : "text-white/45 hover:text-white/80 hover:bg-white/[0.05]"
      )}
    >
      {label}
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-full"
          style={{ background: "rgba(124,90,245,0.12)", border: "1px solid rgba(124,90,245,0.2)" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  );
}

export default function NavBar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated, logout, notice, clearNotice } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const showUser    = isHydrated && isAuthenticated && user;
  const userProfile = showUser ? user : null;
  const role        = userProfile?.role;
  const isHost      = role === "HOST";
  const isAdmin     = role === "ADMIN";
  const dashHref    = isAdmin ? "/admin/host-requests" : isHost ? "/host" : "/dashboard";
  const dashLabel   = isAdmin ? "Admin" : isHost ? "Host Hub" : "Dashboard";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (notice) { toast.info(notice, { duration: 5000 }); clearNotice(); }
  }, [notice, clearNotice]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  async function handleSignOut() {
    try {
      await logout();
      toast.success("Signed out.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Sign out failed.");
    }
  }

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <>
      {/* Floating pill nav */}
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "pointer-events-auto w-full max-w-5xl flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl transition-all duration-300",
            scrolled
              ? "bg-[#0e1018]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              : "bg-transparent border border-transparent"
          )}
        >
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center h-6 w-6 rounded-md bg-violet-600/90">
              <Zap className="h-3.5 w-3.5 text-white" fill="currentColor" />
            </div>
            <span className="font-display text-[0.95rem] font-bold tracking-[0.08em] text-white uppercase select-none hidden sm:block">
              Stageway
            </span>
          </Link>

          {/* Desktop nav links - center */}
          <nav className="hidden items-center gap-0.5 md:flex" role="navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} active={pathname === href} />
            ))}
            {showUser && (
              <NavLink href={dashHref} label={dashLabel} active={!!pathname?.startsWith(dashHref)} />
            )}
            {(isHost || isAdmin) && HOST_LINKS.map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} active={pathname === href} />
            ))}
          </nav>

          {/* Desktop auth - right */}
          <div className="hidden items-center gap-2 md:flex shrink-0">
            {showUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all duration-200 group">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-violet-600/80 text-white text-[9px] font-bold rounded-full">
                        {getInitials(userProfile?.fullName || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[12px] font-medium text-white/70 group-hover:text-white transition-colors max-w-[100px] truncate">
                      {userProfile?.fullName?.split(" ")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-xl border border-white/[0.09] bg-[#141720]/95 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal px-3 py-2.5">
                    <p className="text-sm font-semibold text-white">{userProfile?.fullName}</p>
                    <p className="text-xs text-white/40 mt-0.5 truncate">{userProfile?.email}</p>
                    <span className="mt-2 inline-block text-[9px] font-bold uppercase tracking-[0.12em] text-violet-400/70 border border-violet-500/20 px-1.5 py-0.5 rounded-md bg-violet-500/10">
                      {role}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  <DropdownMenuItem asChild>
                    <Link href={dashHref} className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white cursor-pointer rounded-lg">
                      <User className="h-3.5 w-3.5" /> {dashLabel}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/registrations" className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white cursor-pointer rounded-lg">
                      <Calendar className="h-3.5 w-3.5" /> My Registrations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-500/10 rounded-lg"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className="h-8 px-3.5 text-[13px] text-white/45 hover:text-white hover:bg-white/[0.05] rounded-full"
                >
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
                <Button
                  asChild
                  className="h-8 px-4 text-[13px] font-semibold rounded-full transition-all"
                  style={{
                    background: "linear-gradient(135deg, #7c5af5 0%, #6040e0 100%)",
                    boxShadow: "0 0 0 1px rgba(124,90,245,0.4), 0 4px 16px rgba(124,90,245,0.25)",
                  }}
                >
                  <Link href="/auth/signup">Get started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden h-8 w-8 rounded-full text-white/50 hover:text-white hover:bg-white/[0.07]"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen
                ? <motion.div key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.12 }}><X className="h-4 w-4" /></motion.div>
                : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.12 }}><Menu className="h-4 w-4" /></motion.div>
              }
            </AnimatePresence>
          </Button>
        </motion.div>
      </header>

      {/* Spacer so content doesn't go under the floating nav */}
      <div className="h-[72px]" aria-hidden />

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[80px] z-40 rounded-2xl border border-white/[0.09] bg-[#0e1018]/95 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] md:hidden overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-1">
              {showUser && (
                <div className="flex items-center gap-3 mb-3 p-3 rounded-xl border border-white/[0.07] bg-white/[0.03]">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-violet-600/80 text-white text-xs font-bold rounded-full">
                      {getInitials(userProfile?.fullName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{userProfile?.fullName}</p>
                    <p className="text-xs text-white/40 truncate">{userProfile?.email}</p>
                  </div>
                </div>
              )}

              {[
                ...NAV_LINKS,
                ...(showUser ? [{ href: dashHref, label: dashLabel }] : []),
                ...((isHost || isAdmin) ? HOST_LINKS.map(({ href, label }) => ({ href, label })) : []),
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all",
                    pathname === href
                      ? "bg-violet-500/10 text-white border border-violet-500/20"
                      : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  {label}
                </Link>
              ))}

              <div className="mt-2 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                {showUser ? (
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/[0.07] text-[13px] rounded-xl"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full text-white/60 hover:text-white hover:bg-white/[0.05] text-[13px] rounded-xl">
                      <Link href="/auth/signin">Sign in</Link>
                    </Button>
                    <Button asChild className="w-full font-semibold text-[13px] rounded-xl" style={{ background: "linear-gradient(135deg, #7c5af5 0%, #6040e0 100%)" }}>
                      <Link href="/auth/signup">Get started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
