"use client";

import { ChevronUp, LayoutDashboard, ArrowLeftRight, CircleDollarSign, User, Wallet, SquareUserRound, Milk, ShieldUserIcon } from "lucide-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Menu items.
const items = [
  {
    title: "Хянах самбар",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Ажилчид",
    url: "/employees",
    icon: SquareUserRound,
  },
  {
    title: "Бараа",
    url: "/products",
    icon: Milk,
  },
  {
    title: "Нэхэмжлэх",
    url: "/invoices",
    icon: CircleDollarSign,
  },
  {
    title: "Гүйлгээ",
    url: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Хэрэглэгчид",
    url: "/customers",
    icon: User,
  },
  {
    title: "Цалин",
    url: "/salaries",
    icon: Wallet,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton size={"logo"} className="pointer-events-none px-0 py-2">
              <Image src={"/logo.png"} alt="logo" width={40} height={40} className="rounded-lg object-cover" />
              <span className="text-slate-800 font-bold">Zu Nailbar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Админ талбар</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="text-slate-500 hover:text-blue-600">
                  <SidebarMenuButton asChild isActive={item.url == pathname ? true : false} size={"lg"}>
                    <Link key={item.url} href={item.url} className={cn(item.url == pathname && "text-sky-600")}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size={"lg"}>
                    <ShieldUserIcon /> Админ
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Гарах</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
