import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prisma from "../../config/database.js";
import { ApiError } from "../../utils/response.util.js";
import { renderPdfDocument } from "../../services/pdf-render.service.js";
import { iaRepository } from "./ia.repository.js";

const MODEL = process.env.LLM_MODEL || "claude-haiku-4-5";
const FALLBACK_RECOMMENDATIONS = [
  "Analyser les tendances de vente récentes.",
  "Vérifier les niveaux de stock critiques.",
  "Relancer les clients avec des factures impayées.",
  "Optimiser les délais de réapprovisionnement.",
];
const number = (value) => Number(value || 0);
const money = (value) => `${number(value).toLocaleString("fr-FR")} FCFA`;
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function requireApiKey() {
  if (!process.env.ANTHROPIC_API_KEY)
    throw new ApiError(503, "IA_UNAVAILABLE", "Service IA non configuré");
}

async function askClaude(
  system,
  messages,
  maxTokens = Number(process.env.LLM_MAX_TOKENS) || 2000,
) {
  requireApiKey();
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: MODEL,
      system,
      messages,
      max_tokens: maxTokens,
    });
    return response.content?.find((part) => part.type === "text")?.text || "";
  } catch (error) {
    throw new ApiError(
      503,
      "IA_UNAVAILABLE",
      "Le service IA est temporairement indisponible. Réessayez dans quelques instants.",
      error?.message,
    );
  }
}

function periodStart(period) {
  const date = new Date();
  if (period === "semaine") date.setDate(date.getDate() - 7);
  else if (period === "mois") date.setDate(1);
  else if (period === "trimestre") date.setMonth(date.getMonth() - 2, 1);
  else date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function collectContext(message) {
  const query = message.toLowerCase();
  const context = {};
  if (/vente|chiffre|\bca\b|facture/.test(query))
    context.ventes = await prisma.facture.findMany({
      where: {
        typeFacture: "VENTE",
        dateEmission: { gte: periodStart("mois") },
      },
      take: 50,
      select: {
        numeroFacture: true,
        totalTtc: true,
        montantPaye: true,
        statut: true,
        dateEmission: true,
      },
    });
  if (/stock|rupture|produit/.test(query))
    context.stocks = await prisma.stock.findMany({
      take: 50,
      include: {
        produit: {
          select: { designation: true, reference: true, stockMinimum: true },
        },
      },
    });
  if (/client|impayé|impaye/.test(query))
    context.impayes = await prisma.facture.findMany({
      where: {
        typeFacture: "VENTE",
        statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "EN_RETARD"] },
      },
      take: 50,
      include: { client: { select: { nom: true } } },
    });
  if (/achat|fournisseur|commande/.test(query))
    context.achats = await prisma.bonCommandeFournisseur.findMany({
      take: 50,
      orderBy: { dateCommande: "desc" },
      include: { fournisseur: { select: { raisonSociale: true } } },
    });
  if (/paiement|trésorerie|tresorerie/.test(query))
    context.paiements = await prisma.paiement.findMany({
      take: 50,
      orderBy: { datePaiement: "desc" },
      select: { montant: true, modePaiement: true, datePaiement: true },
    });
  if (!Object.keys(context).length) {
    const [ventes, factures, produits, clients] = await Promise.all([
      prisma.facture.aggregate({
        where: { typeFacture: "VENTE" },
        _sum: { totalTtc: true },
      }),
      prisma.facture.count({ where: { typeFacture: "VENTE" } }),
      prisma.produit.count({ where: { statut: "ACTIF" } }),
      prisma.client.count({ where: { statut: "ACTIF" } }),
    ]);
    context.general = {
      chiffreAffaires: number(ventes._sum.totalTtc),
      factures,
      produits,
      clients,
    };
  }
  return context;
}

async function collectReportData(type, dateDebut) {
  if (type === "stocks") {
    const stocks = await prisma.stock.findMany({
      take: 50,
      include: { produit: true },
    });
    return {
      stocks,
      total: stocks.reduce(
        (sum, item) =>
          sum + number(item.stockActuel) * number(item.produit?.prixAchatHt),
        0,
      ),
      marge: 0,
      risque: stocks.filter(
        (item) => item.stockActuel <= item.produit.stockMinimum,
      ).length,
    };
  }
  if (type === "achats") {
    const achats = await prisma.bonCommandeFournisseur.findMany({
      where: { dateCommande: { gte: dateDebut } },
      take: 50,
      orderBy: { dateCommande: "desc" },
      include: { fournisseur: true, lignes: true },
    });
    return {
      achats,
      total: achats.reduce((sum, item) => sum + number(item.totalTtc), 0),
      marge: 0,
      risque: achats.length,
    };
  }
  const factures = await prisma.facture.findMany({
    where: {
      dateEmission: { gte: dateDebut },
      typeFacture: type === "ventes" ? "VENTE" : { in: ["VENTE", "ACHAT"] },
    },
    take: 50,
    orderBy: { dateEmission: "desc" },
    include: { client: true, fournisseur: true, lignes: true, paiements: true },
  });
  const paiements =
    type === "financier"
      ? await prisma.paiement.findMany({
          where: { datePaiement: { gte: dateDebut } },
          take: 50,
          orderBy: { datePaiement: "desc" },
          include: {
            facture: {
              select: {
                numeroFacture: true,
                typeFacture: true,
                totalTtc: true,
              },
            },
          },
        })
      : [];
  const total = factures.reduce((sum, item) => sum + number(item.totalTtc), 0);
  const achats = factures
    .filter((item) => item.typeFacture === "ACHAT")
    .reduce((sum, item) => sum + number(item.totalTtc), 0);
  return {
    factures,
    paiements,
    totalPaiements: paiements.reduce(
      (sum, paiement) => sum + number(paiement.montant),
      0,
    ),
    total,
    marge: total - achats,
    risque: factures.filter((item) => item.statut !== "SOLDEE").length,
  };
}

function reportRows(data, type) {
  if (type === "stocks")
    return (data.stocks || [])
      .map(
        (stock) =>
          `<tr><td>${escapeHtml(stock.produit?.reference || "-")}</td><td>${escapeHtml(stock.produit?.designation || "-")}</td><td class="text-center">${stock.stockActuel}</td><td class="text-center">${stock.produit?.stockMinimum || 0}</td><td class="text-right">${money(number(stock.stockActuel) * number(stock.produit?.prixAchatHt))}</td><td class="text-center">${number(stock.stockActuel) <= number(stock.produit?.stockMinimum) ? "Alerte" : "Normal"}</td></tr>`,
      )
      .join("");
  if (type === "achats")
    return (data.achats || [])
      .map(
        (item) =>
          `<tr><td>${escapeHtml(item.numeroBcf)}</td><td>${escapeHtml(item.fournisseur?.raisonSociale || "-")}</td><td>${escapeHtml(item.statut)}</td><td class="text-right">${money(item.totalTtc)}</td><td>${new Date(item.dateCommande).toLocaleDateString("fr-FR")}</td></tr>`,
      )
      .join("");
  return (data.factures || [])
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.numeroFacture)}</td><td>${escapeHtml(item.client?.nom || item.fournisseur?.raisonSociale || "-")}</td><td>${escapeHtml(item.statut)}</td><td class="text-right">${money(item.totalTtc)}</td><td>${new Date(item.dateEmission).toLocaleDateString("fr-FR")}</td></tr>`,
    )
    .join("");
}

function svgBarChart(title, items, color = "#2563eb") {
  const values = items.map((item) => Math.max(0, number(item.value)));
  const maxValue = Math.max(...values, 1);
  const width = 520;
  const height = 190;
  const baseline = 150;
  const barWidth = Math.max(
    24,
    Math.floor(410 / Math.max(items.length, 1)) - 12,
  );
  const bars = items
    .slice(0, 6)
    .map((item, index) => {
      const barHeight = Math.round(
        (Math.max(0, number(item.value)) / maxValue) * 105,
      );
      const x = 58 + index * (barWidth + 12);
      const y = baseline - barHeight;
      const label = escapeHtml(String(item.label).slice(0, 13));
      return `<g><rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}"/><text x="${x + barWidth / 2}" y="${baseline + 16}" text-anchor="middle" font-size="8" fill="#64748b">${label}</text><text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="8" fill="#0f172a">${Math.round(number(item.value)).toLocaleString("fr-FR")}</text></g>`;
    })
    .join("");
  return `<div class="chart-block"><div class="chart-title">${escapeHtml(title)}</div><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}"><line x1="45" y1="${baseline}" x2="500" y2="${baseline}" stroke="#cbd5e1"/>${bars}</svg></div>`;
}

function svgDonutChart(title, items) {
  const palette = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626"];
  const total =
    items.reduce((sum, item) => sum + Math.max(0, number(item.value)), 0) || 1;
  let offset = 0;
  const segments = items
    .filter((item) => number(item.value) > 0)
    .slice(0, 5)
    .map((item, index) => {
      const portion = (number(item.value) / total) * 100;
      const segment = `<circle cx="86" cy="86" r="55" fill="none" stroke="${palette[index]}" stroke-width="22" stroke-dasharray="${portion} ${100 - portion}" stroke-dashoffset="${-offset}" pathLength="100" transform="rotate(-90 86 86)"/>`;
      offset += portion;
      return segment;
    })
    .join("");
  const legend = items
    .slice(0, 5)
    .map(
      (item, index) =>
        `<div class="chart-legend"><span style="background:${palette[index]}"></span>${escapeHtml(item.label)} <strong>${Math.round(number(item.value)).toLocaleString("fr-FR")}</strong></div>`,
    )
    .join("");
  return `<div class="chart-block"><div class="chart-title">${escapeHtml(title)}</div><div class="donut-layout"><svg viewBox="0 0 172 172" role="img" aria-label="${escapeHtml(title)}"><circle cx="86" cy="86" r="55" fill="none" stroke="#e2e8f0" stroke-width="22"/>${segments}<text x="86" y="82" text-anchor="middle" font-size="16" font-weight="700" fill="#0f172a">${Math.round(total).toLocaleString("fr-FR")}</text><text x="86" y="100" text-anchor="middle" font-size="9" fill="#64748b">total</text></svg><div class="chart-legends">${legend}</div></div></div>`;
}

function buildReportCharts(data, type) {
  if (type === "stocks") {
    const stockItems = (data.stocks || []).slice(0, 6).map((stock) => ({
      label: stock.produit?.reference || "Produit",
      value: number(stock.stockActuel),
    }));
    const normal = (data.stocks || []).filter(
      (stock) =>
        number(stock.stockActuel) > number(stock.produit?.stockMinimum),
    ).length;
    const critical = (data.stocks || []).length - normal;
    return `${svgBarChart("Niveaux de stock par référence", stockItems, "#2563eb")}${svgDonutChart(
      "Répartition des seuils",
      [
        { label: "Conformes", value: normal },
        { label: "Sous seuil", value: critical },
      ],
    )}`;
  }
  const records = type === "achats" ? data.achats || [] : data.factures || [];
  const statusItems = Object.entries(
    records.reduce((acc, item) => {
      acc[item.statut] = (acc[item.statut] || 0) + 1;
      return acc;
    }, {}),
  ).map(([label, value]) => ({ label, value }));
  const amountItems = records.slice(0, 6).map((item) => ({
    label: type === "achats" ? item.numeroBcf : item.numeroFacture,
    value: number(item.totalTtc),
  }));
  const charts = `${svgBarChart("Volumes par document", amountItems, type === "achats" ? "#059669" : "#2563eb")}${svgDonutChart("Répartition par statut", statusItems)}`;
  if (type === "financier") {
    const paymentItems = (data.paiements || []).slice(0, 6).map((payment) => ({
      label: payment.modePaiement,
      value: number(payment.montant),
    }));
    return `${charts}${svgBarChart("Encaissements récents", paymentItems, "#d97706")}`;
  }
  return charts;
}

function buildReportNarrative(type, periode, data) {
  const elements =
    data.factures?.length || data.achats?.length || data.stocks?.length || 0;
  const periodLabel = {
    semaine: "la semaine en cours",
    mois: "le mois en cours",
    trimestre: "le trimestre en cours",
    annee: "l'année en cours",
  }[periode];

  if (type === "stocks") {
    return `Sur ${elements} références analysées pour ${periodLabel}, la valeur estimée du stock est de ${money(data.total)}. ${data.risque} référence(s) sont au seuil de sécurité ou en dessous. La priorité est de sécuriser les articles critiques et de confirmer les réapprovisionnements nécessaires.`;
  }
  if (type === "achats") {
    return `Les ${elements} bons de commande fournisseurs recensés pour ${periodLabel} représentent ${money(data.total)} TTC. Le suivi doit porter sur les commandes non réceptionnées, les délais fournisseurs et le rapprochement entre commandes, réceptions et factures.`;
  }
  if (type === "financier") {
    return `Pour ${periodLabel}, le périmètre financier analyse ${elements} facture(s), un volume de ${money(data.total)} et ${money(data.totalPaiements)} d'encaissements. La marge indicative est de ${money(data.marge)} ; ${data.risque} facture(s) nécessitent un suivi de règlement.`;
  }
  return `Pour ${periodLabel}, ${elements} facture(s) de vente représentent ${money(data.total)} de chiffre d'affaires. ${data.risque} facture(s) ne sont pas soldées. Les actions prioritaires sont le suivi des échéances, la relance des impayés et la consolidation des opportunités commerciales.`;
}

async function buildReportHtml(type, periode, data, narrative) {
  const filename = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../services/rapport_global_commercial_financier.html",
  );
  const template = await fs.readFile(filename, "utf8");
  const title = {
    ventes: "Rapport Performance Ventes & Commercial",
    achats: "Rapport des Achats & Approvisionnements",
    stocks: "Rapport de Gestion des Stocks & Inventaire",
    financier: "Rapport Financier & Compte de Résultat",
  }[type];
  const headers =
    type === "stocks"
      ? "<th>Référence</th><th>Produit</th><th>Stock</th><th>Seuil</th><th>Valeur</th><th>Statut</th>"
      : "<th>Référence</th><th>Partenaire</th><th>Statut</th><th>Montant TTC</th><th>Date</th>";
  const charts = buildReportCharts(data, type);
  const chartStyles = `<style>.report-charts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0 20px}.chart-block{border:1px solid #cbd5e1;background:#fff;padding:10px;break-inside:avoid}.chart-title{font-size:8.5pt;font-weight:700;color:#0f172a;margin-bottom:4px}.chart-block svg{display:block;width:100%;height:180px}.donut-layout{display:flex;align-items:center;gap:8px}.donut-layout svg{width:48%;height:150px}.chart-legends{flex:1}.chart-legend{font-size:7.5pt;color:#475569;margin:5px 0}.chart-legend span{display:inline-block;width:8px;height:8px;margin-right:5px;border-radius:50%}.chart-legend strong{color:#0f172a;float:right}@media print{.report-charts{grid-template-columns:1fr 1fr}.chart-block{break-inside:avoid}}</style>`;
  const body = `${chartStyles}<div class="header-container"><table style="width:100%"><tr><td><div class="company-name">AC ERP</div><div class="report-main-title">${title}</div><div class="report-subtitle">Rapport réel généré pour la période : ${periode}</div></td><td class="text-right"><span class="period-pill">IA ERP</span><div style="font-size:8pt;color:#64748b;margin-top:6px">Généré le : ${new Date().toLocaleDateString("fr-FR")}</div></td></tr></table></div><table class="kpi-table"><tr><td class="kpi-card"><div class="kpi-title">Éléments analysés</div><div class="kpi-value">${data.factures?.length || data.achats?.length || data.stocks?.length || 0}</div><div class="kpi-trend trend-up">Données ERP réelles</div></td><td class="kpi-card green"><div class="kpi-title">Montant total</div><div class="kpi-value">${money(data.total)}</div><div class="kpi-trend trend-up">Période ${periode}</div></td><td class="kpi-card amber"><div class="kpi-title">Marge brute</div><div class="kpi-value">${money(data.marge)}</div><div class="kpi-trend trend-up">Calculée sur les données</div></td><td class="kpi-card purple"><div class="kpi-title">Indicateur</div><div class="kpi-value">${data.risque || "Suivi"}</div><div class="kpi-trend trend-up">Analyse automatisée</div></td></tr></table><div class="executive-box"><div class="executive-title">Synthèse exécutive</div><p class="executive-text">${escapeHtml(narrative)}</p></div><div class="section-header"><div class="section-title">Indicateurs graphiques</div></div><div class="report-charts">${charts}</div><div class="section-header"><div class="section-title">Détail des données ERP</div></div><table class="data-table"><thead><tr>${headers}</tr></thead><tbody>${reportRows(data, type) || `<tr><td colspan="6" class="text-center">Aucune donnée sur cette période</td></tr>`}</tbody></table>`;
  return template.replace(/<body>[\s\S]*<\/body>/i, `<body>${body}</body>`);
}

async function buildForecasts() {
  const since = new Date();
  since.setMonth(since.getMonth() - 6, 1);
  const invoices = await prisma.facture.findMany({
    where: { typeFacture: "VENTE", dateEmission: { gte: since } },
    take: 50,
    select: { totalTtc: true, dateEmission: true },
  });
  const monthly = new Map();
  for (const invoice of invoices) {
    const key = new Date(invoice.dateEmission).toISOString().slice(0, 7);
    monthly.set(key, (monthly.get(key) || 0) + number(invoice.totalTtc));
  }
  const values = [...monthly.values()];
  const average = values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
  const growth =
    values.length > 1 && values[0]
      ? (values[values.length - 1] / values[0]) ** (1 / (values.length - 1)) - 1
      : 0;
  const previsionsMensuelles = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() + index + 1, 1);
    const montantPrevu = Math.round(average * (1 + growth) ** (index + 1));
    return {
      mois: date.toISOString().slice(0, 7),
      montantPrevu,
      min: Math.round(montantPrevu * 0.8),
      max: Math.round(montantPrevu * 1.2),
    };
  });
  const salesByProduct = await prisma.ligneFacture.findMany({
    where: {
      facture: {
        typeFacture: "VENTE",
        dateEmission: { gte: since },
      },
      idProduit: { not: null },
    },
    take: 50,
    select: { idProduit: true, quantite: true },
  });
  const quantitiesByProduct = new Map();
  for (const line of salesByProduct) {
    quantitiesByProduct.set(
      line.idProduit,
      (quantitiesByProduct.get(line.idProduit) || 0) + line.quantite,
    );
  }
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
  nextMonth.setUTCHours(0, 0, 0, 0);
  await Promise.all(
    [...quantitiesByProduct.entries()].map(([idProduit, quantite]) => {
      const moyenneMensuelle = Math.max(1, Math.round(quantite / 6));
      return iaRepository.savePrevision({
        idProduit,
        periode: nextMonth,
        quantitePrevue: moyenneMensuelle,
        quantiteMin: Math.max(0, Math.floor(moyenneMensuelle * 0.8)),
        quantiteMax: Math.ceil(moyenneMensuelle * 1.2),
        tendance:
          growth > 0.02 ? "HAUSSE" : growth < -0.02 ? "BAISSE" : "STABLE",
        tauxConfiance: 85,
      });
    }),
  );
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const stocks = await prisma.stock.findMany({
    take: 50,
    include: {
      produit: true,
    },
  });
  const mouvements = await prisma.mouvementStock.findMany({
    where: {
      idProduit: { in: stocks.map((stock) => stock.idProduit) },
      typeMouvement: "SORTIE_VENTE",
      createdAt: { gte: thirtyDaysAgo },
    },
    take: 50,
    select: { idProduit: true, quantite: true },
  });
  const sortiesParProduit = new Map();
  for (const mouvement of mouvements) {
    sortiesParProduit.set(
      mouvement.idProduit,
      (sortiesParProduit.get(mouvement.idProduit) || 0) + mouvement.quantite,
    );
  }
  const produitsRisque = [];
  for (const stock of stocks) {
    if (stock.stockActuel > stock.produit.stockMinimum * 1.5) continue;
    const vitesseEcoulement =
      (sortiesParProduit.get(stock.idProduit) || 0) / 30;
    const joursAvantRupture = vitesseEcoulement
      ? Math.floor(stock.stockActuel / vitesseEcoulement)
      : null;
    const produitRisque = {
      idProduit: stock.idProduit,
      produit: stock.produit.designation,
      stockActuel: stock.stockActuel,
      stockMinimum: stock.produit.stockMinimum,
      vitesseEcoulement,
      joursAvantRupture,
    };
    produitsRisque.push(produitRisque);
    if (joursAvantRupture !== null) {
      const alerteExistante = await iaRepository.findAlerteActiveByProduit(
        stock.idProduit,
      );
      if (!alerteExistante) {
        await iaRepository.saveAlerteRupture({
          idProduit: stock.idProduit,
          joursAvantRupture,
          vitesseEcoulement,
          qteRecommandee: Math.max(
            stock.produit.stockMinimum * 2 - stock.stockActuel,
            Math.ceil(vitesseEcoulement * 30),
          ),
          statut: joursAvantRupture <= 7 ? "CRITIQUE" : "VIGILANCE",
        });
      }
    }
  }
  const recommandations = [
    produitsRisque[0]
      ? `Planifier le réapprovisionnement de ${produitsRisque[0].produit} avant la rupture estimée.`
      : "Maintenir le contrôle hebdomadaire des niveaux de stock critiques.",
    growth > 0.02
      ? "Ajuster les approvisionnements aux volumes de vente projetés en hausse."
      : "Suivre l'évolution des ventes avant d'augmenter les engagements fournisseurs.",
    "Relancer les factures arrivées à échéance afin de préserver la trésorerie.",
    "Revoir les délais fournisseurs des articles à forte vitesse d'écoulement.",
  ];
  return {
    previsionsMensuelles,
    produitsRisque,
    recommandations,
    fiabilite: 85,
    caPrevu: previsionsMensuelles[0]?.montantPrevu || 0,
  };
}

export const iaService = {
  async chat({ message, idConversation, userId }) {
    if (!String(message || "").trim())
      throw new ApiError(400, "MESSAGE_REQUIRED", "Le message est obligatoire");
    let conversation = idConversation
      ? await iaRepository.findConversationById(idConversation)
      : null;
    if (conversation && conversation.idUtilisateur !== userId)
      throw new ApiError(
        403,
        "CONVERSATION_FORBIDDEN",
        "Cette conversation ne vous appartient pas",
      );
    if (!conversation)
      conversation = await iaRepository.createConversation(userId, message);
    const history = (await iaRepository.findMessages(conversation.id))
      .reverse()
      .map((item) => ({ role: item.role, content: item.contenu }));
    const context = await collectContext(message);
    const answer = await askClaude(
      `Tu es AC, l'assistante IA de AC ERP, un système de gestion commerciale. N'utilise ni emoji, ni formule de salutation répétée. Ne récapitule les indicateurs ERP que si la question les demande explicitement. Pour ton identité ou ton créateur, explique simplement que tu es l'assistant IA d'AC ERP, propulsé par Claude d'Anthropic.
      RÈGLES DE RÉPONSE :
      - Tu réponds UNIQUEMENT en français
      - Tu ne traites que les sujets liés à la gestion commerciale (ventes, stocks, clients, factures, achats, paiements)
      - Si la question est hors sujet, réponds poliment que tu es spécialisée en gestion commerciale
      - Utilise la devise du système pour tous les montants
      - Sois concise et professionnelle

      RÈGLES DE FORMATAGE — TRÈS IMPORTANT :
      Tu dois formater tes réponses avec du Markdown enrichi selon le contexte :

      1. TABLEAUX : Utilise un tableau Markdown quand tu présentes :
        - Une liste de produits, clients, factures, commandes
        - Des comparaisons de données chiffrées
        - Des classements (top produits, top clients)
        - Des récapitulatifs avec plusieurs colonnes
        Exemple de tableau :
        | Produit | Stock | Prix |
        |---------|-------|------|
        | Laptop  | 12    | 450 000 FCFA |

      2. CODE : Utilise des blocs de code quand tu montres :
        - Des formules de calcul (marge, TVA, remise)
        - Des exemples de données JSON
        - Des calculs étape par étape
        Exemple :
        \`\`\`
        Marge = Prix vente - Prix achat
        Marge = 450 000 - 320 000 = 130 000 FCFA (28,9%)
        \`\`\`

      3. LISTES : Utilise des listes à puces pour les recommandations et étapes

      4. GRAS : Met en gras les chiffres importants et les points clés

      5. TITRES : Utilise ## pour les sections si la réponse est longue

      6. Lorsque tu as repondu à une question rassure toi que en repondant à la prochaine tu ne renvoie pas la précedente reponse sans que se ne soit demander

      DONNÉES ERP DISPONIBLES :
      ${JSON.stringify(context, null, 2)}
      `,
      [
        ...history,
        {
          role: "user",
          content: `${message}\n\nContexte ERP:\n${JSON.stringify(context)}`,
        },
      ],
      1024,
    );
    await iaRepository.createMessages([
      {
        idConversation: conversation.id,
        role: "user",
        contenu: message,
        donnees: context,
      },
      { idConversation: conversation.id, role: "assistant", contenu: answer },
    ]);
    return { reponse: answer, idConversation: conversation.id };
  },
  getConversations(userId) {
    return iaRepository.findConversations(userId);
  },
  async getConversationMessages(idConversation, userId) {
    const conversation =
      await iaRepository.findConversationById(idConversation);
    if (!conversation || conversation.idUtilisateur !== userId)
      throw new ApiError(
        404,
        "CONVERSATION_NOT_FOUND",
        "Conversation introuvable",
      );
    return (await iaRepository.findMessages(idConversation)).reverse();
  },
  async renameConversation(idConversation, titre, userId) {
    const conversation =
      await iaRepository.findConversationById(idConversation);
    if (!conversation || conversation.idUtilisateur !== userId)
      throw new ApiError(
        404,
        "CONVERSATION_NOT_FOUND",
        "Conversation introuvable",
      );
    if (!String(titre || "").trim())
      throw new ApiError(400, "TITLE_REQUIRED", "Le titre est obligatoire");
    return iaRepository.updateConversationTitle(
      idConversation,
      String(titre).trim(),
    );
  },
  async deleteConversation(idConversation, userId) {
    const conversation =
      await iaRepository.findConversationById(idConversation);
    if (!conversation || conversation.idUtilisateur !== userId)
      throw new ApiError(
        404,
        "CONVERSATION_NOT_FOUND",
        "Conversation introuvable",
      );
    await iaRepository.deleteConversation(idConversation);
  },
  async genererRapport({ type, periode, userId }) {
    if (!["ventes", "achats", "stocks", "financier"].includes(type))
      throw new ApiError(
        400,
        "INVALID_REPORT_TYPE",
        "Type de rapport invalide",
      );
    if (!["semaine", "mois", "trimestre", "annee"].includes(periode))
      throw new ApiError(400, "INVALID_REPORT_PERIOD", "Période invalide");
    const data = await collectReportData(type, periodStart(periode));
    const narrative = buildReportNarrative(type, periode, data);
    const html = await buildReportHtml(type, periode, data, narrative);
    const report = await iaRepository.createRapport({
      idUtilisateur: userId,
      typeRapport: type,
      periode,
      contenu: narrative,
    });
    return { ...report, html };
  },
  getPrevisions() {
    return buildForecasts();
  },
  getRapports(userId) {
    return iaRepository.findRapports(userId);
  },
  async telechargerRapportPdf(idRapport, userId) {
    const report = await iaRepository.findRapportById(idRapport);
    if (!report || report.idUtilisateur !== userId)
      throw new ApiError(404, "REPORT_NOT_FOUND", "Rapport introuvable");

    const data = await collectReportData(
      report.typeRapport,
      periodStart(report.periode),
    );
    const html = await buildReportHtml(
      report.typeRapport,
      report.periode,
      data,
      report.contenu,
    );
    const { buffer } = await renderPdfDocument({
      html,
      pdfOptions: { format: "A4", printBackground: true },
    });
    return {
      buffer,
      filename: `rapport-${report.typeRapport}-${report.periode}.pdf`,
    };
  },
  getAlertesRupture() {
    return iaRepository.findAlertesActives();
  },
  previsionsVentes() {
    return iaRepository.previsions({ orderBy: { periode: "desc" } });
  },
  alertesRupture() {
    return iaRepository.findAlertesActives();
  },
  conversations({ user }) {
    return iaRepository.findConversations(user.userId);
  },
  rapports({ user }) {
    return iaRepository.findRapports(user.userId);
  },
  rapportAuto(data, { user }) {
    return this.genererRapport({ ...data, userId: user.userId });
  },
};
