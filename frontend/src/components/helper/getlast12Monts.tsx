/**
 * Garde les 12 derniers mois jusqu'au mois en cours inclus.
 *
 * Compatible avec :
 * - Jan, Fev, Mar, Avr, Mai, Juin, Juil, Aout, Sep, Oct, Nov, Dec
 * - Janvier, Février, Mars, ...
 * - YYYY-MM
 * - YYYY-MM-DD
 * - Date / chaîne de date
 */
export function getLast12Months<T>(data: T[], dateKey: keyof T): T[] {
  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Index absolu du mois actuel
  const currentMonthIndex = currentYear * 12 + currentMonth;

  const monthNames: Record<string, number> = {
    jan: 0,
    janvier: 0,

    fev: 1,
    fév: 1,
    fevr: 1,
    février: 1,
    fevrier: 1,

    mar: 2,
    mars: 2,

    avr: 3,
    avril: 3,

    mai: 4,

    juin: 5,

    juil: 6,
    juillet: 6,

    aout: 7,
    août: 7,

    sep: 8,
    sept: 8,
    septembre: 8,

    oct: 9,
    octobre: 9,

    nov: 10,
    novembre: 10,

    dec: 11,
    déc: 11,
    décembre: 11,
    decembre: 11,
  };

  const getMonthIndex = (value: unknown): number | null => {
    // Date
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.getFullYear() * 12 + value.getMonth();
    }

    const str = String(value ?? "")
      .trim()
      .toLowerCase();

    // YYYY-MM ou YYYY-MM-DD
    const numericDate = str.match(/^(\d{4})-(\d{2})(?:-\d{2})?/);

    if (numericDate) {
      const year = Number(numericDate[1]);
      const month = Number(numericDate[2]) - 1;

      return year * 12 + month;
    }

    // Nom du mois seul
    const month = monthNames[str];

    if (month === undefined) {
      return null;
    }

    // Pour un nom de mois seul, on suppose l'année actuelle
    return currentYear * 12 + month;
  };

  // Il y a 11 mois avant le mois actuel + le mois actuel
  const firstMonthIndex = currentMonthIndex - 11;

  return data
    .filter((item) => {
      const monthIndex = getMonthIndex(item[dateKey]);

      if (monthIndex === null) {
        return false;
      }

      // Inclut le mois actuel
      // et les 11 mois précédents.
      return monthIndex >= firstMonthIndex && monthIndex <= currentMonthIndex;
    })
    .slice(-12);
}

export const getLast12CompletedMonths = getLast12Months;
