// STABLE_BUILD_TRIGGER: 1.6.4
// Build Version: 1.0.9 - Notification Update v1.6.4
import type { Metadata } from "next";
import { Cairo, Tajawal, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Zamalek Academy - Gharbia (v1.0.9)",
  description: "Management System for Zamalek Football Academy Branches in Gharbia. v1.0.9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cn(tajawal.variable, cairo.variable, "font-sans", geist.variable)}>
      <body className="antialiased bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
