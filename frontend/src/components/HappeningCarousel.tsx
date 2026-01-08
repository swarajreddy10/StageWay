"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    title: "Create Professional Events",
    subtitle: "Build stunning event pages with custom branding, ticketing, and registration in minutes.",
    location: "Virtual & In-Person",
    date: "Launch Anytime",
    theme: "Event Creation",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Seamless Registration & Check-In",
    subtitle: "QR code-based check-in system with real-time attendee tracking and waitlist management.",
    location: "Mobile & Desktop",
    date: "Real-Time Updates",
    theme: "Registration",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Powerful Analytics Dashboard",
    subtitle: "Track registrations, check-in rates, revenue, and engagement metrics with enterprise-grade charts.",
    location: "Host Dashboard",
    date: "Live Insights",
    theme: "Analytics",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Multi-Role Access Control",
    subtitle: "Secure authentication with role-based permissions for users, hosts, and administrators.",
    location: "Secure Platform",
    date: "Always Protected",
    theme: "Security",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Scale Your Event Business",
    subtitle: "Manage unlimited events, track revenue across categories, and grow your audience effortlessly.",
    location: "Enterprise Ready",
    date: "Unlimited Scale",
    theme: "Growth",
    image:
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1800&q=80",
  },
];

export default function HappeningCarousel() {
  const [active, setActive] = useState(0);
  const totalSlides = slides.length;

  useEffect(() => {
    if (totalSlides < 2) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % totalSlides);
    }, 3200);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const goPrev = () => {
    setActive((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goNext = () => {
    setActive((prev) => (prev + 1) % totalSlides);
  };

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container px-4 md:px-8">
        <div className="mb-4 sm:mb-6 flex flex-wrap items-end justify-between gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-2">
            <Badge className="bg-white/80 text-foreground border border-white/70 text-xs">
              Platform Features
            </Badge>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
              Everything you need to run successful events.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              From creation to analytics, manage your entire event lifecycle in one platform.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={goPrev}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-white/70 bg-white/90 p-0 text-foreground shadow-sm hover:bg-white"
              aria-label="Previous"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={goNext}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-white/70 bg-white/90 p-0 text-foreground shadow-sm hover:bg-white"
              aria-label="Next"
            >
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/70 bg-white/80 shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
          <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[16/7] w-full">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.title}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: index === active ? 1 : 0, scale: index === active ? 1 : 1.02 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ pointerEvents: index === active ? "auto" : "none" }}
                aria-hidden={index !== active}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 1200px"
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 lg:p-10">
                  <div className="max-w-3xl space-y-2 sm:space-y-3">
                    <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white font-bold bg-black/80 px-3 py-1 rounded-full">
                      {slide.date}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white [text-shadow:_0_2px_20px_rgb(0_0_0_/_80%)]">
                      {slide.title}
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-white font-semibold line-clamp-2 [text-shadow:_0_2px_15px_rgb(0_0_0_/_80%)]">
                      {slide.subtitle}
                    </p>
                    <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/90 border-2 border-white/50 px-3 py-1.5 text-xs sm:text-sm text-white font-bold shadow-xl">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">{slide.location}</span>
                      </span>
                      <span className="inline-flex items-center rounded-full bg-black/90 border-2 border-white/50 px-3 py-1.5 text-xs sm:text-sm text-white font-bold shadow-xl">
                        {slide.theme}
                      </span>
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <Button
                        asChild
                        size="lg"
                        className="bg-white text-[#1E5A55] hover:bg-gray-100 font-bold shadow-2xl h-10 sm:h-12 px-6 sm:px-8"
                      >
                        <Link href="/events">
                          Explore Events
                          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="absolute bottom-3 sm:bottom-5 right-4 sm:right-6 flex items-center gap-1.5 sm:gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setActive(index)}
                className={`h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 rounded-full border border-white/60 ${
                  index === active ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Go to ${slide.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
