"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IUser } from "@/models/user.model";
import { useState } from "react";

export default function AddUserForm() {
  const [payload, setPayload] = useState<IUser | undefined>(undefined);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const { insertedId } = await res.json();
      setMsg(`Хэрэглэгч амжилттай нэмэгдлээ (ID: ${insertedId})`);
      setPayload(undefined);
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
        value={payload?.name}
        placeholder="name"
        onChange={(e) => changeValue("name", e.target.value)}
      />
      <Label htmlFor="phone">phone</Label>
      <Input
        type="phone"
        id="phone"
        value={payload?.phone}
        placeholder="phone"
        onChange={(e) => changeValue("phone", e.target.value)}
      />
      <Label htmlFor="password">password</Label>
      <Input
        type="password"
        id="password"
        value={payload?.password}
        placeholder="password"
        onChange={(e) => changeValue("password", e.target.value)}
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
