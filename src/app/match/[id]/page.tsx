import { IUser, User } from "@/models/User";
import { Match, IMatch } from "../../../models/Match";
import { notFound } from "next/navigation";
import { MatchForm } from "./components/form";
import { Document } from "mongoose";
import { Game, IGame } from "@/models/Game";
export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await Match.findById(id);
  const game = match?.game != null ? await Game.findById(match.game) : null;
  const users = (await User.find()) as IUser[];
  if (!match) {
    // render the nearest error.js or throw:
    notFound();
  }

  return (
    <main className="p-8">
      <MatchForm match={match} users={users} game={game} id={id} />
    </main>
  );
}
