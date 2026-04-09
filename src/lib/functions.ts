import { defaultPagination, Pagination } from "@/base/query";
import { User } from "@/models";
import { Api, API } from "@/utils/api";
import { Dispatch, SetStateAction } from "react";
import { VALUES } from "./constants";

export const formatDate = (value: string, limit = 10) => {
  if (!value || value == "") return "";
  return parseInt(value) < limit ? `0${value}` : `${value}`;
};
const UB_TIME_ZONE = "Asia/Ulaanbaatar";

const hasExplicitTimeZone = (value: string) =>
  /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value.trim());

const parseLooseDateString = (value: string) => {
  const match = value
    .trim()
    .match(
      /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T](\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?)?/,
    );

  if (!match) return null;

  const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;

  return {
    year,
    month: formatDate(month),
    day: formatDate(day),
    hour: formatDate(hour),
    minute: formatDate(minute),
    second: formatDate(second),
    hasTime: match[4] != null,
  };
};

const formatDateString = (
  value: {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
    second: string;
  },
  isHour: boolean,
) =>
  `${value.year}/${value.month}/${value.day}${
    isHour ? ` ${value.hour}:${value.minute}:${value.second}` : ""
  }`;

const formatDateInUB = (date: Date, isHour: boolean) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: UB_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(isHour
      ? {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }
      : {}),
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return formatDateString(
    {
      year: getPart("year"),
      month: getPart("month"),
      day: getPart("day"),
      hour: getPart("hour"),
      minute: getPart("minute"),
      second: getPart("second"),
    },
    isHour,
  );
};

export const parseDate = (
  value: Date | string | number = new Date(),
  isHour = true,
) => {
  if (value == null || value === "") return "";

  if (typeof value === "string") {
    const parsed = parseLooseDateString(value);

    if (parsed && !hasExplicitTimeZone(value)) {
      return formatDateString(parsed, isHour && parsed.hasTime);
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return formatDateInUB(date, isHour);
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

export const objectCompact = <T extends Record<string, any>>(v: T) =>
  Object.fromEntries(
    Object.entries(v).filter(
      ([, val]) =>
        !(val == null || (typeof val === "string" && val.trim() === "")),
    ),
  ) as Partial<T>;

export const round = (value: number, l = 2) => {
  const res = Math.round(value * Math.pow(10, l)) / Math.pow(10, l);
  return res;
};

export function getDayName(dayNumber: number): string {
  const days: Record<number, string> = {
    1: "Даваа",
    2: "Мягмар",
    3: "Лхагва",
    4: "Пүрэв",
    5: "Баасан",
    6: "Бямба",
    0: "Ням",
    7: "Ням",
  };

  return days[dayNumber] || "";
}

export const mnDateStr = (now = new Date()): string => {
  const ubDate = new Intl.DateTimeFormat(undefined, {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(now));
  return ubDate;
};
export const mnDate = (now = new Date()): Date => {
  const ubOffset = 8 * 60;
  const utc = now?.getTime() + now.getTimezoneOffset() * 60000;
  const ubTime = utc + ubOffset * 60 * 1000;
  return new Date(ubTime);
};

export function sameYMD(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
export function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function mnDateFormatDay(d: Date) {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} сарын ${day}, ${year}`;
}
export function mnDateFormatTitle(d: Date | string | number = new Date()) {
  const date = mnDate(new Date(d));
  const weekday = getDayName(date.getDay());

  // Монгол хэлээр өдөр + сар + өдөр

  const yearMonthDay = mnDateFormatDay(date);
  // Жишээ: "даваа, 2025 оны 9 сарын 1"
  return `${weekday}, ${yearMonthDay}`;
}
export function toTimeString(hour: number | string, slice?: boolean): string {
  const h = String(Math.floor(Number(hour))).padStart(2, "0");
  const value = `${h}:${Number(hour) % 1 != 0 ? "30" : "00"}:00`;
  return slice ? value.slice(0, 5) : value;
}
export const addMinutes = (time: string, minutes: number) => {
  const [h, m, s = "0"] = time.split(":").map(Number);

  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;

  return `${hh.toString().padStart(2, "0")}:${mm
    .toString()
    .padStart(2, "0")}:00`;
};

export function add15Days(day: number) {
  const value = Number(day);
  if (!Number.isFinite(value) || value <= 0) return "-";
  return `${value} | ${value + 15}`;
}
export function mnDateFormat(d: Date | string | number = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(d));
}
export function getDayNameWithDate(
  dayNumber: number,
  date: number | Date,
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

export const checkEmpty = (value?: string) => {
  return value && value != "" && value != null ? value : "-";
};
const pad = (n: number) => String(n).padStart(2, "0");
export const dateOnly = (d: Date) => {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
  value: string | null,
) => {
  if (value != null) set((prev) => ({ ...prev, [key]: value }));
};

export const mobileFormatter = (mobile: string) => {
  const value = mobile ? mobile.replace("+976", "") : "";
  return value.slice(0, 4) + "-" + value.slice(4);
};

export const searchUsernameFormatter = (value: string) => {
  const [mobile, nickname, branch_id, color] = value?.split("__") ?? [
    "",
    "",
    "",
    "",
  ];
  return `${nickname} ${mobileFormatter(mobile)}`;
};
export const searchProductFormatter = (value: string) => {
  const [brand_name, category_name, name, quantity] = value?.split("__") ?? [
    "",
    "",
    "",
    "",
  ];
  return `${name}${brand_name ? ` - ${brand_name}` : ""} | Үлд: ${
    quantity ?? 0
  }`;
};
export const searchFormatter = (value: string) => {
  const [name] = value?.split("__") ?? [""];
  return `${name}`;
};

export const usernameFormatter = (user: User) => {
  if (user.nickname) {
    return user.nickname;
  }

  if (user.lastname || user.firstname) {
    const last = user.lastname ? `${firstLetterUpper(user.lastname)}.` : "";
    const first = user.firstname ?? "";
    return `${last}${first}`;
  }

  return "";
};
export const money = (value: string, currency = "") => {
  let v = round(+(value ?? "0"));
  return `${v
    .toString()
    .replaceAll(",", "")
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${currency && " "}${currency}`;
};

export function paginationToQuery(
  uri: string,
  pagination: Pagination,
  route?: string,
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
export function toYMD(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const textValue = (value: string) => {
  return firstLetterUpper(VALUES[value]);
};

export function getPaginationRange(
  current: number,
  total: number,
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

export const totalHours = 16;
