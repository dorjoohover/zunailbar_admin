export enum METHOD {
  get = "GET",
  post = "POST",
  put = "PUT",
  patch = "PATCH",
  delete = "DELETE",
}
const BASE = process.env.API?.endsWith("/")
  ? process.env.API
  : process.env.API + "/";

export enum Api {
  login = "login",
  register = "register",
  user = "user",
  branch = "branch",
  category = "category",
  product = "product",
}

export const API = {
  [Api.login]: BASE + "login",
  [Api.register]: BASE + "register",
  [Api.user]: BASE + "user",
  [Api.product]: BASE + "product",
  [Api.branch]: BASE + "branch",
  [Api.category]: BASE + "category",
};

export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
