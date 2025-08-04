import { IProduct } from "@/models";
import { API, METHOD } from "@/utils/api";

export const addProduct = async (dto: IProduct) => {
  const res = await fetch(`${API.product}`, {
    cache: "no-store",
    method: METHOD.post,
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Failed to fetch");

  return res.json();
};
