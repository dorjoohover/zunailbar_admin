"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ROLE } from "@/lib/enum";
import { API } from "@/utils/api";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Template({
  children,
  token,
}: {
  children: React.ReactNode;
  token?: string;
}) {
  const pathname = usePathname();
  const deleteCookie = async () => {
    try {
      if (pathname != "/login") {
        // router.push (soft navigation) Router Cache-с шалтгаалан заримдаа
        // шууд гарахгүй үлддэг тул бодит full-reload хийж /login рүү явна.
        await fetch("/api/logout");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error(error);
    }
  };
  const me = async () => {
    if (token) {
      try {
        const res = await fetch(`${API["user"]}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) {
          // Токены хугацаа дуусах/буруу болох (401) үед автоматаар гаргана.
          // Бусад алдаа (сервер тасалдал гэх мэт)-д хэрэглэгчийг гаргахгүй.
          if (res.status === 401) {
            void deleteCookie();
          }
        } else {
          if (data.payload.user.role > ROLE.ADMIN) {
            void deleteCookie();
          }
        }
      } catch (error) {
        console.error("error", error);
        // deleteCookie();
      }
    }
  };

  useEffect(() => {
    void me();
  }, [token]);

  return (
    <div className="w-full max-w-screen">
      {pathname != "/login" && <SidebarTrigger />}

      {children}
    </div>
  );
}
