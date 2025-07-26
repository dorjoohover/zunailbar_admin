import { IUser, User } from "@/models/User";
import { Game, IGame } from "../../../models/Game";
import { notFound } from "next/navigation";
import { ChooseUsers } from "./components/choose.user";
import { GameForm } from "./components/form";

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = (await Game.findById(id)) as IGame;
  const users = (await User.find()) as IUser[];
  if (!game) {
    // render the nearest error.js or throw:
    notFound();
  }

  return (
    <main className="p-8">
      <GameForm game={game} users={users} />
    </main>
  );
}
