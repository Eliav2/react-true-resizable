import { mergeDefaultValues, SpreadKeyof } from "./utils";
import { describe, expect, it } from "vitest";

type t1 = {
  a: "123";
  b: undefined;
  t: "t1";
};
type t2 = {
  a: "aasd";
  b: "zz";
  t: "t2";
};
type t3 = {
  t: "t2123";
  k: "k";
};

type a = SpreadKeyof<[t1, t2]>;

describe("test mergeDefaultValues", () => {
  it("prop was undefined", () => {
    expect(
      mergeDefaultValues(
        { a: "123", b: undefined },
        {
          a: "t2123",
          b: "b",
        }
      )
    ).toEqual({ a: "123", b: "b" });
  });

  it("prop was non-existent", () => {
    expect(
      mergeDefaultValues(
        { a: "123" },
        {
          a: "t2123",
          b: "b",
        }
      )
    ).toEqual({ a: "123", b: "b" });
  });

  it("2 default objects", () => {
    expect(
      mergeDefaultValues(
        { a: "123", b: undefined, t: "t1" },
        { a: "aasd", b: "zz", t: "t2" },
        {
          t: "t2123",
          k: "k",
        }
      )
    ).toEqual({ a: "123", b: "zz", t: "t1", k: "k" });
  });
});
