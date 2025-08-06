import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

import { AppSidebar } from "@/components/app-sidebar";
import Template from "./template";
import { cookies, headers } from "next/headers";
import { API } from "@/utils/api";
import ModalContainer from "@/components/modal/modal.container";
import { ROLE } from "@/lib/enum";
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

  return (
    <SidebarProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <AppSidebar />
          <SidebarTrigger className="absolute top-0 left-0 z-50" />
          <Template token={token}>
            {/* <Navbar /> */}
            <Toaster />
            {children}
            <ModalContainer />
            {/* <Footer /> */}
          </Template>
        </body>
      </html>
    </SidebarProvider>
  );
}
