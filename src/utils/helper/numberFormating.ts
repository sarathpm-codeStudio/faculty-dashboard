export const formatNumber = (
  value: number | string | null | undefined,
  locale: string = "en-US"
): string => {
  if (value === null || value === undefined || value === "") return "0";

  const num = typeof value === "string" ? Number(value) : value;

  if (isNaN(num as number)) return "0";

  return (num as number).toLocaleString(locale);
};

export default formatNumber;
