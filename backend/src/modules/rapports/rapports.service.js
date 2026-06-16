import ExcelJS from "exceljs";
import { rapportsRepository } from "./rapports.repository.js";

function dateWhere(query) {
  if (!query.dateDebut && !query.dateFin) return {};
  return { dateEmission: { ...(query.dateDebut ? { gte: new Date(query.dateDebut) } : {}), ...(query.dateFin ? { lte: new Date(query.dateFin) } : {}) } };
}

async function format(data, format = "json") {
  if (format === "excel") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Rapport");
    sheet.addRow(Object.keys(data[0] || { resultat: "" }));
    data.forEach((row) => sheet.addRow(Object.values(row)));
    return workbook.xlsx.writeBuffer();
  }
  if (format === "pdf") return Buffer.from(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
  return data;
}

export const rapportsService = {
  async ventes(q) { return format(await rapportsRepository.ventes(dateWhere(q)), q.format); },
  async achats(q) { return format(await rapportsRepository.achats(dateWhere(q)), q.format); },
  async stocks(q) { return format(await rapportsRepository.stocks(), q.format); },
  async balanceClients(q) { return format(await rapportsRepository.balanceClients(), q.format); },
  async balanceFournisseurs(q) { return format(await rapportsRepository.balanceFournisseurs(), q.format); },
};

