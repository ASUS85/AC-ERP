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
    .join(
      "\n",
    )}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
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
          <td><span class="font-mono">${escapeHtml(sale.ref)}</span></td>
          <td class="font-medium">${escapeHtml(sale.client)}</td>
          <td class="muted-text">${escapeHtml(sale.date)}</td>
          <td class="num font-semibold">${money(sale.montant, currency)}</td>
          <td><span class="badge">${escapeHtml(sale.statut)}</span></td>
        </tr>
      `,
    )
    .join("");

  const topProducts = (data.topProducts || [])
    .map(
      (product, index) => `
        <tr>
          <td class="rank">${index + 1}</td>
          <td class="font-medium">${escapeHtml(product.nom)}</td>
          <td class="num font-semibold">${Number(product.ventes || 0).toLocaleString("fr-FR")}</td>
        </tr>
      `,
    )
    .join("");

  const monthly = (data.salesTrend || [])
    .map(
      (month) => `
        <tr>
          <td class="font-medium">${escapeHtml(month.mois)}</td>
          <td class="num text-success">${money(month.ventes, currency)}</td>
          <td class="num text-danger">${money(month.achats, currency)}</td>
        </tr>
      `,
    )
    .join("");

  const kpis = (data.kpis || [])
    .map(
      (kpi) => `
        <div class="metric-card">
          <span class="metric-label">${escapeHtml(kpi.label)}</span>
          <strong class="metric-value">${escapeHtml(kpi.value)}</strong>
          <small class="metric-sub">${escapeHtml([kpi.delta, kpi.sub].filter(Boolean).join(" • "))}</small>
        </div>
      `,
    )
    .join("");

  const alerts = (data.alerts || [])
    .map(
      (alert) => `
        <li class="alert-item">
          <strong>${escapeHtml(alert.title)}</strong>
          <span>${escapeHtml(alert.text)}</span>
        </li>
      `,
    )
    .join("");

  return `<!doctype html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Rapport Dashboard</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }
      body {
        color: #1e293b;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        line-height: 1.5;
        margin: 0;
        padding: 0;
        background-color: #ffffff;
      }

      /* Typographie & Utilitaires */
      h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.02em; }
      h2 { 
        font-size: 12px; 
        font-weight: 600; 
        text-transform: uppercase; 
        letter-spacing: 0.05em; 
        color: #475569; 
        border-bottom: 2px solid #e2e8f0; 
        margin: 24px 0 12px 0; 
        padding-bottom: 6px; 
      }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #334155; }
      .font-medium { font-weight: 500; }
      .font-semibold { font-weight: 600; }
      .muted-text { color: #64748b; }
      .text-success { color: #16a34a; }
      .text-danger { color: #dc2626; }

      /* En-tête */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
      }
      .company-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px 14px;
        text-align: right;
      }
      .company-card strong { color: #0f172a; font-size: 12px; }

      /* Cartes Métriques / KPIs */
      .metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-top: 16px;
      }
      .metric-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-left: 4px solid #2563eb;
        border-radius: 6px;
        padding: 10px 12px;
      }
      .metric-label { font-size: 10px; font-weight: 500; color: #64748b; text-transform: uppercase; }
      .metric-value { display: block; font-size: 18px; font-weight: 700; color: #0f172a; margin: 4px 0; }
      .metric-sub { font-size: 9.5px; color: #64748b; }

      /* Grille de synthèse globale */
      .summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
      }
      .summary-item {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 8px 10px;
        font-size: 10px;
        color: #64748b;
      }
      .summary-item strong {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
        margin-top: 2px;
      }

      /* Layout Grille pour Sections Secondaires */
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      /* Tableaux */
      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        margin-top: 4px;
      }
      th {
        background-color: #f1f5f9;
        color: #475569;
        font-weight: 600;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        padding: 8px 10px;
        text-align: left;
        border-top: 1px solid #cbd5e1;
        border-bottom: 1px solid #cbd5e1;
      }
      td {
        padding: 8px 10px;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: middle;
      }
      tr:nth-child(even) td { background-color: #f8fafc; }
      .num { text-align: right; white-space: nowrap; }
      .rank { width: 24px; color: #94a3b8; font-weight: 600; }

      /* Badges & Alertes */
      .badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 9px;
        font-weight: 600;
        background-color: #e2e8f0;
        color: #334155;
      }
      .alert-box {
        background-color: #fff8f8;
        border: 1px solid #fee2e2;
        border-radius: 6px;
        padding: 10px 14px;
      }
      .alert-list { list-style: none; padding: 0; margin: 0; }
      .alert-item { padding: 4px 0; border-bottom: 1px dashed #fca5a5; }
      .alert-item:last-child { border-bottom: none; }
      .alert-item strong { color: #991b1b; }

      /* Pied de page */
      .footer {
        border-top: 1px solid #e2e8f0;
        color: #94a3b8;
        font-size: 9px;
        margin-top: 32px;
        padding-top: 12px;
        text-align: center;
      }

      /* Gestion de l'impression PDF */
      @media print {
        body { padding: 0; }
        .section-block, table, .metrics, .summary { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Tableau de bord</h1>
        <div class="muted-text">Rapport dynamique généré depuis les données de l'ERP</div>
      </div>
      <div class="company-card">
        <strong>${escapeHtml(entreprise.raisonSociale || "AC ERP")}</strong><br />
        <span class="muted-text">Généré le ${date()}</span><br />
        <span class="muted-text">Exercice : ${escapeHtml(global.annee || new Date().getFullYear())}</span>
      </div>
    </div>

    <div class="metrics">${kpis}</div>

    <div class="section-block">
      <h2>Statistiques globales</h2>
      <div class="summary">
        <div class="summary-item">Ventes<strong>${money(global.totalVentes, currency)}</strong></div>
        <div class="summary-item">Achats<strong>${money(global.totalAchats, currency)}</strong></div>
        <div class="summary-item">Marge brute<strong>${money(global.margeBrute, currency)}</strong></div>
        <div class="summary-item">Marge %<strong>${percent(global.margeBrutePourcentage)}</strong></div>
        <div class="summary-item">Panier moyen<strong>${money(global.panierMoyen, currency)}</strong></div>
        <div class="summary-item">Paiements reçus<strong>${money(global.paiementsRecus, currency)}</strong></div>
        <div class="summary-item">Valeur stock<strong>${money(global.valeurStock, currency)}</strong></div>
        <div class="summary-item">Factures à suivre<strong>${Number(global.facturesImpayees || 0)}</strong></div>
        <div class="summary-item">Clients actifs<strong>${Number(global.clientsActifs || 0)}</strong></div>
        <div class="summary-item">Produits actifs<strong>${Number(global.produitsActifs || 0)}</strong></div>
        <div class="summary-item">Produits sous seuil<strong>${Number(global.produitsSousSeuil || 0)}</strong></div>
        <div class="summary-item">Fournisseurs actifs<strong>${Number(global.fournisseursActifs || 0)}</strong></div>
      </div>
    </div>

    <div class="section-block">
      <h2>Évolution ventes et achats</h2>
      <table>
        <thead><tr><th>Mois</th><th class="num">Ventes</th><th class="num">Achats</th></tr></thead>
        <tbody>${monthly}</tbody>
      </table>
    </div>

    <div class="grid section-block">
      <div>
        <h2>Top produits</h2>
        <table>
          <thead><tr><th class="rank">#</th><th>Produit</th><th class="num">Unités vendues</th></tr></thead>
          <tbody>${topProducts}</tbody>
        </table>
      </div>
      <div>
        <h2>Alertes</h2>
        <div class="alert-box">
          <ul class="alert-list">${alerts || "<li class='alert-item'>Aucune alerte active</li>"}</ul>
        </div>
      </div>
    </div>

    <div class="section-block">
      <h2>Dernières ventes</h2>
      <table>
        <thead><tr><th>Référence</th><th>Client</th><th>Date</th><th class="num">Montant</th><th>Statut</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="footer">Rapport généré automatiquement par AC ERP.</div>
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
