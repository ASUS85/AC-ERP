type NumberInputOptions = {
  allowNegative?: boolean;
};

export const normalizeNumberInput = (
  value: string,
  options: NumberInputOptions = {},
) => {
  const { allowNegative = false } = options;
  const raw = String(value || "")
    .replace(/\s+/g, "")
    .replace(/,/g, ".");

  let sign = "";
  let unsigned = raw;
  if (allowNegative && unsigned.startsWith("-")) {
    sign = "-";
    unsigned = unsigned.slice(1);
  }

  const cleaned = unsigned.replace(/[^\d.]/g, "");
  const [intPart = "", ...rest] = cleaned.split(".");
  const decimalPart = rest.join("");
  const normalized = decimalPart ? `${intPart}.${decimalPart}` : intPart;

  if (!normalized) return sign;
  return `${sign}${normalized}`;
};

export const formatGroupedInputNumber = (
  value: string | number,
  options: NumberInputOptions = {},
) => {
  const normalized = normalizeNumberInput(String(value ?? ""), options);
  if (!normalized || normalized === "-") {
    return normalized === "-" ? "-" : "";
  }

  const sign = normalized.startsWith("-") ? "-" : "";
  const unsigned = sign ? normalized.slice(1) : normalized;
  const [intPart = "", decimalPart] = unsigned.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return decimalPart !== undefined
    ? `${sign}${grouped}.${decimalPart}`
    : `${sign}${grouped}`;
};

export const formatGroupedNumber = (
  value: unknown,
  options: NumberInputOptions = {},
) => {
  const normalized = normalizeNumberInput(String(value ?? ""), options);
  if (!normalized || normalized === "-") return "-";
  return formatGroupedInputNumber(normalized, options);
};
