"use client";

import { ROLE } from "@/lib/enum";
import { API, baseUrl } from "@/utils/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Template({
  children,
  token,
}: {
  children: React.ReactNode;
  token?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const deleteCookie = async () => {
    try {
      if (pathname != "/login") {
        await fetch(baseUrl + "/api/logout").then((d) => router.push("/login"));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const me = async () => {
    if (token) {
      try {
        console.log(`${API["user"]}/me`);
        const res = await fetch(`${API["user"]}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          deleteCookie();
        } else {
          data.payload.user.role > ROLE.ADMIN ? deleteCookie() : null;
        }
      } catch (error) {
        console.log("error", error);
        deleteCookie();
      }
    }
  };

  useEffect(() => {
    me();
  }, [token]);

  return <div className="w-full ">{children}</div>;
}
