"use server";

import { ILoginUser, IRegisterUser } from "@/models";
import { API, METHOD } from "@/utils/api";

export const login = async (dto: ILoginUser) => {
  const res = await fetch(`${process.env.API}${API.login}`, {
    cache: "no-store",
    method: METHOD.post,
    body: JSON.stringify(dto),
  });
  console.log(res);
  if (!res.ok) throw new Error("Failed to fetch");

  return res.json();
};

export const register = async (dto: IRegisterUser) => {
  const res = await fetch(`${process.env.API}${API.register}`, {
    cache: "no-store",
    method: METHOD.post,
    body: JSON.stringify(dto),
  });

  if (!res.ok) throw new Error("Failed to fetch");

  return res.json();
};
