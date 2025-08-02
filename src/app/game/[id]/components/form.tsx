"use client";
import { IGame } from "@/models/service.model";
import { IUser } from "@/models/user.model";
import { ChooseUsers } from "./choose.user";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TeamType } from "@/lib/enum";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { parseDate } from "@/lib/functions";
import { useRouter } from "next/navigation";

export const GameForm = ({ users, game }: { users: IUser[]; game: IGame }) => {
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
  const router = useRouter();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        users: selectedUsers,
        type: TeamType.PARTNER,
        name: payload.name,
        parent: null,
      }),
    });
    if (res.ok) {
      const { insertedId } = await res.json();
      setMsg(`Team амжилттай нэмэгдлээ (ID: ${insertedId})`);
      const match = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: game._id,
          team: insertedId,
          name: payload.name,
        }),
      });
      if (match.ok) {
        const { insertedId } = await match.json();
        setMsg(`Team амжилттай нэмэгдлээ (ID: ${insertedId})`);
        router.push(`/match/${insertedId}`);
      }
      setSelectedUsers([]);
    } else {
      const err = await res.json();
      setMsg(`Алдаа: ${err.error || res.statusText}`);
    }
  }
  const handlePayload = (key: string, value: string | null) => {
    if (value != null) setPayload((prev) => ({ ...prev, [key]: value }));
  };
  const date = new Date();
  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">{game.name}</h1>
      <p className="mt-2"> {game.maxPerson}</p>
      <Label>Name</Label>
      <div className="flex">
        <Input
          onChange={(e) => handlePayload("name", e.target.value)}
          value={payload.name}
        />
        <Button
          onClick={() => handlePayload("name", `${game.name} ${parseDate()}`)}
        >
          Auto
        </Button>
      </div>
      <ChooseUsers
        users={users}
        toggleUser={toggleUser}
        selectedUsers={selectedUsers}
      />
      <Button type="submit">send</Button>
      {msg && <p>{msg}</p>}
    </form>
  );
};
