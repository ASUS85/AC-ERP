const DEFAULT_CURRENCY = "XAF";
const CURRENCY_STORAGE_KEY = "erp_currency";
const AFRICAN_CURRENCIES = [
  { code: "XAF", name: "Franc CFA (Afrique centrale)", symbol: "FCFA" },
  { code: "XOF", name: "Franc CFA (Afrique de l'Ouest)", symbol: "CFA" },
  { code: "DZD", name: "Dinar algerien", symbol: "DA" },
  { code: "AOA", name: "Kwanza angolais", symbol: "Kz" },
  { code: "BWP", name: "Pula botswanais", symbol: "P" },
  { code: "BIF", name: "Franc burundais", symbol: "FBu" },
  { code: "CVE", name: "Escudo cap-verdien", symbol: "Esc" },
  { code: "KMF", name: "Franc comorien", symbol: "CF" },
  { code: "CDF", name: "Franc congolais", symbol: "FC" },
  { code: "DJF", name: "Franc djiboutien", symbol: "Fdj" },
  { code: "EGP", name: "Livre egyptienne", symbol: "E£" },
  { code: "ERN", name: "Nakfa erythreen", symbol: "Nfk" },
  { code: "ETB", name: "Birr ethiopien", symbol: "Br" },
  { code: "GMD", name: "Dalasi gambien", symbol: "D" },
  { code: "GHS", name: "Cedi ghanien", symbol: "GHs" },
  { code: "GNF", name: "Franc guineen", symbol: "FG" },
  { code: "KES", name: "Shilling kenyan", symbol: "KSh" },
  { code: "LRD", name: "Dollar liberien", symbol: "L$" },
  { code: "LYD", name: "Dinar libyen", symbol: "LD" },
  { code: "MGA", name: "Ariary malgache", symbol: "Ar" },
  { code: "MWK", name: "Kwacha malawite", symbol: "MK" },
  { code: "MRO", name: "Ouguiya mauritanien", symbol: "UM" },
  { code: "MUR", name: "Roupie mauricienne", symbol: "Rs" },
  { code: "MAD", name: "Dirham marocain", symbol: "DH" },
  { code: "MZN", name: "Metical mozambicain", symbol: "MT" },
  { code: "NAD", name: "Dollar namibien", symbol: "N$" },
  { code: "NGN", name: "Naira nigerian", symbol: "NGN" },
  { code: "RWF", name: "Franc rwandais", symbol: "RF" },
  { code: "SHP", name: "Livre de Sainte-Helene", symbol: "£" },
  { code: "SCR", name: "Roupie seychelloise", symbol: "SR" },
  { code: "SLL", name: "Leone sierra-leonais", symbol: "Le" },
  { code: "SOS", name: "Shilling somalien", symbol: "Sh" },
  { code: "ZAR", name: "Rand sud-africain", symbol: "R" },
  { code: "SSP", name: "Livre sud-soudanaise", symbol: "SSP" },
  { code: "SDG", name: "Livre soudanaise", symbol: "SDG" },
  { code: "SZL", name: "Lilangeni swazi", symbol: "E" },
  { code: "TZS", name: "Shilling tanzanien", symbol: "TSh" },
  { code: "TND", name: "Dinar tunisien", symbol: "DT" },
  { code: "UGX", name: "Shilling ougandais", symbol: "USh" },
  { code: "ZMW", name: "Kwacha zambien", symbol: "ZK" },
  { code: "ZWL", name: "Dollar zimbabween", symbol: "Z$" }
];
const byCode = new Map(AFRICAN_CURRENCIES.map((item) => [item.code, item]));
function normalizeCurrencyCode(value) {
  const code = String(value || "").trim().toUpperCase();
  if (!code) return DEFAULT_CURRENCY;
  return byCode.has(code) ? code : code;
}
function getCurrencyMeta(code) {
  const normalized = normalizeCurrencyCode(code);
  return byCode.get(normalized) || {
    code: normalized,
    name: normalized,
    symbol: normalized
  };
}
function getStoredCurrency() {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  return normalizeCurrencyCode(localStorage.getItem(CURRENCY_STORAGE_KEY));
}
function setStoredCurrency(code) {
  const normalized = normalizeCurrencyCode(code);
  if (typeof window !== "undefined") {
    localStorage.setItem(CURRENCY_STORAGE_KEY, normalized);
    window.dispatchEvent(
      new CustomEvent("erp:currency-changed", { detail: { code: normalized } })
    );
  }
  return normalized;
}
function formatCurrency(value, currencyCode) {
  const code = normalizeCurrencyCode(getStoredCurrency());
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  } catch {
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(value || 0))} ${code}`;
  }
}
export {
  AFRICAN_CURRENCIES as A,
  getCurrencyMeta as a,
  formatCurrency as f,
  getStoredCurrency as g,
  setStoredCurrency as s
};
