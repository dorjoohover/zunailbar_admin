"use server";
import { IProduct } from "@/models";
import { API, METHOD } from "@/utils/api";
import { cookies } from "next/headers";

export const addProduct = async (dto: IProduct) => {
  const res = await fetch(`${API.product}`, {
    cache: "no-store",
    method: METHOD.post,
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Failed to fetch");

  return res.json();
};

export const searchProduct = async (id: string) => {
  const token = (await cookies()).get("token")?.value;
  const res = await fetch(`${API.product}/search?id=${id}`, {
    cache: "no-store",
    method: METHOD.get,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch");

  return res.json();
};
