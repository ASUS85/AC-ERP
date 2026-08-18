type NumberInputOptions = {
  allowNegative?: boolean;
};

export const normalizeNumberInput = (
  value: string,
  options: NumberInputOptions = {},
) => {
  const { allowNegative = true } = options;

  const raw = String(value ?? "")
    .replace(/\s+/g, "")
    .replace(/,/g, ".");

  let sign = "";
  let unsigned = raw;

  if (allowNegative && unsigned.startsWith("-")) {
    sign = "-";
    unsigned = unsigned.slice(1);
  }

  const cleaned = unsigned.replace(/[^\d.]/g, "");

  const firstDotIndex = cleaned.indexOf(".");

  let normalized: string;

  if (firstDotIndex === -1) {
    normalized = cleaned;
  } else {
    const intPart = cleaned.slice(0, firstDotIndex);
    const decimalPart = cleaned
      .slice(firstDotIndex + 1)
      .replace(/\./g, "");

    // Important : conserve le point même s'il n'y a pas encore de décimales
    normalized = `${intPart}.${decimalPart}`;
  }

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
