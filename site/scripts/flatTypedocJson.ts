import tdocs from "../typeDocsGeneratedTypes.json";
import fs from "fs";

console.log(tdocs);
const definitions = {};

const fillEntryAndChildren = (entry, parent) => {
  definitions[entry.name] = entry;
  if (entry.children) {
    entry.children.forEach((child) => {
      fillEntryAndChildren(child, entry);
    });
  }
  // delete entry.children;
};
fillEntryAndChildren(tdocs, null);

fs.writeFileSync("./flatTypedocJson.json", JSON.stringify(definitions, null, 2));
console.log(definitions);
