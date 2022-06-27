export const round = (value: number, decimals: number = 1) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

// filter array of items from an array
export const omitItems = (arr: any[], removeArr: any[]) => {
  return arr.filter((item) => !removeArr.includes(item));
};
