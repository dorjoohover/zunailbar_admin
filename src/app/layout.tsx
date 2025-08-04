import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AppSidebar } from "@/components/app-sidebar";
import { cookies, headers } from "next/headers";
import { API } from "@/utils/api";
import Template from "./template";
// Mongoose bhgu bnshu
// import connect from '../lib/mongoose';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZU Nailbar",
  description: "Nail salon template built with Next.js and Tailwind CSS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await cookies();
  const token = store.get("token")?.value;

  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${API["user"]}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  let error = false;
  if (!res.ok) {
    error = true;
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Template error={error}>
            {" "}
            {/* <Navbar /> */}
            <SidebarTrigger />
            <Toaster />
            {children}
            {/* <Footer /> */}
          </Template>
        </body>
      </html>
    </SidebarProvider>
  );
}
