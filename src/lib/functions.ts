import { defaultPagination, Pagination } from "@/base/query";
import { Api, API } from "@/utils/api";
import { Dispatch, SetStateAction } from "react";

const formatDate = (value: string, limit = 10) => {
  return parseInt(value) < limit ? `0${value}` : `${value}`;
};
export const parseDate = (date = new Date(), isHour = true) => {
  const year = date.getFullYear();
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  let hour = date.getHours().toString();
  let minute = date.getMinutes().toString();
  let second = date.getSeconds().toString();
  month = formatDate(month);
  day = formatDate(day);
  hour = formatDate(hour);
  minute = formatDate(minute);
  second = formatDate(second);
  return `${year}/${month}/${day}${
    isHour ? ` ${hour}:${minute}:${second}` : ""
  }`;
};

export const changeValue = (
  set: Dispatch<
    SetStateAction<{
      team_1: undefined;
      team_2: undefined;
      name: undefined;
    }>
  >,
  key: string,
  value: string | null
) => {
  if (value != null) set((prev) => ({ ...prev, [key]: value }));
};

export const mobileFormatter = (mobile: string) => {
  return mobile ? mobile.replace("+976", "") : "";
};

export function paginationToQuery(
  uri: string,
  pagination: Pagination,
  route?: string
): string {
  const { limit, page, sort } = { ...defaultPagination, ...pagination };
  const filtersOnly = { ...pagination };
  delete filtersOnly.limit;
  delete filtersOnly.page;
  delete filtersOnly.sort;
  const url = API[uri as keyof typeof API];
  const params = new URLSearchParams();

  // Default pagination values
  params.append("limit", String(limit));
  params.append("page", String(page));
  params.append("sort", String(sort));

  // Other filters
  Object.entries(filtersOnly).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return `${url}${route ? `/${route}` : ""}${
    queryString ? `?${queryString}` : ""
  }`;
}

export const firstLetterUpper = (value: string) => {
  if (value.length == 0) return value;
  return `${value.substring(0, 1).toUpperCase()}${value.substring(1)}`;
};
