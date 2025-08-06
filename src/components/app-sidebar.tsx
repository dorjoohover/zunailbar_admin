"use client";

import {
  ChevronUp,
  LayoutDashboard,
  ArrowLeftRight,
  CircleDollarSign,
  User,
  Wallet,
  SquareUserRound,
  Milk,
  ShieldUserIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { TooltipContent, TooltipTrigger, Tooltip } from "./ui/tooltip";

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
    children: [
      {
        title: "Ажилтан нэмэх",
        icon: SquareUserRound,
        onClick: () => console.log("add emp"),
      },
      {
        title: "Ажилтаны мэдээлэл засах",
        icon: SquareUserRound,
        onClick: () => console.log("set emp"),
      },
      {
        title: "Олгосон бүтээгдэхүүн харах",
        icon: SquareUserRound,
        url: "/employees/product",
      },
      {
        title: "Бүтээгдэхүүн олгох",
        icon: SquareUserRound,
        onClick: () => console.log("give pro to emp"),
      },
      {
        title: "Ажилтны үйлчилгээ харах",
        icon: SquareUserRound,
        url: "/employees/service",
      },
      {
        title: "Ажилтны үйлчилгээ нэмэх",
        icon: SquareUserRound,
        onClick: () => console.log("add service to emp"),
      },
    ],
  },
  {
    title: "Бүтээгдэхүүн",
    url: "/products",
    icon: Milk,
    children: [
      {
        title: "Бүтээгдэхүүн нэмэх",
        onClick: () => console.log("add pro"),
        icon: Milk,
      },
      {
        title: "Борлуулалт",
        url: "/products/transaction",
        icon: Milk,
      },
      {
        title: "Хэрэглээ",
        url: "/products/usage",
        icon: Milk,
      },
    ],
  },
  {
    title: "Захиалга",
    url: "/orders",
    icon: CircleDollarSign,
    // children: [],
  },

  {
    title: "Үйлчилгээ",
    url: "/servises",
    icon: ArrowLeftRight,
    children: [
      {
        title: "Үйлчилгээ нэмэх",
        onClick: () => console.log("add service"),
        icon: Milk,
      },
      {
        title: "Ажилчдын үйлчилгээ",
        url: "/services/employee",
        icon: Milk,
      },
      {
        title: "Ажилчдын үйлчилгээ нэмэх",
        onClick: () => console.log("add service to emp"),
        icon: Milk,
      },
      {
        title: "Урамшуулал нэмэх",
        onClick: () => console.log("add discount"),
        icon: Milk,
      },
    ],
  },
  {
    title: "Хэрэглэгчид",
    url: "/users",
    icon: User,
    children: [
      {
        title: "Хэрэглэгчийн хөнгөлөлт",
        url: "/users/voucher",
        // onClick: () => console.log("voucher discount"),
        icon: Milk,
      },
      {
        title: "Хэрэглэчид хөнгөлөлт өгөх",
        onClick: () => console.log("give voucher to user"),
        icon: Milk,
      },
    ],
  },
  {
    title: "Цагийн хуваарь",
    url: "/schedules",
    icon: User,
    children: [
      {
        title: "Нэгдсэн хуваарь",
        url: "/schedules/combined",
        // onClick: () => console.log("voucher discount"),
        icon: Milk,
      },
      {
        title: "Ажилчдын цагийн хуваарь",
        url: "/schedules/employee",
        // onClick: () => console.log("voucher discount"),
        icon: Milk,
      },
      {
        title: "Ажилчдын хуваарь нэмэх",
        onClick: () => console.log("give voucher to user"),
        icon: Milk,
      },
    ],
  },

  {
    title: "Цалин",
    url: "/salaries",
    icon: Wallet,
    children: [
      {
        title: "Цалингийн статус солих",
        onClick: () => console.log("set status salary"),
        icon: Milk,
      },
      {
        title: "Цалингийн лог үүсгэх",
        onClick: () => console.log("give voucher to user"),
        icon: Milk,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/logout").then((d) => router.push("/login"));
  };
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="relative">
      <SidebarTrigger className="absolute top-1.5 -right-8 z-50" />
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              size={"logo"}
              className="pointer-events-none px-0 py-2"
            >
              <Image
                src={"/logo.png"}
                alt="logo"
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
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
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="text-slate-500 hover:text-blue-600"
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        isActive={item.url == pathname ? true : false}
                        size={"lg"}
                      >
                        <Link
                          key={item.url}
                          href={item.url}
                          className={cn(item.url == pathname && "text-sky-600")}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {item?.children?.map((child, i) => {
                      return (
                        <CollapsibleContent key={i} className="w-full">
                          <SidebarMenuSub className="w-full">
                            <SidebarMenuSubItem className="w-full">
                              {child.url && (
                                <SidebarMenuSubButton
                                  asChild
                                  className="w-full"
                                  isActive={child.url == pathname}
                                >
                                  <Link
                                    href={child.url}
                                    className={cn(
                                      child.url == pathname && "text-sky-600 ",
                                      "w-full justify-between"
                                    )}
                                  >
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="truncate max-w-[200px] cursor-default">
                                          {child.title}
                                        </div>
                                      </TooltipTrigger>
                                      <child.icon />

                                      <TooltipContent>
                                        {child.title}
                                      </TooltipContent>
                                    </Tooltip>
                                  </Link>
                                </SidebarMenuSubButton>
                              )}
                              {child.onClick && (
                                <SidebarMenuSubButton>
                                  <Button
                                    size={"icon"}
                                    className={
                                      "w-full justify-between  px-0 mx-0 text-inherit hover:bg-transparent"
                                    }
                                    variant="ghost"
                                    onClick={child.onClick}
                                  >
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="truncate max-w-[200px] cursor-default">
                                          {child.title}
                                        </div>
                                      </TooltipTrigger>
                                      <child.icon />

                                      <TooltipContent>
                                        {child.title}
                                      </TooltipContent>
                                    </Tooltip>
                                  </Button>
                                </SidebarMenuSubButton>
                              )}
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      );
                    })}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </Collapsible>
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
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
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
