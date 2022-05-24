export const round = (value: number, decimals: number = 1) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};
