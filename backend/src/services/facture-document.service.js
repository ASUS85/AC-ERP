import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderPdfDocument } from "./pdf-render.service.js";

const money = (value, currency = "XAF") =>
  `${Number(value || 0).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;

const date = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "-";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let cachedLogoDataUri = null;

function getLogoDataUri() {
  if (cachedLogoDataUri) return cachedLogoDataUri;
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const logoPath = path.resolve(
      __dirname,
      "../../../frontend/src/assets/erp-logo.png",
    );
    const buffer = fs.readFileSync(logoPath);
    cachedLogoDataUri = `data:image/png;base64,${buffer.toString("base64")}`;
    return cachedLogoDataUri;
  } catch {
    return null;
  }
}

function buildFactureHtml(facture, entreprise = {}) {
  const currency = entreprise.devise || "XAF";
  const tiersNom =
    facture.client?.nom || facture.fournisseur?.raisonSociale || "-";
  const logoDataUri = getLogoDataUri();

  const lignes = (facture.lignes || [])
    .map((ligne) => {
      const designation =
        ligne.designation || ligne.produit?.designation || "Produit";
      const quantite = Number(ligne.quantite || 0);
      const prix = Number(ligne.prixUnitaireHt || 0);
      const montantHt = Number(ligne.montantHt || quantite * prix);
      const montantTtc = Number(ligne.montantTtc || montantHt);

      return `
        <tr>
          <td>${escapeHtml(designation)}</td>
          <td class="center">${quantite}</td>
          <td class="right">${money(montantTtc, currency)}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Facture ${escapeHtml(facture.numeroFacture)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        background: #ffffff;
        color: #0f172a;
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 28px;
      }
      .card {
        border: 1px solid #d5dde7;
        border-radius: 14px;
        margin: 0 auto;
        max-width: 860px;
        padding: 18px 20px;
      }
      .top {
        align-items: flex-start;
        display: flex;
        justify-content: space-between;
        gap: 16px;
      }
      .brand {
        align-items: center;
        display: flex;
        gap: 10px;
      }
      .logo {
        height: 30px;
        width: 30px;
      }
      .brand-name {
        font-size: 16px;
        font-weight: 700;
        line-height: 1;
        margin: 0;
      }
      .brand-sub {
        color: #5b6b7d;
        font-size: 12px;
        margin: 2px 0 0;
      }
      .doc {
        text-align: right;
      }
      .doc-title {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.04em;
        margin: 0;
      }
      .doc-ref {
        color: #425166;
        font-size: 14px;
        margin-top: 4px;
      }
      .sep {
        border-top: 1px solid #d5dde7;
        margin: 16px 0 14px;
      }
      .meta-main {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }
      .meta-sub {
        color: #5b6b7d;
        font-size: 13px;
        margin: 4px 0 0;
      }
      table {
        border-collapse: collapse;
        margin-top: 12px;
        width: 100%;
      }
      th {
        border-bottom: 1px solid #d5dde7;
        color: #506174;
        font-size: 13px;
        font-weight: 600;
        padding: 12px 0 10px;
        text-align: left;
      }
      th.center { text-align: center; }
      th.right { text-align: right; }
      td {
        border-bottom: 1px solid #e8edf4;
        font-size: 14px;
        padding: 12px 0;
        vertical-align: top;
      }
      td.center { text-align: center; }
      td.right { text-align: right; }
      .totals {
        margin-left: auto;
        margin-top: 14px;
        width: 48%;
      }
      .total-row {
        color: #506174;
        display: flex;
        font-size: 14px;
        justify-content: space-between;
        padding: 8px 0;
      }
      .grand {
        border-top: 1px solid #d5dde7;
        color: #0b1726;
        font-size: 16px;
        font-weight: 700;
        margin-top: 4px;
        padding-top: 10px;
      }
      .footer-note {
        color: #6b7280;
        font-size: 11px;
        margin-top: 12px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="top">
        <div class="brand">
          ${
            logoDataUri
              ? `<img class="logo" src="${logoDataUri}" alt="Logo" />`
              : `<div class="logo" style="border-radius:6px;background:#0f4b99;"></div>`
          }
          <div>
            <p class="brand-name">${escapeHtml(entreprise.raisonSociale || "AC ERP")}</p>
            <p class="brand-sub">${escapeHtml(entreprise.adresse || "12 rue du Commerce, Lyon")}</p>
          </div>
        </div>
        <div class="doc">
          <p class="doc-title">FACTURE</p>
          <p class="doc-ref">${escapeHtml(facture.numeroFacture)}</p>
        </div>
      </div>

      <div class="sep"></div>

      <p class="meta-main">Facture a : ${escapeHtml(tiersNom)}</p>
      <p class="meta-sub">Lyon, France · Echeance : ${date(facture.dateEcheance)} · Emission : ${date(facture.dateEmission)}</p>

      <table>
        <thead>
          <tr>
            <th>Designation</th>
            <th class="center">Qte</th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>${lignes}</tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Total HT</span>
          <span>${money(facture.totalHt, currency)}</span>
        </div>
        <div class="total-row">
          <span>TVA</span>
          <span>${money(facture.totalTva, currency)}</span>
        </div>
        <div class="total-row grand">
          <span>Total TTC</span>
          <span>${money(facture.totalTtc, currency)}</span>
        </div>
      </div>

      <div class="footer-note">
        ${escapeHtml(facture.mentionsLegales || "Merci pour votre confiance.")}
      </div>
    </div>
  </body>
  </html>`;
}

export async function buildFacturePdf(facture, entreprise) {
  const { buffer } = await renderPdfDocument({
    html: buildFactureHtml(facture, entreprise),
    pdfOptions: {
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" },
    },
  });
  return buffer;
}
