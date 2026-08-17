const normalizeNumberInput = (value, options = {}) => {
  const { allowNegative = false } = options;
  const raw = String(value || "").replace(/\s+/g, "").replace(/,/g, ".");
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
const formatGroupedInputNumber = (value, options = {}) => {
  const normalized = normalizeNumberInput(String(value ?? ""), options);
  if (!normalized || normalized === "-") {
    return normalized === "-" ? "-" : "";
  }
  const sign = normalized.startsWith("-") ? "-" : "";
  const unsigned = sign ? normalized.slice(1) : normalized;
  const [intPart = "", decimalPart] = unsigned.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decimalPart !== void 0 ? `${sign}${grouped}.${decimalPart}` : `${sign}${grouped}`;
};
const formatGroupedNumber = (value, options = {}) => {
  const normalized = normalizeNumberInput(String(value ?? ""), options);
  if (!normalized || normalized === "-") return "-";
  return formatGroupedInputNumber(normalized, options);
};
export {
  formatGroupedNumber as a,
  formatGroupedInputNumber as f,
  normalizeNumberInput as n
};
