"use client";

import {
  ChevronUp,
  LayoutDashboard, ClipboardCheck, Wallet,
  SquareUserRound,
  Milk,
  ShieldUserIcon,
  ChevronRight, UsersRound,
  UserRound,
  HandCoins,
  CalendarRange
} from "lucide-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useSidebarStore } from "@/stores/sidebar.store";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

// Menu items.
export const items = [
  {
    title: "Хянах самбар",
    url: "/dashboard",
    // icon: GraphIcon,
    icon: LayoutDashboard,
  },
  {
    title: "Ажилчид",
    url: "",
    icon: UserRound,
    children: [
      {
        title: "Ажилчдын удирдлага",
        icon: SquareUserRound,
        url: "/employees",
      },
      // {
      //   title: "Ажилтан нэмэх",
      //   icon: SquareUserRound,
      //   id: MODAL_ACTION.add_emp,
      // },
      {
        title: "Ажилчдад олгосон бүтээгдэхүүн",
        icon: SquareUserRound,
        url: "/employees/product",
      },
      {
        title: "Ажилтны хийдэг үйлчилгээ",
        icon: SquareUserRound,
        url: "/employees/service",
      },
      {
        title: "Ажилтны чөлөө авах хүсэлт",
        icon: SquareUserRound,
        url: "/employees/free",
      },
    ],
  },
  {
    title: "Бүтээгдэхүүн",
    url: "",
    icon: Milk,
    children: [
      {
        title: "Бүтээгдэхүүний удирдлага",
        url: "/products",
        icon: Milk,
      },
      {
        title: "Бүтээгдэхүүний хэрэглээ",
        url: "/products/transaction",
        icon: Milk,
      },
      {
        title: "Худалдаж авсан түүх",
        url: "/products/history",
        icon: Milk,
      },
      {
        title: "Агуулах",
        url: "/products/warehouse",
        icon: Milk,
      },
      {
        title: "Хэрэглээний зардал",
        url: "/products/cost",
        icon: Milk,
      },
    ],
  },
  {
    title: "Захиалга",
    url: "",
    icon: ClipboardCheck,
    children: [
      {
        title: "Захиалгын удирдлага",
        url: "/orders",
        icon: Milk,
      },
    ],
  },

  {
    title: "Үйлчилгээ",
    url: "",
    icon: HandCoins,
    children: [
      {
        title: "Үйлчилгээний удирдлага",
        url: "/services",
        icon: Milk,
      },
      {
        title: "Үйлчилгээний урамшуулал",
        url: "/services/discount",
        icon: Milk,
      },
    ],
  },
  {
    title: "Хэрэглэгчид",
    url: "",
    icon: UsersRound,
    children: [
      {
        title: "Хэрэглэгчдийн удирдлага",
        url: "/users",
        icon: Milk,
      },
      {
        title: "Хэрэглэгчийн хөнгөлөлт",
        url: "/users/voucher",
        icon: Milk,
      },
    ],
  },
  {
    title: "Цагийн хуваарь",
    url: "",
    icon: CalendarRange,
    children: [
      {
        title: "Цагийн хуваарийн удирдлага",
        url: "/booking",
        icon: Milk,
      },
      {
        title: "Ажилчдын цагийн хуваарь",
        url: "/booking/employee",
        icon: Milk,
      },
    ],
  },

  {
    title: "Цалин",
    url: "",
    icon: Wallet,
    children: [
      {
        title: "Цалингийн удирдлага",
        url: "/salaries",
        icon: Milk,
      },
    ],
  },
  {
    label: "Үндсэн удирдлага",
    title: "Үндсэн",
    url: "",
    icon: Wallet,
    children: [
      {
        title: "Сайтны удирдлага",
        url: "/root",
        icon: Milk,
      },
      {
        title: "Ангилал удирдлага",
        url: "/root/category",
        icon: Milk,
      },
      {
        title: "Бранд удирдлага",
        url: "/root/brand",
        icon: Milk,
      },
      {
        title: "Агуулах удирдлага",
        url: "/root/warehouse",
        icon: Milk,
      },
      {
        title: "Хэрэглээний зардал",
        url: "/root/cost",
        icon: Milk,
      },
      {
        title: "Салбар удирдлага",
        url: "/root/branch",
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
  const { value, setValue } = useSidebarStore();
  // const [openIndex, setOpenIndex] = useState(null)
  if (pathname == "/login") return;
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="fixed top-0 backdrop-blur-3xl"
    >
      {/* <SidebarTrigger className="absolute top-1.5 -right-8 z-50" /> */}
      {/* Header */}
      <SidebarHeader className="border-b border-slate-600">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              size={"logo"}
              className="pointer-events-none px-0 py-2 text-white"
            >
              <Image
                src={"/logo.png"}
                alt="logo"
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
              <span className="font-bold">Zu Nailbar</span>
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
              {items.map((item) => {
                // Collapsible shalgah
                const hasChildren = !!item.children?.length;
                return (
                  <Collapsible key={item.title} className="group/collapsible">
                    <SidebarMenuItem className="text-white ">
                      {hasChildren ? (
                        <CollapsibleTrigger asChild>
                          {/* group-data-[state=open]/collapsible:bg-white/15  Collapse active uyd bh background*/}
                          {/* hover:bg-white/20 Active bish uyd hoverdohod */}
                          <SidebarMenuButton asChild isActive={item.url == pathname ? true : false} size={"lg"} className="active:bg-white/20 hover:bg-white/20">
                            <div>
                              <item.icon />
                              <span>{item.title}</span>
                              {item?.children && (
                                // Chevron
                                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                              )}
                            </div>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          size="lg"
                          isActive={item.url === pathname ? true : false}
                          className="hover:bg-white/20"
                        >
                          <Link
                            href={item.url}
                            className={cn(
                              item.url === pathname && "text-sky-600"
                            )}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}

                      <CollapsibleContent>
                        {item?.children?.map((child, i) => {
                          return (
                            <SidebarMenuSub className="w-full" key={i}>
                              <SidebarMenuSubItem className="w-full">
                                {child.url && (
                                  <SidebarMenuSubButton asChild className="active:bg-white/20 text-white" isActive={child.url == pathname}>
                                    <Link href={child.url} className={cn(child.url == pathname && "text-sky-600 ", "w-full justify-between px-0")}>
                                      {child.title}
                                    </Link>
                                  </SidebarMenuSubButton>
                                )}
                                {/* {"id" in child && (
                                  <SidebarMenuSubButton>
                                    <Button
                                      // size={"icon"}
                                      className={
                                        "w-full justify-between px-0 mx-0 hover:bg-transparent"
                                      }
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.preventDefault();

                                        if (value != child.title) {
                                          setValue(child.id);
                                        }
                                      }}
                                    >
                                      {child.title}
                                    </Button>
                                  </SidebarMenuSubButton> 
                                )}*/}
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          );
                        })}
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-slate-600">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size={"lg"} className="text-white hover:bg-white/20">
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
