import { defaultPagination, Pagination } from "@/base/query";
import { ListType } from "@/lib/constants";
import { paginationToQuery } from "@/lib/functions";
import { API, METHOD } from "@/utils/api";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";

export const find = async <T,>(
  uri: keyof typeof API,
  p: Pagination = {},
  route?: string
): Promise<ListType<T>> => {
  const store = await cookies();
  const token = store.get("token")?.value;
  const branch = store.get("branch_id")?.value;
  const merchant = store.get("merchant_id")?.value;

  const merged: Pagination = {
    ...defaultPagination,
    ...p,
  };

  const url = paginationToQuery(uri, merged, route);

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "branch-id": branch || "",
      "merchant-id": merchant || "",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }

  return (await res.json()).payload;
};
export const findOne = async (
  uri: keyof typeof API,
  id: string,
  route?: string
) => {
  const store = await cookies();
  const token = store.get("token")?.value;
  const branch = store.get("branch_id")?.value;
  const merchant = store.get("merchant_id")?.value;
  const url = `${API[uri as keyof typeof API]}${
    route ? `/${route}/` : "/"
  }${id}`;
  console.log(merchant, "branch", branch);
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "branch-id": branch || "",
      "merchant-id": merchant || "",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }

  return await res.json();
};
export const deleteOne = async (
  uri: keyof typeof API,
  id: string,
  route?: string
) => {
  const store = await cookies();
  const token = store.get("token")?.value;
  const branch = store.get("branch_id")?.value;
  const merchant = store.get("merchant_id")?.value;
  const url = `${API[uri as keyof typeof API]}${
    route ? `/${route}/` : "/"
  }${id}`;
  const res = await fetch(url, {
    cache: "no-store",
    method: METHOD.delete,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "branch-id": branch || "",
      "merchant-id": merchant || "",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }

  return await res.json();
};
export const updateOne = async <T,>(
  uri: keyof typeof API,
  id: string,
  body: T,
  route?: string
): Promise<any> => {
  const store = await cookies();
  const token = store.get("token")?.value;
  const branch = store.get("branch_id")?.value;
  const merchant = store.get("merchant_id")?.value;

  const url = `${API[uri]}${route ? `/${route}` : ""}/${id}`;

  const res = await fetch(url, {
    cache: "no-store",
    method: METHOD.patch,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      "branch-id": branch || "",
      "merchant-id": merchant || "",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }

  return await res.json();
};
