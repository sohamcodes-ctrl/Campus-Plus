import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Plus — Complaint & Grievance System",
  description: "Enterprise grievance resolution platform for academic institutions",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
