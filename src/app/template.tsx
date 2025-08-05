"use client";

import { baseUrl } from "@/utils/api";
import { usePathname, useRouter } from "next/navigation";

export default function Template({
  children,
  error,
}: {
  children: React.ReactNode;
  error: boolean;
}) {
  // const pathname = usePathname();
  // const router = useRouter();
  // const deleteCookie = async () => {
  //   try {
  //     if (pathname != "/login") {
    
  //       await fetch(baseUrl + "/api/logout").then((d) => router.push("/login"));
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  // if (error) deleteCookie();
  return <div className="w-full min-h-screen">{children}</div>;
}
