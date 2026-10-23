import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "700"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "מחולל בדיחות AI",
  description: "הכנס נושא וקבל בדיחה מצחיקה",
  applicationName: "מחולל בדיחות",
  appleWebApp: {
    capable: true,
    title: "מחולל בדיחות",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF8E7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
