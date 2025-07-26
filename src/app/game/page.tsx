import AddGameForm from "./components/add";
import { ChooseGame } from "./components/choose";

export default async function GamesPage() {

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold mb-4">Games</h1>
      <ul className="space-y-2">
        {/* {games.map((game, i) => (
          <ChooseGame key={i} game={game} />
        ))} */}
      </ul>
      <AddGameForm />
    </main>
  );
}
