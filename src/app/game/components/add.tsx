"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function AddGameForm() {
  const [payload, setPayload] = useState({
    startValue: undefined,
    endValue: undefined,
    maxPerson: undefined,
    minPerson: undefined,
    name: undefined,
    must: false,
  });
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const { insertedId } = await res.json();
      setMsg(`Хэрэглэгч амжилттай нэмэгдлээ (ID: ${insertedId})`);
      setPayload({
        endValue: undefined,
        maxPerson: undefined,
        minPerson: undefined,
        name: undefined,
        startValue: undefined,
        must: false,
      });
    } else {
      const err = await res.json();
      setMsg(`Алдаа: ${err.error || res.statusText}`);
    }
  }

  const changeValue = (key: string, value: string | null) => {
    if (value != null) setPayload((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Label htmlFor="name">name</Label>
      <Input
        type="name"
        id="name"
        value={payload.name}
        placeholder="name"
        onChange={(e) => changeValue("name", e.target.value)}
      />
      <Label htmlFor="maxPerson">maxPerson</Label>
      <Input
        type="maxPerson"
        id="maxPerson"
        value={payload.maxPerson}
        placeholder="maxPerson"
        onChange={(e) => changeValue("maxPerson", e.target.value)}
      />
      <Label htmlFor="minPerson">minPerson</Label>
      <Input
        type="minPerson"
        id="minPerson"
        value={payload.minPerson}
        placeholder="minPerson"
        onChange={(e) => changeValue("minPerson", e.target.value)}
      />
      <Label htmlFor="startValue">startValue</Label>
      <Input
        type="startValue"
        value={payload.startValue}
        id="startValue"
        placeholder="startValue"
        onChange={(e) => changeValue("startValue", e.target.value)}
      />
      <Label htmlFor="endValue">endValue</Label>
      <Input
        type="endValue"
        id="endValue"
        value={payload.endValue}
        placeholder="endValue"
        onChange={(e) => changeValue("endValue", e.target.value)}
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
        Хэрэглэгч нэмэх
      </button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
