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
const OCCASIONAL_INFO_MARKER = "[[OCCASIONNEL_INFO]]";

function parseMentions(mentions = "") {
  const text = String(mentions || "");
  const index = text.indexOf(OCCASIONAL_INFO_MARKER);
  if (index === -1) {
    return {
      legalText: text,
      clientOccasionnelInfo: null,
    };
  }

  const legalText = text.slice(0, index).trim();
  const payload = text.slice(index + OCCASIONAL_INFO_MARKER.length).trim();
  try {
    const parsed = JSON.parse(payload);
    return {
      legalText,
      clientOccasionnelInfo: {
        nom: String(parsed?.nom || "").trim(),
        prenom: String(parsed?.prenom || "").trim(),
        sexe: String(parsed?.sexe || "").trim(),
        numeroCni: String(parsed?.numeroCni || "").trim(),
        telephone: String(parsed?.telephone || "").trim(),
      },
    };
  } catch {
    return {
      legalText,
      clientOccasionnelInfo: null,
    };
  }
}

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
    facture.client?.nom ||
    facture.fournisseur?.raisonSociale ||
    "Client occasionnel";
  const { legalText, clientOccasionnelInfo } = parseMentions(
    facture.mentionsLegales,
  );
  const hasClientEnregistre = Boolean(facture.client?.id);
  const hasOccasionnelDetails = Boolean(
    clientOccasionnelInfo &&
    Object.values(clientOccasionnelInfo).some((value) => value.length > 0),
  );
  const factureVariant = hasClientEnregistre
    ? "Facture client enregistre"
    : "Facture client occasionnel";
  const logoDataUri = getLogoDataUri();

  const modePaiement = facture.paiements?.[0]?.modePaiement || "-";
  const statut = String(facture.statut || "-")
    .replaceAll("_", " ")
    .toLowerCase();

  const entrepriseLigne1 = entreprise.adresse
    ? escapeHtml(entreprise.adresse)
    : "Siege Social : Adresse non renseignee";
  const entrepriseLigne2 = `N RC : ${escapeHtml(entreprise.numeroRc || "-")} | NIU : ${escapeHtml(entreprise.numeroFiscal || "-")}`;
  const entrepriseLigne3 = `Tel : ${escapeHtml(entreprise.telephone || "-")}`;
  const entrepriseLigne4 = `Email : ${escapeHtml(entreprise.email || "-")}`;

  const clientInfoBlock = hasClientEnregistre
    ? `
    <div class="client-box">
      <div class="client-title">Informations du Client</div>
      <table class="client-table">
        <tr>
          <td class="label">Nom / Raison Sociale :</td>
          <td>${escapeHtml(facture.client?.nom || "-")}</td>
          <td class="label">Telephone :</td>
          <td>${escapeHtml(facture.client?.telephone || "-")}</td>
        </tr>
        <tr>
          <td class="label">Adresse Email :</td>
          <td>${escapeHtml(facture.client?.email || "-")}</td>
          <td class="label">Ville / Pays :</td>
          <td>${escapeHtml(facture.client?.ville || "-")}, ${escapeHtml(facture.client?.pays || "-")}</td>
        </tr>
      </table>
    </div>
    `
    : hasOccasionnelDetails
      ? `
    <div class="client-box">
      <div class="client-title">Informations du Client (Particulier)</div>
      <table class="client-table">
        <tr>
          <td class="label">Nom :</td>
          <td>${escapeHtml(clientOccasionnelInfo?.nom || "-")}</td>
          <td class="label">Prenom :</td>
          <td>${escapeHtml(clientOccasionnelInfo?.prenom || "-")}</td>
        </tr>
        <tr>
          <td class="label">Sexe :</td>
          <td>${escapeHtml(clientOccasionnelInfo?.sexe || "-")}</td>
          <td class="label">Telephone :</td>
          <td>${escapeHtml(clientOccasionnelInfo?.telephone || "-")}</td>
        </tr>
        <tr>
          <td class="label">N CNI :</td>
          <td colspan="3">${escapeHtml(clientOccasionnelInfo?.numeroCni || "-")}</td>
        </tr>
      </table>
    </div>
    `
      : `
    <div class="client-box">
      <div class="client-title">Information Client</div>
      <p class="client-empty">Facture au comptoir / Client non specifie.</p>
    </div>
    `;

  const lignes = (facture.lignes || [])
    .map((ligne, index) => {
      const designation =
        ligne.designation || ligne.produit?.designation || "Produit";
      const quantite = Number(ligne.quantite || 0);
      const prix = Number(ligne.prixUnitaireHt || 0);
      const montantHt = Number(ligne.montantHt || quantite * prix);

      return `
        <tr>
          <td class="text-center">${String(index + 1).padStart(2, "0")}</td>
          <td>${escapeHtml(designation)}</td>
          <td class="text-center">${quantite}</td>
          <td class="text-right">${money(prix, currency)}</td>
          <td class="text-right">${money(montantHt, currency)}</td>
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
      @page {
        size: A4;
        margin: 15mm;
      }

      * { box-sizing: border-box; }
      body {
        font-family: 'Times New Roman', Times, serif;
        color: #000000;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
        font-size: 11pt;
        line-height: 1.4;
      }

      .invoice-header {
        border-bottom: 2px solid #000000;
        padding-bottom: 12px;
        margin-bottom: 20px;
      }

      .company-title {
        font-size: 20pt;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0 0 4px 0;
      }

      .company-subtitle {
        font-size: 10pt;
        font-style: italic;
        margin-bottom: 10px;
      }

      .company-details {
        font-size: 9.5pt;
        line-height: 1.3;
      }

      .logo {
        height: 52px;
        width: 52px;
        object-fit: contain;
        margin-right: 10px;
      }

      .meta-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        margin-bottom: 20px;
      }

      .meta-table td {
        padding: 3px 0;
        font-size: 10pt;
      }

      .text-center { text-align: center; }
      .text-right { text-align: right; }

      .client-box {
        border: 1px solid #000000;
        padding: 12px 15px;
        margin-bottom: 25px;
        background-color: #fafafa;
      }

      .client-title {
        font-weight: bold;
        text-transform: uppercase;
        font-size: 10pt;
        border-bottom: 1px dashed #666666;
        padding-bottom: 4px;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      }

      .client-table {
        width: 100%;
        border-collapse: collapse;
      }

      .client-table td {
        padding: 3px 0;
        font-size: 10pt;
      }

      .client-table td.label {
        font-weight: bold;
        width: 25%;
      }

      .client-empty {
        margin: 0;
        font-size: 10pt;
        font-style: italic;
        color: #444444;
      }

      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }

      .items-table th {
        background-color: #000000;
        color: #ffffff;
        font-weight: bold;
        text-align: right;
        padding: 8px;
        font-size: 10pt;
        text-transform: uppercase;
        border: 1px solid #000000;
      }

      .items-table td {
        border: 1px solid #000000;
        padding: 8px;
        font-size: 10pt;
      }

      .totals-wrapper {
        width: 100%;
        margin-top: 10px;
        margin-bottom: 30px;
      }

      .totals-table {
        width: 45%;
        margin-left: auto;
        border-collapse: collapse;
      }

      .totals-table td {
        padding: 6px 8px;
        border: 1px solid #000000;
        font-size: 10pt;
      }

      .totals-table .grand-total {
        font-weight: bold;
        font-size: 11pt;
        background-color: #f0f0f0;
      }

      .payment-info {
        border-top: 1px solid #000000;
        padding-top: 12px;
        margin-top: 30px;
        font-size: 9.5pt;
      }

      .payment-info h4 {
        margin: 0 0 6px 0;
        font-size: 10pt;
        text-transform: uppercase;
      }

      .signatures {
        width: 100%;
        margin-top: 40px;
        border-collapse: collapse;
      }

      .signatures td {
        width: 50%;
        vertical-align: top;
        font-size: 10pt;
      }

      .sig-box {
        height: 70px;
      }
    </style>
  </head>
  <body>
    <div class="invoice-header">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top;">
            <table style="border-collapse: collapse; width: 100%;">
              <tr>
                ${
                  logoDataUri
                    ? `<td style="vertical-align: top; width: 62px;"><img class="logo" src="${logoDataUri}" alt="Logo" /></td>`
                    : ""
                }
                <td style="vertical-align: top;">
                  <div class="company-title">${escapeHtml(entreprise.raisonSociale || "AC ERP")}</div>
                  <div class="company-subtitle">Gestion commerciale et facturation</div>
                  <div class="company-details">
                    ${entrepriseLigne1}<br>
                    ${entrepriseLigne2}<br>
                    ${entrepriseLigne3}<br>
                    ${entrepriseLigne4}
                  </div>
                </td>
              </tr>
            </table>
          </td>
          <td style="vertical-align: top; text-align: right; width: 35%;">
            <div style="border: 2px solid #000000; padding: 10px; text-align: center;">
              <span style="font-size: 14pt; font-weight: bold; display: block; text-transform: uppercase;">FACTURE</span>
              <span style="font-size: 10pt; display:block;">N ${escapeHtml(facture.numeroFacture)}</span>
              <span style="font-size: 9pt; display:block; margin-top: 3px; text-transform: uppercase;">${escapeHtml(factureVariant)}</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <table class="meta-table">
      <tr>
        <td><strong>Date d'emission :</strong> ${escapeHtml(date(facture.dateEmission))}</td>
        <td class="text-right"><strong>Mode de reglement :</strong> ${escapeHtml(modePaiement)}</td>
      </tr>
      <tr>
        <td><strong>Date d'echeance :</strong> ${escapeHtml(date(facture.dateEcheance))}</td>
        <td class="text-right"><strong>Statut :</strong> ${escapeHtml(statut)}</td>
      </tr>
      <tr>
        <td colspan="2"><strong>Client :</strong> ${escapeHtml(tiersNom)}</td>
      </tr>
    </table>

    ${clientInfoBlock}

    <table class="items-table">
        <thead>
          <tr>
            <th style="width: 8%;">N</th>
            <th style="width: 47%;">Designation des Prestations / Articles</th>
            <th style="width: 12%;" class="text-center">Qte</th>
            <th style="width: 16%;" class="text-right">P.U. HT (${escapeHtml(currency)})</th>
            <th style="width: 17%;" class="text-right">Total HT (${escapeHtml(currency)})</th>
          </tr>
        </thead>
        <tbody>${lignes || `<tr><td colspan="5" class="text-center">Aucune ligne</td></tr>`}</tbody>
      </table>

      <div class="totals-wrapper">
        <table class="totals-table">
          <tr>
            <td><strong>Total HT</strong></td>
            <td class="text-right">${money(facture.totalHt, currency)}</td>
          </tr>
          <tr>
            <td>TVA</td>
            <td class="text-right">${money(facture.totalTva, currency)}</td>
          </tr>
          <tr class="grand-total">
            <td><strong>TOTAL TTC A PAYER</strong></td>
            <td class="text-right"><strong>${money(facture.totalTtc, currency)}</strong></td>
          </tr>
        </table>
      </div>

      <div class="payment-info">
        <h4>Mentions et Informations complementaires</h4>
        <p style="margin: 0;">${escapeHtml(legalText || "Merci pour votre confiance.")}</p>
      </div>

      <table class="signatures">
        <tr>
          <td>
            <strong>Le Client :</strong><br>
            <span style="font-size: 8.5pt; font-style: italic;">(Mention "Bon pour accord")</span>
            <div class="sig-box"></div>
          </td>
          <td style="text-align: right;">
            <strong>La Direction :</strong><br>
            <span style="font-size: 8.5pt; font-style: italic;">(Signature et Cachet)</span>
            <div class="sig-box"></div>
          </td>
        </tr>
      </table>
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
