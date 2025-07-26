import connect from "@/lib/mongoose";
import { Game } from "@/models/Game";

export default async function GamesPage() {
  await connect();
  const games = await Game.find();

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold mb-4">Games</h1>
    </main>
  );
}
