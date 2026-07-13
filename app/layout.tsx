import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Herond Point — Lottery Ticket",
  description:
    "Check in daily, earn tickets, and win a share of the $10,000 Season 1 lottery pool with Herond Point.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
