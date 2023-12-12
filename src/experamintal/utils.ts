import { useOneTimeWarn } from "shared/hooks/useOneTimeWarn";

export const round = (value: number, decimals: number = 1) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

// filter array of items from an array
export const omitItems = (arr: any[], removeArr: any[]) => {
  return arr.filter((item) => !removeArr.includes(item));
};

export const useResizableWarn = () => useOneTimeWarn("Resizable: ");

type Dict = Record<string, any>;
export function mergeDefaultValues(...objects: Dict[]): Dict {
  const merged: Dict = {};

  for (const obj of objects) {
    for (const key in obj) {
      if (!(key in merged) || merged[key] === undefined) {
        merged[key] = obj[key];
      }
    }
  }

  return merged;
}
