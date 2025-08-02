import ContainerHeader from "@/components/containerHeader";
import AddUserForm from "./components/add";

export default async function GamesPage() {
  return (
    <main className="p-8">
      <ul className="space-y-2">
        {/* {users.map((game, i) => (
          <li key={i}>{game.name}</li>
        ))} */}
      </ul>
      <AddUserForm />
    </main>
  );
}
