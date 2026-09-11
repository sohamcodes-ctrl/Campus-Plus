import type { Metadata } from "next";
import { AuthProvider } from "@/presentation/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Plus — Complaint & Grievance System",
  description: "Enterprise grievance resolution platform for academic institutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
