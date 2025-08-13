import ContainerHeader from "@/components/containerHeader";
import DynamicHeader from "@/components/dynamicHeader";
import React from "react";

export default function SalariesPage() {
  return (
    <section>
      <DynamicHeader count={0} />
      <div className="admin-container"></div>
    </section>
  );
}
