import { readFileSync } from "fs";
import path from "path";

const onReadFileSync = (partialPath: string) =>
  readFileSync(path.join(__dirname, partialPath)).toString();

export const partials = {
  contactContentPartial: onReadFileSync("./contactContent.html"),
  requestContentPartial: onReadFileSync("./requestContent.html"),
  claimContentPartial: onReadFileSync("./claimContent.html"),
  quotationContentPartial: onReadFileSync("./quotationContent.html"),
  headPartial: onReadFileSync("./head.html"),
  headerPartial: onReadFileSync("./header.html"),
  dividerPartial: onReadFileSync("./divider.html"),
  spacePartial: onReadFileSync("./space.html"),
};
