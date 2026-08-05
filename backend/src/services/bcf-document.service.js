import { renderPdfDocument } from "./pdf-render.service.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const money = (value, currency = "XAF") =>
  `${Number(value || 0).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
const date = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "-";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function pdfText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(value, max = 92) {
  const words = String(value || "").split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > max) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function extractNoteField(notes = "", label = "") {
  const source = String(notes || "");
  const target = String(label || "")
    .trim()
    .toLowerCase();
  if (!source || !target) return "";

  const found = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.toLowerCase().startsWith(`${target}:`));

  return found ? found.slice(found.indexOf(":") + 1).trim() : "";
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

function buildBcfTextLines(bonCommande, entreprise = {}) {
  const currency = entreprise.devise || "XAF";
  const fournisseur = bonCommande.fournisseur || {};
  const lines = [
    "BON DE COMMANDE FOURNISSEUR",
    `Numero: ${bonCommande.numeroBcf}`,
    `Date commande: ${date(bonCommande.dateCommande)}    Livraison prevue: ${date(bonCommande.dateLivraisonPrevue)}    Statut: ${bonCommande.statut}`,
    "",
    "EMETTEUR",
    `${entreprise.raisonSociale || "AC ERP"}`,
    `NIF/RCCM: ${entreprise.numeroFiscal || "-"}    Telephone: ${entreprise.telephone || "-"}    Email: ${entreprise.email || "-"}`,
    `Adresse: ${entreprise.adresse || "-"}`,
    "",
    "FOURNISSEUR",
    `${fournisseur.raisonSociale || "-"}`,
    `Code: ${fournisseur.codeFournisseur || "-"}    NIF/RCCM: ${fournisseur.numeroFiscal || "-"}`,
    `Telephone: ${fournisseur.telephone || "-"}    Email: ${fournisseur.email || "-"}`,
    `Adresse: ${fournisseur.adresse || "-"} ${fournisseur.ville || ""}`,
    "",
    "ARTICLES COMMANDES",
  ];

  (bonCommande.lignes || []).forEach((ligne, index) => {
    const produit = ligne.produit || {};
    const quantite = Number(ligne.quantiteCommandee || 0);
    const prix = Number(ligne.prixUnitaireHt || 0);
    const remise = Number(ligne.remise || 0);
    const tauxTva = Number(produit.tauxTva || 18);
    const montantHt = Number(
      ligne.montantHt || quantite * prix * (1 - remise / 100),
    );
    const label = `${index + 1}. ${produit.reference || ligne.idProduit} - ${produit.designation || "Produit"} | Qte: ${quantite} | PU HT: ${money(prix, currency)} | Remise: ${remise}% | TVA: ${tauxTva}% | Montant HT: ${money(montantHt, currency)}`;
    lines.push(...wrapText(label));
  });

  lines.push(
    "",
    `Total HT: ${money(bonCommande.totalHt, currency)}`,
    `Total TVA: ${money(bonCommande.totalTva, currency)}`,
    `Total TTC: ${money(bonCommande.totalTtc, currency)}`,
    "",
    "CONDITIONS ET OBSERVATIONS",
    `Conditions paiement: ${fournisseur.conditionsPaiement || "Selon accord commercial"}`,
    `Notes: ${bonCommande.notes || "-"}`,
    "",
    "Signature et cachet de l'entreprise: ______________________________",
    "Accuse de reception fournisseur: _________________________________",
    "",
    "Document a conserver comme piece justificative et a rapprocher avec la facture fournisseur et la reception marchandise.",
  );

  return lines;
}

function buildSimplePdf(lines) {
  const pages = [];
  for (let i = 0; i < lines.length; i += 42) pages.push(lines.slice(i, i + 42));

  const objects = [];
  const add = (content) => {
    objects.push(content);
    return objects.length;
  };

  const pageRefs = [];
  const fontRef = 3;
  const pagesRef = 2;
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  for (const pageLines of pages) {
    const content = [
      "BT",
      "/F1 10 Tf",
      "50 790 Td",
      "14 TL",
      ...pageLines.map(
        (line, index) => `${index === 0 ? "" : "T* "}(${pdfText(line)}) Tj`,
      ),
      "ET",
    ].join("\n");
    const contentRef = add(
      `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
    );
    const pageRef = add(
      `<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontRef} 0 R >> >> /Contents ${contentRef} 0 R >>`,
    );
    pageRefs.push(pageRef);
  }

  objects[pagesRef - 1] =
    `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;

  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(chunks.join(""), "utf8"));
    chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });
  const xrefOffset = Buffer.byteLength(chunks.join(""), "utf8");
  chunks.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  offsets
    .slice(1)
    .forEach((offset) =>
      chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`),
    );
  chunks.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );
  return Buffer.from(chunks.join(""), "utf8");
}

export function buildBcfHtml(bonCommande, entreprise = {}) {
  const currency = entreprise.devise || "XAF";
  const fournisseur = bonCommande.fournisseur || {};
  const logoDataUri = getLogoDataUri();
  const notes = String(bonCommande.notes || "");
  const siteLivraison =
    extractNoteField(notes, "Entrepot") ||
    extractNoteField(notes, "Entrepôt") ||
    "Entrepot principal";
  const conditionsPaiement =
    extractNoteField(notes, "Conditions paiement") ||
    fournisseur.conditionsPaiement ||
    "Selon accord commercial";
  const conditionsLivraison =
    extractNoteField(notes, "Conditions livraison") ||
    "Livraison selon planning valide";
  const commentaires =
    extractNoteField(notes, "Commentaires") ||
    "Aucun commentaire complementaire";

  const totalHt = toNumber(bonCommande.totalHt, 0);
  const totalTva = toNumber(bonCommande.totalTva, 0);
  const totalTtc = toNumber(bonCommande.totalTtc, totalHt + totalTva);

  const lignes = (bonCommande.lignes || [])
    .map((ligne, index) => {
      const produit = ligne.produit || {};
      const quantite = toNumber(ligne.quantiteCommandee, 0);
      const prix = toNumber(ligne.prixUnitaireHt, 0);
      const remise = toNumber(ligne.remise, 0);
      const tauxTva = toNumber(produit.tauxTva, 18);
      const montantHt = Number(
        ligne.montantHt || quantite * prix * (1 - remise / 100),
      );

      return `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${escapeHtml(produit.reference || ligne.idProduit || "-")}</td>
        <td>${escapeHtml(produit.designation || "Produit")}</td>
        <td class="text-center">${escapeHtml(produit.uniteMesure || "U")}</td>
        <td class="text-center">${quantite}</td>
        <td class="text-right">${money(prix, currency)}</td>
        <td class="text-right">${money(montantHt, currency)}</td>
      </tr>
    `;
    })
    .join("");

  const mentions = [
    "Ce bon de commande doit obligatoirement etre rappele sur le bordereau de livraison et la facture definitive.",
    "La facture doit mentionner le NIU valide du fournisseur et respecter le modele legal de facture normalisee.",
    conditionsLivraison,
  ];
  const isValidated =
    String(bonCommande.statut || "")
      .trim()
      .toUpperCase() === "VALIDE";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bon de Commande Fournisseur - Normes Cameroun</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 12mm;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      min-height: 100%;
    }

    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #1a1a1a;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    .container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      position: relative;
      z-index: 1;
      min-height: calc(297mm - 30mm);
      display: flex;
      flex-direction: column;
    }

    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      width: 62%;
      max-width: 430px;
      transform: translate(-50%, -50%);
      opacity: 0.08;
      filter: blur(2px);
      pointer-events: none;
      z-index: 0;
    }

    .watermark img {
      width: 100%;
      height: auto;
    }

    /* Header Company info & Flag Accent */

    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .header-table td {
      vertical-align: top;
      padding: 0;
      page-break-inside: avoid;
    }

    .company-logo-info {
      width: 55%;
    }

    .company-name {
      font-size: 16pt;
      font-weight: bold;
      color: #3b8cff;
      text-transform: uppercase;
      margin: 0 0 4px 0;
      letter-spacing: 0.5px;
    }

    .company-details {
      font-size: 8.5pt;
      color: #444;
      line-height: 1.35;
    }

    .company-details strong {
      color: #111;
    }

    .doc-title-block {
      width: 45%;
      text-align: right;
    }

    .doc-title {
      font-size: 18pt;
      font-weight: 800;
      color: #111;
      text-transform: uppercase;
      margin: 0 0 6px 0;
      letter-spacing: 1px;
    }

    .doc-meta {
      font-size: 9pt;
      background-color: #f8f9fa;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 10px 12px;
      display: inline-block;
      text-align: left;
      width: 100%;
    }

    .doc-meta-table {
      width: 100%;
      border-collapse: collapse;
    }

    .doc-meta-table td {
      padding: 2px 0;
      font-size: 8.5pt;
    }

    .doc-meta-table td.label {
      font-weight: bold;
      color: #3b8cff;
      width: 45%;
    }

    .doc-meta-table td.value {
      color: #0f172a;
      font-weight: 600;
    }

    /* Parties Section (Fournisseur & Livraison) */
    .parties-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 12px 0;
      margin-left: -12px;
      margin-right: -12px;
      margin-bottom: 20px;
    }

    .parties-card {
      width: 50%;
      vertical-align: top;
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 14px;
      page-break-inside: avoid;
    }

    .card-title {
      font-size: 9.5pt;
      font-weight: bold;
      text-transform: uppercase;
      color: #3b8cff;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }

    .card-content {
      font-size: 8.5pt;
      line-height: 1.4;
      color: #334155;
    }

    .card-content strong {
      color: #0f172a;
    }

    /* Main Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }

    .items-table th {
      background-color: #3b8cff;
      color: #ffffff;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      padding: 8px 10px;
      border: 1px solid #3b8cff;
      text-align: left;
      letter-spacing: 0.3px;
    }

    .items-table th.text-center { text-align: center; }
    .items-table th.text-right { text-align: right; }

    .items-table td {
      font-size: 8.5pt;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      color: #1e293b;
      vertical-align: top;
      page-break-inside: avoid;
    }

    .items-table thead { display: table-header-group; }
    .items-table tr { break-inside: avoid; page-break-inside: avoid; }

    .items-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    .items-table td.text-center { text-align: center; }
    .items-table td.text-right { text-align: right; }

    /* Summary & Totals Section */
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }

    .summary-table td {
      vertical-align: top;
      padding: 0;
      page-break-inside: avoid;
    }

    .conditions-block {
      width: 58%;
      padding-right: 15px;
    }

    .totals-block {
      width: 42%;
    }

    .totals-table {
      width: 100%;
      border-collapse: collapse;
    }

    .totals-table td {
      padding: 5px 10px;
      font-size: 8.5pt;
      border: 1px solid #cbd5e1;
    }

    .totals-table td.label {
      background-color: #f1f5f9;
      font-weight: 600;
      color: #334155;
      width: 55%;
    }

    .totals-table td.value {
      text-align: right;
      font-weight: 600;
      color: #0f172a;
    }

    .totals-table tr.total-row td {
      background-color: #3b8cff;
      color: #ffffff;
      font-size: 10pt;
      font-weight: bold;
      border-color: #3b8cff;
    }

    .totals-table tr.total-row td.value {
      color: #ffffff;
    }

    /* Amount in words block */
    .amount-words-box {
      background-color: #f8fafc;
      border: 1px dashed #94a3b8;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 8.5pt;
      margin-bottom: 20px;
    }

    .amount-words-box strong {
      color: #3b8cff;
    }

    /* Signatures Section */
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .signatures-table td {
      width: 33.33%;
      vertical-align: top;
      border: 1px solid #cbd5e1;
      padding: 10px;
      height: 110px;
      font-size: 8pt;
      page-break-inside: avoid;
    }

    .signature-title {
      font-weight: bold;
      text-transform: uppercase;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 6px;
      text-align: center;
    }

    .signature-note {
      font-size: 7.5pt;
      color: #64748b;
      font-style: italic;
      text-align: center;
      margin-top: 45px;
    }

    .approval-mark {
      align-items: center;
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-top: 10px;
    }

    .stamp-approved {
      border: 2px solid #3b8cff;
      border-radius: 999px;
      color: #3b8cff;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.8px;
      padding: 4px 10px;
      text-transform: uppercase;
      transform: rotate(-9deg);
    }

    .signature-default {
      color: #1e3a8a;
      font-family: "Brush Script MT", "Lucida Handwriting", cursive;
      font-size: 12pt;
      line-height: 1;
      transform: rotate(-6deg);
      white-space: nowrap;
    }

    /* Footer Legal */
    .footer-legal {
      margin-top: 25px;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      text-align: center;
      font-size: 7.5pt;
      color: #64748b;
      line-height: 1.3;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>

${
  logoDataUri
    ? `<div class="watermark" aria-hidden="true"><img src="${logoDataUri}" alt="" /></div>`
    : ""
}

<div class="container">

  <!-- En-tête : Société + Info Document -->
  <table class="header-table">
    <tr>
      <td class="company-logo-info">
        <div class="company-name">${escapeHtml(entreprise.raisonSociale || "AC ERP")}</div>
        <div class="company-details">
          <strong>Adresse :</strong> ${escapeHtml(entreprise.adresse || "-")}<br>
          <strong>NIF / NIU :</strong> ${escapeHtml(entreprise.numeroFiscal || "-")}<br>
          <strong>RCCM :</strong> ${escapeHtml(entreprise.rccm || "-")} | <strong>Régime :</strong> ${escapeHtml(entreprise.regimeFiscal || "-")}<br>
          <strong>Tél :</strong> ${escapeHtml(entreprise.telephone || "-")}<br>
          <strong>Email :</strong> ${escapeHtml(entreprise.email || "-")}
        </div>
      </td>
      <td class="doc-title-block">
        <div class="doc-title">BON DE COMMANDE</div>
        <div class="doc-meta">
          <table class="doc-meta-table">
            <tr>
              <td class="label">N° Commande :</td>
              <td class="value">${escapeHtml(bonCommande.numeroBcf || "-")}</td>
            </tr>
            <tr>
              <td class="label">Date d'émission :</td>
              <td class="value">${date(bonCommande.dateCommande)}</td>
            </tr>
            <tr>
              <td class="label">Délai de livraison :</td>
              <td class="value">${date(bonCommande.dateLivraisonPrevue)}</td>
            </tr>
            <tr>
              <td class="label">Mode de règlement :</td>
              <td class="value">${escapeHtml(conditionsPaiement)}</td>
            </tr>
            <tr>
              <td class="label">Devise :</td>
              <td class="value">${escapeHtml(currency)}</td>
            </tr>
            <tr>
              <td class="label">Statut :</td>
              <td class="value">${escapeHtml(bonCommande.statut || "-")}</td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  </table>

  <!-- Bloc Fournisseur & Lieu de Livraison -->
  <table class="parties-table">
    <tr>
      <td class="parties-card">
        <div class="card-title">FOURNISSEUR</div>
        <div class="card-content">
          <strong>Raison Sociale :</strong> ${escapeHtml(fournisseur.raisonSociale || "-")}<br>
          <strong>NIU :</strong> ${escapeHtml(fournisseur.numeroFiscal || "-")}<br>
          <strong>RCCM :</strong> ${escapeHtml(fournisseur.rccm || "-")}<br>
          <strong>Adresse :</strong> ${escapeHtml(fournisseur.adresse || "-")}, ${escapeHtml(fournisseur.ville || "")}<br>
          <strong>Contact :</strong> ${escapeHtml(fournisseur.contactPrincipal || "-")}<br>
          <strong>Téléphone :</strong> ${escapeHtml(fournisseur.telephone || "-")}<br>
          <strong>Email :</strong> ${escapeHtml(fournisseur.email || "-")}
        </div>
      </td>
      <td class="parties-card">
        <div class="card-title">LIEU DE LIVRAISON & FACTURATION</div>
        <div class="card-content">
          <strong>Site de livraison :</strong> ${escapeHtml(siteLivraison)}<br>
          <strong>Adresse :</strong> ${escapeHtml(entreprise.adresse || "-")}<br>
          <strong>Réceptionnaire :</strong> ${escapeHtml(entreprise.contactLivraison || "Service Logistique & Stocks")}<br>
          <strong>Téléphone :</strong> ${escapeHtml(entreprise.telephone || "-")}<br>
          <strong>Adresse de Facturation :</strong> ${escapeHtml(entreprise.adresseFacturation || entreprise.adresse || "-")}
        </div>
      </td>
    </tr>
  </table>

  <!-- Tableau des articles -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 5%;" class="text-center">N°</th>
        <th style="width: 15%;">Référence</th>
        <th style="width: 40%;">Désignation des Articles / Prestations</th>
        <th style="width: 8%;" class="text-center">Unité</th>
        <th style="width: 7%;" class="text-center">Qté</th>
        <th style="width: 12.5%;" class="text-right">P.U. HT (FCFA)</th>
        <th style="width: 12.5%;" class="text-right">Total HT (FCFA)</th>
      </tr>
    </thead>
    <tbody>
      ${lignes || `<tr><td colspan="7" style="text-align:center;color:#64748b;">Aucune ligne de commande</td></tr>`}
    </tbody>
  </table>

  <!-- Recapitulatif Financier (Conforme fiscalité Cameroun: TVA 19.25%, Précompte) -->
  <table class="summary-table">
    <tr>
      <td class="conditions-block">
        <div style="font-size: 8pt; color: #3b8cff; line-height: 1.35;">
          <strong>Conditions d'exécution & Mentions obligatoires :</strong>
          <ul style="margin: 4px 0 0 14px; padding: 0;">
            ${mentions.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
          </ul>
          <div style="margin-top: 8px; color:#334155;"><strong>Commentaires :</strong> ${escapeHtml(commentaires)}</div>
        </div>
      </td>
      <td class="totals-block">
        <table class="totals-table">
          <tr>
            <td class="label">Total Montant HT</td>
            <td class="value">${money(totalHt, currency)}</td>
          </tr>
          <tr>
            <td class="label">Remise Commerciale</td>
            <td class="value">${money(0, currency)}</td>
          </tr>
          <tr>
            <td class="label">Net Commercial HT</td>
            <td class="value">${money(totalHt, currency)}</td>
          </tr>
          <tr>
            <td class="label">TVA</td>
            <td class="value">${money(totalTva, currency)}</td>
          </tr>
          <tr>
            <td class="label">Précompte / Acompte IS</td>
            <td class="value">${money(0, currency)}</td>
          </tr>
          <tr class="total-row">
            <td class="label" style="color:#ffffff;">NET À PAYER TTC</td>
            <td class="value">${money(totalTtc, currency)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Montant en lettres -->
  <div class="amount-words-box">
    <strong>Arrêté le présent bon de commande à la somme de :</strong><br>
    <em>${escapeHtml(money(totalTtc, currency))} TTC.</em>
  </div>

  <!-- Signatures et validations -->
  <table class="signatures-table">
    <tr>
      <td>
        <div class="signature-title">Établi par (Acheteur)</div>
        <div style="font-size: 8pt; color: #334155;">Nom : <strong>${escapeHtml(entreprise.responsableAchats || "Service Achats")}</strong></div>
        <div style="font-size: 8pt; color: #334155;">Date : ${date(bonCommande.dateCommande)}</div>
      </td>
      <td>
        <div class="signature-title">Approuvé par (Direction)</div>
        <div style="font-size: 8pt; color: #334155;">Nom : <strong>${escapeHtml(entreprise.representantLegal || "La Direction Générale")}</strong></div>
        ${
          isValidated
            ? `<div class="approval-mark"><div class="stamp-approved">APPROUVE</div><div class="signature-default">Signature Direction</div></div>`
            : ""
        }
        <div class="signature-note">Cachet & Signature</div>
      </td>
      <td>
        <div class="signature-title">Confirmation Fournisseur</div>
        <div style="font-size: 8pt; color: #334155;">Bon pour accord & Date :</div>
        <div class="signature-note">Nom, Cachet & Signature</div>
      </td>
    </tr>
  </table>

  <!-- Pied de page légal -->
  <div class="footer-legal">
    TVA et obligations fiscales appliquees selon la reglementation en vigueur.<br>
    ${escapeHtml(entreprise.raisonSociale || "AC ERP")} - NIU: ${escapeHtml(entreprise.numeroFiscal || "-")} - RCCM: ${escapeHtml(entreprise.rccm || "-")}
  </div>
</div>
</body>
</html>`;
}

export async function buildBcfPdf(bonCommande, entreprise) {
  try {
    const { buffer } = await renderPdfDocument({
      html: buildBcfHtml(bonCommande, entreprise),
      pdfOptions: {
        format: "A4",
        printBackground: true,
        margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" },
      },
    });
    return buffer;
  } catch {
    return buildSimplePdf(buildBcfTextLines(bonCommande, entreprise));
  }
}
