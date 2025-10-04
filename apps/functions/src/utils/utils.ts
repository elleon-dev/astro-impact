import moment from "moment";
import { normalizeText } from "normalize-text";
import { _Image, Image } from "../globalTypes";
import { toString } from "lodash";

export const normalize = (field: string): string => {
  const regex = /[.,\s]+/g;
  return normalizeText(field.toUpperCase()).replace(regex, " ");
};

export const isDate = (date: Date): boolean =>
  moment(date, "YYYY-MM-DD", true).isValid();

export const mapApiImage = (image: _Image): Image => ({
  ...image,
  createAt: image.createAt?.toDate(),
});

export const searchName = (
  names: (string | null | number | undefined)[],
): string[] =>
  names
    .filter((name) => name)
    .map((name) =>
      toString(name)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, ""),
    );
