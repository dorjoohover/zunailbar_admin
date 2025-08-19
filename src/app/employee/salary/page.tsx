import DynamicHeader from "@/components/dynamicHeader";
import React from "react";

export default function Page() {
  return (
    <section>
      <div className="w-full relative">
        <DynamicHeader />
        <div className="admin-container">
          <h1 className="text-xl font-semibold">Олгогдоогүй цалин</h1>
        </div>
      </div>
    </section>
  );
}
