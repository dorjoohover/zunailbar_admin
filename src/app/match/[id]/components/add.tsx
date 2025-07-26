"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { changeValue } from "@/lib/functions";
import { IGame } from "@/models/Game";
import { useState } from "react";

export default function AddMatchForm({
  game,
  parent,
}: {
  game: IGame;
  parent: string;
}) {
  const [payload, setPayload] = useState({
    team_1: undefined,
    team_2: undefined,
    name: undefined,
  });
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const { insertedId } = await res.json();
      setMsg(`Match амжилттай нэмэгдлээ (ID: ${insertedId})`);
      setPayload({
        team_1: undefined,
        team_2: undefined,
        name: undefined,
      });
    } else {
      const err = await res.json();
      setMsg(`Алдаа: ${err.error || res.statusText}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {JSON.stringify(game)}
      <Label htmlFor="name">name</Label>
      <Input
        type="name"
        id="name"
        value={payload.name}
        placeholder="name"
        onChange={(e) => changeValue(setPayload, "name", e.target.value)}
      />
      <Label htmlFor="name">name</Label>
      <Input
        type="name"
        id="name"
        value={payload.name}
        placeholder="name"
        onChange={(e) => changeValue(setPayload, "name", e.target.value)}
      />
      <Label htmlFor="name">name</Label>
      <Input
        type="name"
        id="name"
        value={payload.name}
        placeholder="name"
        onChange={(e) => changeValue(setPayload, "name", e.target.value)}
      />
      <Label htmlFor="minPerson">minPerson</Label>
      <Switch
        checked={payload.must}
        onCheckedChange={(e) => setPayload((prev) => ({ ...prev, must: e }))}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add
      </button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
