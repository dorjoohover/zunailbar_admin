import { DataTable } from "@/components/data-table";
import { columns } from "./components/columns";
import ContainerHeader from "@/components/containerHeader";

export default function UsersPage() {
  return (
    <section>
      <ContainerHeader title="Гүйлгээ" />
      <div className="admin-container"></div>
    </section>
  );
}
