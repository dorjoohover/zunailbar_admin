import { notFound } from "next/navigation";
import { ChooseUsers } from "./components/choose.user";
import { GameForm } from "./components/form";

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="p-8">
      {/* <GameForm game={game} users={users} /> */}
    </main>
  );
}
