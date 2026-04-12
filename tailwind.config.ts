import type { Config } from "tailwindcss";

/**
 * OasisXVII Admin — Design Token Config
 * "Streetwear x Viticulture" / "The Underground Sommelier"
 *
 * Extends the brand palette from Oasis_XVII storefront into the admin UI.
 * shadcn semantic tokens (--primary, --card, etc.) are defined in globals.css.
 * This config adds named brand utilities on top: bg-wine, text-on-surface, etc.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Brand Colors ────────────────────────────────────────────────────────
      colors: {
        // Surface hierarchy — "The Layering Principle"
        "surface-void":    "#0E0E13", // deepest void (sidebar bg)
        "surface-base":    "#0F0F14", // page background
        "surface":         "#131318", // card / panel surface
        "surface-low":     "#1B1B20", // muted / hover states
        "surface-mid":     "#18181F", // inputs
        "surface-high":    "#22222B", // accent / secondary
        "surface-highest": "#2D2D38", // overlay highlights

        // Primary — Deep Wine
        wine:             "#4A0F27",
        "wine-container": "#5D111F",
        "wine-glow":      "#8A1A49", // glow source, used for ring/active
        "wine-hover":     "#B21E42",
        "wine-accent":    "#FF2D6F", // neon, use sparingly

        // Text
        "on-surface":        "#E4E1E9", // primary text
        "on-surface-muted":  "#A0A0B0", // secondary text

        // Outline
        "outline-faint": "#34343D",

        // Error
        "brand-error": "#FF716C",
      },

      // ─── Box Shadows ─────────────────────────────────────────────────────────
      // No grey shadows — all depth is wine-tinted.
      boxShadow: {
        "wine-glow":       "0 0 40px rgba(138, 26, 73, 0.4)",
        "wine-glow-hover": "0 0 50px rgba(178, 30, 66, 0.5)",
        "wine-ambient":    "0 0 40px rgba(74, 15, 39, 0.08)",
      },

      // ─── Typography ──────────────────────────────────────────────────────────
      fontFamily: {
        headline: ["var(--font-headline)", "Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
