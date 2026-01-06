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
    title: "Launch your next meetup",
    subtitle: "Set the vibe, pick the date, and start sharing the link.",
    location: "Your city",
    date: "Choose a date",
    theme: "Community",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Host a workshop series",
    subtitle: "Add topics, ticket tiers, and publish in minutes.",
    location: "In-person or online",
    date: "Any day",
    theme: "Workshops",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Upload your event cover",
    subtitle: "Share visuals that match the night you are planning.",
    location: "Your venue",
    date: "Set your schedule",
    theme: "Branding",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Publish a creator social",
    subtitle: "Roundtables, panels, and community collabs.",
    location: "Your community",
    date: "Pick a slot",
    theme: "Networking",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Announce a pop-up night",
    subtitle: "Drop the details and keep guests in the loop.",
    location: "Your location",
    date: "Set the time",
    theme: "Live events",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=80",
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
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge className="bg-white/80 text-foreground border border-white/70">
              Happening moments
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Moments that pull people together.
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Auto-curated highlights that show what you can host and share.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={goPrev}
              className="h-10 w-10 rounded-full border-white/70 bg-white/90 p-0 text-foreground shadow-sm hover:bg-white"
              aria-label="Previous"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={goNext}
              className="h-10 w-10 rounded-full border-white/70 bg-white/90 p-0 text-foreground shadow-sm hover:bg-white"
              aria-label="Next"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
          <div className="relative aspect-16/7 w-full">
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
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white sm:p-10">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/70">
                    {slide.date}
                  </span>
                  <h3 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                    {slide.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
                    {slide.subtitle}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/30 px-3 py-1">
                      <MapPin className="h-4 w-4" />
                      {slide.location}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/30 px-3 py-1">
                      {slide.theme}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/30 px-3 py-1">
                      Create and share
                    </span>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      asChild
                      className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
                    >
                      <Link href="/events">
                        Explore events
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="absolute bottom-5 right-6 flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setActive(index)}
                className={`h-2.5 w-2.5 rounded-full border border-white/60 ${
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
