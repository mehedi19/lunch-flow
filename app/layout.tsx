import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LunchFlow Pro - Office Lunch Management System",
  description: "Enterprise office meal counter, category pricing, and monthly accounting system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
