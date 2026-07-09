import puppeteer from "puppeteer";

const money = (value, currency) => `${Number(value || 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${currency}`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-");
const escapeHtml = (value = "") => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

function simplePdf(devis, entreprise) {
  const currency = entreprise.devise || "XAF";
  const lines = [
    `DEVIS ${devis.numeroDevis}`,
    `${entreprise.raisonSociale || "AC ERP"} - NIF/RCCM: ${entreprise.numeroFiscal || "-"}`,
    `Client: ${devis.client?.nom || "-"} - ${devis.client?.email || "-"}`,
    `Date: ${formatDate(devis.dateDevis)} - Validite: ${formatDate(devis.dateValidite)}`,
    ...(devis.lignes || []).map((l) => `${l.designation} | Qte ${l.quantite} | ${money(l.montantTtc, currency)}`),
    `Total HT: ${money(devis.totalHt, currency)}`,
    `Total TVA: ${money(devis.totalTva, currency)}`,
    `Total TTC: ${money(devis.totalTtc, currency)}`,
    `Conditions: ${devis.conditions || "-"}`,
  ].map((line) => String(line).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"));
  const stream = `BT /F1 9 Tf 42 800 Td 13 TL ${lines.map((line, index) => `${index ? "T* " : ""}(${line}) Tj`).join(" ")} ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}

export function buildDevisHtml(devis, entreprise = {}) {
  const currency = entreprise.devise || "XAF";
  const rows = (devis.lignes || []).map((ligne, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(ligne.produit?.reference || "-")}</td><td>${escapeHtml(ligne.designation)}</td><td class="num">${ligne.quantite}</td><td class="num">${money(ligne.prixUnitaireHt, currency)}</td><td class="num">${Number(ligne.remise || 0)} %</td><td class="num">${Number(ligne.tauxTva || 0)} %</td><td class="num">${money(ligne.montantTtc, currency)}</td></tr>`).join("");
  return `<!doctype html><html lang="fr"><head><meta charset="UTF-8"><style>*{box-sizing:border-box}body{font:11px Arial;color:#111827;padding:28px}h1{font-size:25px;margin:0}h2{font-size:12px;border-bottom:1px solid #d1d5db;padding-bottom:5px;margin-top:20px}.head,.grid{display:flex;justify-content:space-between;gap:24px}.box{border:1px solid #d1d5db;padding:10px;width:100%}table{border-collapse:collapse;width:100%}th,td{border:1px solid #d1d5db;padding:7px}th{background:#f3f4f6;text-align:left}.num{text-align:right;white-space:nowrap}.totals{width:320px;margin:16px 0 0 auto}.total{background:#111827;color:#fff;font-weight:bold}</style></head><body><div class="head"><div><h1>DEVIS</h1><p>Proposition commerciale</p></div><div class="box"><strong>N° ${escapeHtml(devis.numeroDevis)}</strong><br>Date : ${formatDate(devis.dateDevis)}<br>Valable jusqu'au : ${formatDate(devis.dateValidite)}</div></div><div class="grid"><div class="box"><strong>${escapeHtml(entreprise.raisonSociale || "AC ERP")}</strong><br>NIF/RCCM : ${escapeHtml(entreprise.numeroFiscal || "-")}<br>${escapeHtml(entreprise.adresse || "-")}<br>${escapeHtml(entreprise.telephone || "-")} - ${escapeHtml(entreprise.email || "-")}</div><div class="box"><strong>Client : ${escapeHtml(devis.client?.nom || "-")}</strong><br>Code : ${escapeHtml(devis.client?.codeClient || "-")}<br>NIF : ${escapeHtml(devis.client?.numeroFiscal || "-")}<br>${escapeHtml(devis.client?.adresse || "-")}, ${escapeHtml(devis.client?.ville || "")}<br>${escapeHtml(devis.client?.telephone || "-")} - ${escapeHtml(devis.client?.email || "-")}</div></div><h2>Detail du devis</h2><table><thead><tr><th>#</th><th>Reference</th><th>Designation</th><th>Qte</th><th>Prix HT</th><th>Remise</th><th>TVA</th><th>Total TTC</th></tr></thead><tbody>${rows}</tbody></table><table class="totals"><tr><td>Total HT</td><td class="num">${money(devis.totalHt, currency)}</td></tr><tr><td>Total TVA</td><td class="num">${money(devis.totalTva, currency)}</td></tr><tr class="total"><td>Total TTC</td><td class="num">${money(devis.totalTtc, currency)}</td></tr></table><h2>Conditions</h2><div class="box">${escapeHtml(devis.conditions || "Selon les conditions commerciales convenues.")}</div></body></html>`;
}

export async function buildDevisPdf(devis, entreprise) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, protocolTimeout: 60000, args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] });
    const page = await browser.newPage();
    await page.emulateMediaType("print");
    await page.setContent(buildDevisHtml(devis, entreprise), { waitUntil: "domcontentloaded" });
    return await page.pdf({ format: "A4", printBackground: true, margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" } });
  } catch {
    return simplePdf(devis, entreprise);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
