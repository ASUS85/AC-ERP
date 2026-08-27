/**
 * Garde uniquement les mois déjà terminés.
 * Compatible avec :
 * - Jan, Fev, Mar, Avr, Mai, Juin, Juil, Aout, Sep, Oct, Nov, Dec
 * - Janvier, Février, Mars, ...
 * - YYYY-MM
 * - YYYY-MM-DD
 * - Date / chaîne de date
 */
export function getLast12CompletedMonths<T>(data: T[], dateKey: keyof T): T[] {
  const now = new Date();

  // Mois actuel : 0 = Janvier, 7 = Août...
  const currentMonth = now.getMonth();

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
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.getMonth();
    }

    const str = String(value ?? "")
      .trim()
      .toLowerCase();

    // YYYY-MM ou YYYY-MM-DD
    const numericDate = str.match(/^(\d{4})-(\d{2})(?:-\d{2})?/);
    if (numericDate) {
      return Number(numericDate[2]) - 1;
    }

    // Nom du mois
    return monthNames[str] ?? null;
  };

  return data
    .filter((item) => {
      const month = getMonthIndex(item[dateKey]);

      // Mois invalide
      if (month === null) return false;

      // Exclut le mois actuel et les mois futurs
      return month < currentMonth;
    })
    .slice(-12);
}
