import { defaultPagination, Pagination } from "@/base/query";
import { User } from "@/models";
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

export function formatTime(input: string | number): string {
  let str = String(input).trim();

  if (str.includes(":")) {
    const parts = str.split(":");
    const hour = parts[0].padStart(2, "0");
    const minute = (parts[1] ?? "00").padStart(2, "0");
    return `${hour}:${minute}`;
  }

  const hour = str.padStart(2, "0");
  return `${hour}:00`;
}

export function getDayName(dayNumber: number): string {
  const days: Record<number, string> = {
    1: "Даваа",
    2: "Мягмар",
    3: "Лхагва",
    4: "Пүрэв",
    5: "Баасан",
    6: "Бямба",
    7: "Ням",
  };

  return days[dayNumber] || "";
}
export function getDayNameWithDate(
  dayNumber: number,
  date: Date
): {
  date: string;
  day: string;
} {
  const days: Record<number, string> = {
    1: "Даваа",
    2: "Мягмар",
    3: "Лхагва",
    4: "Пүрэв",
    5: "Баасан",
    6: "Бямба",
    7: "Ням",
  };

  if (dayNumber < 1 || dayNumber > 7) return { date: "", day: "" };

  let today = new Date(date);

  const currentDayISO = today.getDay() === 0 ? 7 : today.getDay(); // 1=Даваа, 7=Ням

  // Яг энэ долоо хоногийн dayNumber-д тааруулах
  const diff = dayNumber - currentDayISO;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);

  // const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(targetDate.getDate()).padStart(2, "0");

  return {
    day: `${days[dayNumber]}`,
    date: `${mm}-${dd}`,
  };
}
export const numberArray = (count: number) => {
  return Array.from({ length: count }, (_, i) => i + 1);
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

export const usernameFormatter = (user: User) => {
  return (
    user.nickname ??
    `${user.lastname && `${firstLetterUpper(user.lastname)}.`}${
      user.firstname ?? ""
    }`
  );
};
export const money = (value: string, currency = "", round = 1) => {
  let v = Math.round(+value / round) * round;
  return `${currency}${v
    .toString()
    .replaceAll(",", "")
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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
  if (pagination.limit) {
    params.append("limit", String(limit));
    params.append("page", String(page));
    params.append("sort", String(sort));
  }

  // Other filters
  Object.entries(filtersOnly).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value == "" ? "" : value));
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

export function getPaginationRange(
  current: number,
  total: number
): (number | "...")[] {
  const delta = 1; // current-ийг тойрсон хуудасны тоо
  const range: (number | "...")[] = [];

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 || // эхний
      i === total || // сүүлийн
      (i >= current - delta && i <= current + delta) // current орчмын 3 хуудас
    ) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }

  return range;
}
