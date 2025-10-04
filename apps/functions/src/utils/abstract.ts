import { orderBy } from "lodash";

export const uniq = (strings: string[]): string[] =>
  strings.map((string) =>
    string
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, ""),
  );

export const orderByUrl = (websites: Web[], status: string) =>
  orderBy(
    websites
      .filter((website) => website.status === status)
      .map((_website) => _website.url),
    (value) => value.split("://")[1],
    "asc",
  );
