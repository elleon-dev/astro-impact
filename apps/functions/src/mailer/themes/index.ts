import { readFileSync } from "fs";
import path from "path";
import mustache from "mustache";
import { Templates } from "./common";
import { partials } from "./partials";

const getHtmlTemplate = (template: Templates, theme: string): string =>
  readFileSync(
    path.join(__dirname, `./${theme}/bodies/${template}`),
  ).toString();

export const createBody = <T extends ObjectType>(
  template: Templates,
  theme: string,
  view: T,
): string => {
  return mustache.render(getHtmlTemplate(template, theme), view, partials);
};
