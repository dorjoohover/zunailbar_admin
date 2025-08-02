"use client";
import { Button } from "@/components/ui/button";
import { IGame } from "@/models/service.model";
import { IUser } from "@/models/user.model";
import Link from "next/link";
import { useState } from "react";

export const ChooseUsers = ({
  users,
  toggleUser,
  selectedUsers,
}: {
  users: IUser[];
  toggleUser: (id: string, check: boolean) => void;
  selectedUsers: string[];
}) => {
  return (
    <div>
      {users.map((user) => {
        const isChecked = selectedUsers.includes(user._id);

        return (
          <label key={user._id} style={{ display: "block", cursor: "pointer" }}>
            <input
              type="checkbox"
              id={user._id}
              checked={isChecked}
              onChange={(e) => toggleUser(user._id, e.target.checked)}
            />{" "}
            {user.name}
          </label>
        );
      })}

      {/* Example: show selected IDs */}
      <pre>Selected: {JSON.stringify(selectedUsers, null, 2)}</pre>
    </div>
  );
};
