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

export type Dict = Record<string, any>;

export function mergeDefaultValues<T extends Dict[]>(...objects: T): MergeDefaultValues<T> {
  const merged: Dict = {};

  for (const obj of objects) {
    for (const key in obj) {
      if ([undefined, null].includes(merged[key])) {
        merged[key] = obj[key];
      }
    }
  }

  return merged;
}

[undefined, null].includes(null);

export type SpreadKeyof<T extends Dict[]> = T extends [infer CurProps, ...infer RestProps extends Dict[]]
  ? keyof CurProps | SpreadKeyof<RestProps>
  : never;

export type Nullable = undefined | null;

export type PickFirstNoneNullable<T extends Dict[], Key extends SpreadKeyof<T>> = T extends [
  infer CurProps,
  ...infer RestProps extends Dict[]
]
  ? Key extends keyof CurProps
    ? CurProps[Key] extends Nullable
      ? PickFirstNoneNullable<RestProps, Key>
      : CurProps[Key]
    : PickFirstNoneNullable<RestProps, Key>
  : never;

export type MergeDefaultValues<T extends Dict[]> = { [key in SpreadKeyof<T>]: PickFirstNoneNullable<T, key> };

// type t11 = PickFirstNoneNullable<[t1, t2, t3], "b">;
// type t1asd = MergeDefaultValues<[t1, t2, t3]>;

// type MergeDefaultValues2<T extends Dict[]> = T extends [infer CurProps, infer NextProps, ...infer RestProps]
//   ? keyof CurProps | keyof NextProps
//   : never;

// type t123 = MergeDefaultValues<[t1, t2]>;
// type t1232 = MergeDefaultValues2<[t1, t2]>;

// type Last<T extends any[]> = T extends []
//   ? never // empty array, return never
//   : T extends [infer First, ...infer Rest] // array with at least one element
//   ? Last<Rest> // recursively find the last element of the remaining array
//   : T[0]; // single-element array, return the element type
//
// type DeepMerge<T, U> =
//   U extends unknown
//     ? T extends object & U
//       ? { [K in keyof T | keyof U]: DeepMerge<T[K], U[K]> }
//       : U
//     : never;
//
// type MergeDefaultValues<T extends object, D extends object, ...Rest> =
//   T extends unknown
//   ? DeepMerge<T, { [K in keyof D]: D[K] | null | undefined }> & DeepMerge<DeepMerge<T, { [K in keyof D]: D[K] | null | undefined }>, ...Rest>
// : never;
//
// type User = { name: string; age: number };
// type Defaults = { age: 25, location: string | null };
//
// type WithDefaults = MergeDefaultValues<User, Defaults>; // { name: string; age: number | null; location: string | null }
//
//
// console.log(john.location); // undefined, as it wasn't set
// console.log(jane.age); // 30, overrides the default
