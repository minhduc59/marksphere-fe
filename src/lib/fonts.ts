// Catalog of bundled fonts. Keys must match the keys used by the AI service
// (ai-service/app/agents/video_clipper/fonts.py) so the live preview shows
// what the rendered clip will actually look like.
//
// Each entry includes a Google Fonts URL so the preview can render with the
// same family without us needing to ship the TTFs to the frontend.

export interface FontEntry {
  key: string;          // sent to the backend
  label: string;        // shown in the dropdown
  cssFamily: string;    // CSS font-family stack used in the preview
  googleHref?: string;  // optional Google Fonts stylesheet URL
}

export const FONT_CATALOG: FontEntry[] = [
  {
    key: "Inter",
    label: "Inter",
    cssFamily: "'Inter', system-ui, sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
  },
  {
    key: "Roboto",
    label: "Roboto",
    cssFamily: "'Roboto', system-ui, sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
  },
  {
    key: "Anton",
    label: "Anton",
    cssFamily: "'Anton', Impact, sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Anton&display=swap",
  },
  {
    key: "Archivo Black",
    label: "Archivo Black",
    cssFamily: "'Archivo Black', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap",
  },
  {
    key: "Bangers",
    label: "Bangers",
    cssFamily: "'Bangers', cursive",
    googleHref: "https://fonts.googleapis.com/css2?family=Bangers&display=swap",
  },
  {
    key: "Barlow Condensed",
    label: "Barlow Condensed",
    cssFamily: "'Barlow Condensed', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&display=swap",
  },
  {
    key: "Bebas Neue",
    label: "Bebas Neue",
    cssFamily: "'Bebas Neue', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap",
  },
  {
    key: "DM Sans",
    label: "DM Sans",
    cssFamily: "'DM Sans', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap",
  },
  {
    key: "League Spartan",
    label: "League Spartan",
    cssFamily: "'League Spartan', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;700&display=swap",
  },
  {
    key: "Montserrat",
    label: "Montserrat",
    cssFamily: "'Montserrat', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap",
  },
  {
    key: "Nunito Sans",
    label: "Nunito Sans",
    cssFamily: "'Nunito Sans', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700&display=swap",
  },
  {
    key: "Open Sans",
    label: "Open Sans",
    cssFamily: "'Open Sans', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap",
  },
  {
    key: "Oswald",
    label: "Oswald",
    cssFamily: "'Oswald', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap",
  },
  {
    key: "Poppins",
    label: "Poppins",
    cssFamily: "'Poppins', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;800&display=swap",
  },
  {
    key: "Raleway",
    label: "Raleway",
    cssFamily: "'Raleway', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap",
  },
  {
    key: "Rubik",
    label: "Rubik",
    cssFamily: "'Rubik', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Rubik:wght@400;700&display=swap",
  },
  {
    key: "Sora",
    label: "Sora",
    cssFamily: "'Sora', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Sora:wght@400;700&display=swap",
  },
  {
    key: "The Bold Font",
    label: "The Bold Font",
    cssFamily: "'Bebas Neue', Impact, sans-serif",
  },
  {
    key: "TikTok Sans",
    label: "TikTok Sans",
    cssFamily: "'Inter', system-ui, sans-serif",
  },
  {
    key: "Urbanist",
    label: "Urbanist",
    cssFamily: "'Urbanist', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;700&display=swap",
  },
  {
    key: "Work Sans",
    label: "Work Sans",
    cssFamily: "'Work Sans', sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;700&display=swap",
  },
];

export const DEFAULT_FONT_KEY = "Inter";

export function getFontEntry(key: string): FontEntry {
  return FONT_CATALOG.find((f) => f.key === key) ?? FONT_CATALOG[0];
}

export const COLOR_SWATCHES = [
  "#FFFFFF",
  "#000000",
  "#FFD60A",
  "#FF3B30",
  "#FF2D55",
  "#34C759",
  "#0A84FF",
  "#AF52DE",
];
