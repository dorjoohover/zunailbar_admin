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
  service = "service",
  schedule = "schedule",
  booking = "booking",
  voucher = "voucher",
  user_service = "user_service",
  product = "product",
  product_transaction = "product_transaction",
  product_transaction_admin = "product_transaction_admin",
  product_log = "product_log",
  brand = "brand",
  upload = "upload",
}

export const API = {
  [Api.login]: BASE + "login",
  [Api.register]: BASE + "register",
  [Api.user]: BASE + "user",
  [Api.product]: BASE + "product",
  [Api.booking]: BASE + "booking",
  [Api.voucher]: BASE + "voucher",
  [Api.service]: BASE + "service",
  [Api.file]: BASE + "file",
  [Api.schedule]: BASE + "schedule",
  [Api.user_service]: BASE + "user_service",
  [Api.brand]: BASE + "brand",
  [Api.user_product]: BASE + "user_product",
  [Api.product_transaction]: BASE + "product_transaction",
  [Api.product_transaction_admin]: BASE + "product_transaction" + "/admin",
  [Api.product_log]: BASE + "product_log",
  [Api.branch]: BASE + "branch",
  [Api.upload]: BASE + "upload",
  [Api.category]: BASE + "category",
};

export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
