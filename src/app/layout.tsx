import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ServicePro – Book Home Services",
  description: "Book trusted home services – cleaning, plumbing, electrical, AC repair & more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
