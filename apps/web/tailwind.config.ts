import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "bg-base": "oklch(0.98 0.005 80)",
        "bg-surface": "oklch(0.99 0.006 75)",
        "bg-elevated": "oklch(1.00 0.004 70)",
        "bg-overlay": "oklch(0.12 0.015 260 / 0.48)",
        "text-primary": "oklch(0.18 0.04 260)",
        "text-secondary": "oklch(0.38 0.03 260)",
        "text-muted": "oklch(0.58 0.02 260)",
        "text-inverse": "oklch(0.98 0.004 80)",
        accent: "oklch(0.70 0.19 48)",
        "accent-hover": "oklch(0.65 0.20 46)",
        "accent-subtle": "oklch(0.94 0.05 60)",
        blue: "oklch(0.52 0.18 255)",
        "blue-hover": "oklch(0.46 0.19 255)",
        "blue-subtle": "oklch(0.92 0.04 255)",
        border: "oklch(0.88 0.008 80)",
        "border-strong": "oklch(0.74 0.012 80)",
        "border-focus": "oklch(0.52 0.18 255)",
        "image-outline": "oklch(0 0 0 / 0.1)",
        success: "oklch(0.60 0.17 148)",
        warning: "oklch(0.78 0.16 70)",
        error: "oklch(0.56 0.22 27)",
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "system-ui", "sans-serif"],
        body: ["Figtree", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
        hero: "clamp(2.25rem, 4.5vw, 3.5rem)",
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
      lineHeight: {
        display: "1.1",
        heading: "1.2",
        "heading-loose": "1.3",
        tight: "1.4",
        body: "1.5",
      },
      letterSpacing: {
        tight: "-0.02em",
        normal: "0",
        wide: "0.04em",
        wider: "0.08em",
      },
      spacing: {
        1: "0.25rem",
        2: "0.50rem",
        3: "0.75rem",
        4: "1.00rem",
        5: "1.25rem",
        6: "1.50rem",
        8: "2.00rem",
        10: "2.50rem",
        12: "3.00rem",
        16: "4.00rem",
        card: "1.25rem",
        section: "3.50rem",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px oklch(0 0 0 / 0.04), 0 4px 12px oklch(0 0 0 / 0.06), 0 8px 24px oklch(0 0 0 / 0.04)",
        elevated:
          "0 2px 4px oklch(0 0 0 / 0.05), 0 8px 20px oklch(0 0 0 / 0.09), 0 16px 40px oklch(0 0 0 / 0.06)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
        spring: "cubic-bezier(0.2, 0, 0, 1)",
      },
      transitionDuration: {
        instant: "100ms",
        fast: "150ms",
        chip: "200ms",
        enter: "320ms",
        exit: "180ms",
        panel: "220ms",
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
      },
      opacity: {
        grain: "0.04",
      },
      borderWidth: {
        regular: "1.5px",
        medium: "2px",
      },
      outlineWidth: {
        image: "1px",
      },
      outlineStyle: {
        img: "solid",
      },
      zIndex: {
        base: "0",
        card: "10",
        mersi: "50",
        panel: "100",
        modal: "200",
        tooltip: "300",
      },
    },
  },
  plugins: [],
};

export default config;
