"use client";

import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

interface BrandLogoProps {
  showText?: boolean;
  size?: LogoSize;
  className?: string;
  textClassName?: string;
}

const SIZE_STYLES: Record<LogoSize, { box: string; text: string; icon: string }> = {
  sm: {
    box: "h-6 w-6 rounded-md",
    text: "text-[0.85rem] tracking-[0.07em]",
    icon: "h-3.5 w-3.5",
  },
  md: {
    box: "h-7 w-7 rounded-lg",
    text: "text-[0.95rem] tracking-[0.07em]",
    icon: "h-4 w-4",
  },
  lg: {
    box: "h-8 w-8 rounded-lg",
    text: "text-[1rem] tracking-[0.07em]",
    icon: "h-4.5 w-4.5",
  },
};

export function BrandLogo({
  showText = true,
  size = "md",
  className,
  textClassName,
}: BrandLogoProps) {
  const styles = SIZE_STYLES[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "relative flex items-center justify-center overflow-hidden border border-white/[0.14] bg-[#0f1322] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_16px_rgba(0,0,0,0.35)]",
          styles.box
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 110% at 15% 10%, rgba(157,125,255,0.22) 0%, rgba(157,125,255,0.03) 42%, transparent 74%)",
          }}
        />
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={cn("relative text-white/90", styles.icon)}
          fill="none"
        >
          <path
            d="M5.25 8.25A2.75 2.75 0 0 1 8 5.5h8a2.75 2.75 0 0 1 2.75 2.75v1.35a1.9 1.9 0 0 0 0 3.8v1.35A2.75 2.75 0 0 1 16 17.5H8a2.75 2.75 0 0 1-2.75-2.75V13.4a1.9 1.9 0 0 0 0-3.8V8.25Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 8.1v7.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="15.8" cy="9.2" r="1" fill="#A78BFA" />
        </svg>
      </span>
      {showText && (
        <span
          className={cn(
            "font-display font-bold uppercase text-white select-none",
            styles.text,
            textClassName
          )}
        >
          Stageway
        </span>
      )}
    </span>
  );
}
