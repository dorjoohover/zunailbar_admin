"use client";
import { Button } from "@/components/ui/button";
import { IGame } from "@/models/Game";
import Link from "next/link";

export const ChooseGame = ({ game }: { game: IGame }) => {
  return (
    <li className="border p-4 rounded ">
      <p>
        <strong>Name:</strong> {game.name}
      </p>
      <p>
        <strong>Max person:</strong> {game.maxPerson}
      </p>
      <p>
        <strong>Min person:</strong> {game.minPerson}
      </p>
      <p>
        <strong>Start Value:</strong> {game.startValue}
      </p>
      <p>
        <strong>End Value:</strong> {game.endValue}
      </p>
      <p>
        <strong>Must:</strong> {game.must == false ? "false" : "true"}
      </p>
      <Button asChild>
        <Link href={`/game/${game._id}`}>Choose</Link>
      </Button>
    </li>
  );
};
