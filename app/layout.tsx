import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Service Request Workspace",
  description: "Department technology support workspace for service intake, request review, notes, resolution tracking, and reporting."
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
