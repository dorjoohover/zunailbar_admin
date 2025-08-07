export enum METHOD {
  get = "GET",
  post = "POST",
  put = "PUT",
  patch = "PATCH",
  delete = "DELETE",
}
const BASE = process.env.API
  ? process.env.API?.endsWith("/")
    ? process.env.API
    : process.env.API + "/"
  : "http://localhost:4000/api/v1/";
// : "http://srv654666.hstgr.cloud:4000/api/v1/";

export enum Api {
  login = "login",
  register = "register",
  user = "user",
  user_product = "user_product",
  branch = "branch",
  file = "file",
  category = "category",
  product = "product",
  upload = "upload",
}

export const API = {
  [Api.login]: BASE + "login",
  [Api.register]: BASE + "register",
  [Api.user]: BASE + "user",
  [Api.product]: BASE + "product",
  [Api.file]: BASE + "file",
  [Api.user_product]: BASE + "user_product",
  [Api.branch]: BASE + "branch",
  [Api.upload]: BASE + "upload",
  [Api.category]: BASE + "category",
};

export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
