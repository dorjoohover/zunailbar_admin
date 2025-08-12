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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const defaultOpen = store.get("sidebar_state")?.value === "false"
  
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[url(/zu-bg-2.png)]`}
        >
          <AppSidebar />
          <main className="relative size-full p-2 pl-0 min-h-screen">
            <ScrollArea className="rounded-xl overflow-hidden size-full bg-white h-[calc(100vh-1rem)] fixed top-0 left-0 ml-1">
              <SidebarTrigger />

              <Template token={token}>
                {/* <Navbar /> */}
                <Toaster />
                {children}
                {/* <Footer /> */}
              </Template>
            </ScrollArea>
          </main>
          <ModalContainer />
        </body>
      </html>
    </SidebarProvider>
  );
}
