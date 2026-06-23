import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internal Service Request System",
  description: "Lightweight operations tracker for internal service requests, access changes, onboarding, notes, and reporting."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
