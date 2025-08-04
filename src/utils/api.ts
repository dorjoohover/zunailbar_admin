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
  product = "product",
}

export const API = {
  [Api.login]: BASE + "login",
  [Api.register]: BASE + "register",
  [Api.user]: BASE + "user",
  [Api.product]: BASE + "product",
};
