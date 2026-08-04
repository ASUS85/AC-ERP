import { renderPdfDocument } from "./pdf-render.service.js";

const money = (value, currency = "XAF") =>
  `${Number(value || 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 0,
  })} ${currency}`;

const percent = (value) =>
  `${Number(value || 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 1,
  })} %`;

const date = (value = new Date()) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const pdfText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

function buildSimplePdf(lines) {
  const normalized = lines.map(pdfText);
  const stream = `BT /F1 9 Tf 42 800 Td 13 TL ${normalized
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

function buildSimpleLines(data, entreprise = {}) {
  const currency = entreprise.devise || "XAF";
  return [
    "RAPPORT TABLEAU DE BORD",
    `${entreprise.raisonSociale || "AC ERP"} - Genere le ${date()}`,
    "",
    "KPIS",
    ...(data.kpis || []).map(
      (kpi) =>
        `${kpi.label}: ${kpi.value}${kpi.delta ? ` (${kpi.delta})` : ""} - ${kpi.sub || ""}`,
    ),
    "",
    "STATISTIQUES GLOBALES",
    `Annee: ${data.globalStats?.annee || new Date().getFullYear()}`,
    `Ventes: ${money(data.globalStats?.totalVentes, currency)}`,
    `Achats: ${money(data.globalStats?.totalAchats, currency)}`,
    `Marge brute: ${money(data.globalStats?.margeBrute, currency)} (${percent(data.globalStats?.margeBrutePourcentage)})`,
    `Panier moyen: ${money(data.globalStats?.panierMoyen, currency)}`,
    `Paiements recus: ${money(data.globalStats?.paiementsRecus, currency)}`,
    `Valeur stock: ${money(data.globalStats?.valeurStock, currency)}`,
    `Clients actifs: ${data.globalStats?.clientsActifs || 0}`,
    `Produits actifs: ${data.globalStats?.produitsActifs || 0}`,
    `Fournisseurs actifs: ${data.globalStats?.fournisseursActifs || 0}`,
    `Factures a suivre: ${data.globalStats?.facturesImpayees || 0}`,
    "",
    "TOP PRODUITS",
    ...(data.topProducts || []).map(
      (product, index) => `${index + 1}. ${product.nom}: ${product.ventes}`,
    ),
    "",
    "DERNIERES VENTES",
    ...(data.recentSales || []).map(
      (sale) =>
        `${sale.ref} | ${sale.client} | ${sale.date} | ${money(sale.montant, currency)} | ${sale.statut}`,
    ),
  ];
}

export function buildDashboardHtml(data, entreprise = {}) {
  const currency = entreprise.devise || "XAF";
  const global = data.globalStats || {};
  const rows = (data.recentSales || [])
    .map(
      (sale) => `
        <tr>
          <td>${escapeHtml(sale.ref)}</td>
          <td>${escapeHtml(sale.client)}</td>
          <td>${escapeHtml(sale.date)}</td>
          <td class="num">${money(sale.montant, currency)}</td>
          <td>${escapeHtml(sale.statut)}</td>
        </tr>
      `,
    )
    .join("");
  const topProducts = (data.topProducts || [])
    .map(
      (product, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(product.nom)}</td>
          <td class="num">${Number(product.ventes || 0).toLocaleString("fr-FR")}</td>
        </tr>
      `,
    )
    .join("");
  const monthly = (data.salesTrend || [])
    .map(
      (month) => `
        <tr>
          <td>${escapeHtml(month.mois)}</td>
          <td class="num">${money(month.ventes, currency)}</td>
          <td class="num">${money(month.achats, currency)}</td>
        </tr>
      `,
    )
    .join("");
  const kpis = (data.kpis || [])
    .map(
      (kpi) => `
        <div class="metric">
          <span>${escapeHtml(kpi.label)}</span>
          <strong>${escapeHtml(kpi.value)}</strong>
          <small>${escapeHtml([kpi.delta, kpi.sub].filter(Boolean).join(" - "))}</small>
        </div>
      `,
    )
    .join("");
  const alerts = (data.alerts || [])
    .map(
      (alert) => `
        <li><strong>${escapeHtml(alert.title)}</strong> - ${escapeHtml(alert.text)}</li>
      `,
    )
    .join("");

  return `<!doctype html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Rapport dashboard</title>
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
      .metrics { display: grid; gap: 8px; grid-template-columns: repeat(3, 1fr); margin-top: 16px; }
      .metric { border: 1px solid #d1d5db; padding: 10px; }
      .metric span, .metric small { color: #4b5563; display: block; }
      .metric strong { display: block; font-size: 16px; margin: 4px 0; }
      .grid { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; }
      .num { text-align: right; white-space: nowrap; }
      .summary { display: grid; gap: 8px; grid-template-columns: repeat(4, 1fr); }
      .summary div { border: 1px solid #d1d5db; padding: 9px; }
      .summary strong { display: block; font-size: 13px; margin-top: 3px; }
      .footer { border-top: 1px solid #d1d5db; color: #6b7280; font-size: 10px; margin-top: 22px; padding-top: 8px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Tableau de bord</h1>
        <div class="muted">Rapport dynamique genere depuis les donnees de l'ERP</div>
      </div>
      <div class="box">
        <strong>${escapeHtml(entreprise.raisonSociale || "AC ERP")}</strong><br />
        Genere le ${date()}<br />
        Exercice : ${escapeHtml(global.annee || new Date().getFullYear())}
      </div>
    </div>

    <div class="metrics">${kpis}</div>

    <h2>Statistiques globales</h2>
    <div class="summary">
      <div>Ventes<strong>${money(global.totalVentes, currency)}</strong></div>
      <div>Achats<strong>${money(global.totalAchats, currency)}</strong></div>
      <div>Marge brute<strong>${money(global.margeBrute, currency)}</strong></div>
      <div>Marge %<strong>${percent(global.margeBrutePourcentage)}</strong></div>
      <div>Panier moyen<strong>${money(global.panierMoyen, currency)}</strong></div>
      <div>Paiements recus<strong>${money(global.paiementsRecus, currency)}</strong></div>
      <div>Valeur stock<strong>${money(global.valeurStock, currency)}</strong></div>
      <div>Factures a suivre<strong>${Number(global.facturesImpayees || 0)}</strong></div>
      <div>Clients actifs<strong>${Number(global.clientsActifs || 0)}</strong></div>
      <div>Produits actifs<strong>${Number(global.produitsActifs || 0)}</strong></div>
      <div>Produits sous seuil<strong>${Number(global.produitsSousSeuil || 0)}</strong></div>
      <div>Fournisseurs actifs<strong>${Number(global.fournisseursActifs || 0)}</strong></div>
    </div>

    <h2>Evolution ventes et achats</h2>
    <table>
      <thead><tr><th>Mois</th><th class="num">Ventes</th><th class="num">Achats</th></tr></thead>
      <tbody>${monthly}</tbody>
    </table>

    <div class="grid">
      <div>
        <h2>Top produits</h2>
        <table>
          <thead><tr><th>#</th><th>Produit</th><th class="num">Unites vendues</th></tr></thead>
          <tbody>${topProducts}</tbody>
        </table>
      </div>
      <div>
        <h2>Alertes</h2>
        <div class="box"><ul>${alerts || "<li>Aucune alerte active</li>"}</ul></div>
      </div>
    </div>

    <h2>Dernieres ventes</h2>
    <table>
      <thead><tr><th>Reference</th><th>Client</th><th>Date</th><th class="num">Montant</th><th>Statut</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="footer">Rapport genere automatiquement par AC ERP.</div>
  </body>
  </html>`;
}

export async function buildDashboardPdf(data, entreprise) {
  try {
    const { buffer } = await renderPdfDocument({
      html: buildDashboardHtml(data, entreprise),
      pdfOptions: {
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" },
      },
    });
    return buffer;
  } catch {
    return buildSimplePdf(buildSimpleLines(data, entreprise));
  }
}
