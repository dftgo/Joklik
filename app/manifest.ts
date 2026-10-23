import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "מחולל בדיחות AI",
    short_name: "מחולל בדיחות",
    description: "הכנס נושא וקבל בדיחה מצחיקה",
    lang: "he",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFF8E7",
    theme_color: "#FFF8E7",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
