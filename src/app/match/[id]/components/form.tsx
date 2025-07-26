"use client";
import { IGame } from "@/models/Game";
import { IUser } from "@/models/User";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TeamType } from "@/lib/enum";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { parseDate } from "@/lib/functions";
import { IMatch } from "@/models/Match";
import AddMatchForm from "./add";

export const MatchForm = ({
  match,
  users,
  game,
  id,
}: {
  users: IUser[];
  match: IMatch;
  game: IGame;
  id: string;
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [payload, setPayload] = useState({
    name: undefined,
  });

  const toggleUser = (id: string, checked: boolean) => {
    setSelectedUsers(
      (prev) =>
        checked
          ? [...prev, id] // add when checked
          : prev.filter((uId) => uId !== id) // remove when unchecked
    );
  };
  const [msg, setMsg] = useState("");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        users: selectedUsers,
        type: TeamType.PARTNER,
        name: payload.name,
      }),
    });
    if (res.ok) {
      const { insertedId } = await res.json();
      setMsg(`Match амжилттай нэмэгдлээ (ID: ${insertedId})`);
    } else {
      const err = await res.json();
      setMsg(`Алдаа: ${err.error || res.statusText}`);
    }
  }
  const handlePayload = (key: string, value: string | null) => {
    if (value != null) setPayload((prev) => ({ ...prev, [key]: value }));
  };
  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">{match.name}</h1>
      <AddMatchForm game={game} parent={id} />
      <Button type="submit">send</Button>
      {msg && <p>{msg}</p>}
    </form>
  );
};
