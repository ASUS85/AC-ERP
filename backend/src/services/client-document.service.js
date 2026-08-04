import { renderPdfDocument } from "./pdf-render.service.js";

const _E = String.fromCharCode(38); // &
const _q = String.fromCharCode(34); // "

const money = (value, currency = "XAF") =>
  `${Number(value || 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 0,
  })} ${currency}`;

const date = (value = new Date()) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

function esc(value) {
  return String(value)
    .replace(/&/g, _E + "amp;")
    .replace(/</g, _E + "lt;")
    .replace(/>/g, _E + "gt;")
    .replace(/"/g, _E + "quot;")
    .replace(/'/g, _E + "#039;");
}

/**
 * Construit le HTML de la liste des clients pour generer le PDF.
 * @param {Array} clients
 * @param {Object} entreprise
 * @returns {string}
 */
export function buildClientsHtml(clients, entreprise = {}) {
  const currency = entreprise.devise || "XAF";
  const rows = (clients || [])
    .map(
      (client) => `
        <tr>
          <td>${esc(client.codeClient || "-")}</td>
          <td>${esc(client.nom || "-")}</td>
          <td>${esc(client.email || "-")}</td>
          <td>${esc(client.telephone || "-")}</td>
          <td>${esc(client.ville || "-")}</td>
          <td class="num">${money(client.plafondCredit || 0, currency)}</td>
          <td>${esc(client.statut || "-")}</td>
        </tr>`,
    )
    .join("");

  const total = clients?.length || 0;
  const actifs = (clients || []).filter((c) => c.statut === "ACTIF").length;
  const inactifs = (clients || []).filter((c) => c.statut === "INACTIF").length;

  return `<!doctype html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Liste des clients</title>
    <style>
      * { box-sizing: border-box; }
      body { color: #111827; font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 28px; }
      h1 { font-size: 24px; margin: 0 0 6px; text-transform: uppercase; }
      h2 { border-bottom: 1px solid #d1d5db; font-size: 12px; margin: 18px 0 8px; padding-bottom: 5px; text-transform: uppercase; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #d1d5db; padding: 7px; vertical-align: top; }
      th { background: #f3f4f6; text-align: left; }
      .header { align-items: flex-start; display: flex; justify-content: space-between; gap: 24px; }
      .muted { color: #4b5563; }
      .box { border: 1px solid #d1d5db; padding: 10px; }
      .num { text-align: right; white-space: nowrap; }
      .summary { display: grid; gap: 8px; grid-template-columns: repeat(3, 1fr); margin-top: 16px; }
      .summary div { border: 1px solid #d1d5db; padding: 9px; }
      .summary strong { display: block; font-size: 13px; margin-top: 3px; }
      .footer { border-top: 1px solid #d1d5db; color: #6b7280; font-size: 10px; margin-top: 22px; padding-top: 8px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Liste des clients</h1>
        <div class="muted">Extrait du fichier client</div>
      </div>
      <div class="box">
        <strong>${esc(entreprise.raisonSociale || "AC ERP")}</strong><br />
        Genere le ${date()}
      </div>
    </div>

    <h2>Synthese</h2>
    <div class="summary">
      <div>Total<strong>${total}</strong></div>
      <div>Actifs<strong>${actifs}</strong></div>
      <div>Inactifs<strong>${inactifs}</strong></div>
    </div>

    <h2>Fiches clients</h2>
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Nom</th>
          <th>Email</th>
          <th>Telephone</th>
          <th>Ville</th>
          <th class="num">Plafond credit</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="footer">Document genere automatiquement par AC ERP.</div>
  </body>
  </html>`;
}

/**
 * Genere le PDF de la liste des clients.
 * @param {Array} clients
 * @param {Object} entreprise
 * @returns {Buffer}
 */
export async function buildClientsPdf(clients, entreprise) {
  try {
    const { buffer } = await renderPdfDocument({
      html: buildClientsHtml(clients, entreprise),
      pdfOptions: {
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" },
      },
    });
    return buffer;
  } catch (error) {
    console.error(
      "Erreur generation PDF clients avec Puppeteer, fallback texte simple:",
      error.message,
    );
    return buildSimplePdf(clients, entreprise);
  }
}

/* ---------- Fallback PDF texte simple ---------- */

function pdfText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildSimplePdf(clients, entreprise) {
  const currency = entreprise.devise || "XAF";
  const lines = [
    "LISTE DES CLIENTS",
    `${entreprise.raisonSociale || "AC ERP"} - Genere le ${date()}`,
    "",
    `Total: ${clients?.length || 0} clients`,
    "",
    ...(clients || []).map(
      (c) =>
        `${c.codeClient || "-"} | ${c.nom || "-"} | ${c.email || "-"} | ${c.telephone || "-"} | ${c.ville || "-"} | ${money(c.plafondCredit || 0, currency)} | ${c.statut || "-"}`,
    ),
  ].map(pdfText);

  const stream = `BT /F1 9 Tf 42 800 Td 13 TL ${lines
    .map((line, index) => `${index ? "T* " : ""}(${line}) Tj`)
    .join(" ")} ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)
    .join("\n")}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}
