import { Dispatch, SetStateAction } from "react";

const formatDate = (value: string, limit = 10) => {
  return parseInt(value) < limit ? `0${value}` : `${value}`;
};
export const parseDate = (date = new Date()) => {
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
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
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
