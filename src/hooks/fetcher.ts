import { find } from "@/app/(api)";
import { Pagination } from "@/base/query";
import { API } from "@/utils/api";

export const fetcher = <T>(uri: keyof typeof API, p?: Pagination) =>
  find<T>(uri, p).then((res) => res.data);
