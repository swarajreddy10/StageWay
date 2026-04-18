import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", md: "2rem" },
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        /* shadcn/ui contract */
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* StageWay surface + accent scale (v2 tokens) */
        sw: {
          base:          "#060810",   /* page background */
          surface:       "#0e1018",   /* cards */
          elevated:      "#141720",   /* hover / elevated */
          overlay:       "#1c2030",   /* dropdowns / modals */
          "text-1":      "#eef0f7",
          "text-2":      "#9499b8",
          "text-3":      "#5c6080",
          "text-4":      "#363a52",
          accent:        "#7c5af5",   /* indigo-violet primary */
          "accent-2":    "#9d7dff",   /* lighter violet */
          "accent-dark": "#6040e0",   /* deeper violet */
          gold:          "#f5a623",   /* amber accent */
        },
      },

      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans:    ["var(--font-body)", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },

      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        xl:   "calc(var(--radius) + 4px)",
        "2xl":"calc(var(--radius) + 10px)",
      },

      boxShadow: {
        "card":         "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover":   "0 4px 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)",
        "panel":        "0 8px 32px rgba(0,0,0,0.7)",
        "btn-violet":   "0 0 24px rgba(124,90,245,0.35), 0 2px 8px rgba(124,90,245,0.20)",
        "btn-white":    "0 0 20px rgba(255,255,255,0.10)",
        "inner-border": "inset 0 0 0 1px rgba(255,255,255,0.07)",
        "glow-violet":  "0 0 40px rgba(124,90,245,0.25)",
      },

      backgroundImage: {
        "gradient-violet": "linear-gradient(135deg, #9d7dff 0%, #7c5af5 100%)",
        "gradient-dark":   "linear-gradient(180deg, #060810 0%, #0e1018 100%)",
        "gradient-surface":"linear-gradient(180deg, #0e1018 0%, #060810 100%)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        "pulse-violet": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(124,90,245,0.4)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(124,90,245,0)" },
        },
      },

      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        float:             "float 3.5s ease-in-out infinite",
        shimmer:           "shimmer 1.6s ease-in-out infinite",
        "fade-up":         "fade-up 0.55s cubic-bezier(0.16,1,0.3,1) both",
        marquee:           "marquee 28s linear infinite",
        "pulse-violet":    "pulse-violet 2s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
