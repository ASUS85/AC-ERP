import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prisma from "../../config/database.js";
import { ApiError } from "../../utils/response.util.js";
import { renderPdfDocument } from "../../services/pdf-render.service.js";
import { iaRepository } from "./ia.repository.js";

const MODEL = process.env.LLM_MODEL || "claude-sonnet-4-5";
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
  const body = `<div class="header-container"><table style="width:100%"><tr><td><div class="company-name">AC ERP</div><div class="report-main-title">${title}</div><div class="report-subtitle">Rapport réel généré pour la période : ${periode}</div></td><td class="text-right"><span class="period-pill">IA ERP</span><div style="font-size:8pt;color:#64748b;margin-top:6px">Généré le : ${new Date().toLocaleDateString("fr-FR")}</div></td></tr></table></div><table class="kpi-table"><tr><td class="kpi-card"><div class="kpi-title">Éléments analysés</div><div class="kpi-value">${data.factures?.length || data.achats?.length || data.stocks?.length || 0}</div><div class="kpi-trend trend-up">Données ERP réelles</div></td><td class="kpi-card green"><div class="kpi-title">Montant total</div><div class="kpi-value">${money(data.total)}</div><div class="kpi-trend trend-up">Période ${periode}</div></td><td class="kpi-card amber"><div class="kpi-title">Marge brute</div><div class="kpi-value">${money(data.marge)}</div><div class="kpi-trend trend-up">Calculée sur les données</div></td><td class="kpi-card purple"><div class="kpi-title">Indicateur</div><div class="kpi-value">${data.risque || "Suivi"}</div><div class="kpi-trend trend-up">Analyse automatisée</div></td></tr></table><div class="executive-box"><div class="executive-title">Synthèse exécutive</div><p class="executive-text">${escapeHtml(narrative)}</p></div><div class="section-header"><div class="section-title">Détail des données ERP</div></div><table class="data-table"><thead><tr>${headers}</tr></thead><tbody>${reportRows(data, type) || `<tr><td colspan="6" class="text-center">Aucune donnée sur cette période</td></tr>`}</tbody></table>`;
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
      "Tu es l'assistant IA francophone intégré à AC ERP, propulsé par Claude d'Anthropic. Réponds de façon professionnelle, concise et factuelle en français. Limite-toi à 2 à 5 phrases courtes ou une liste de 3 points maximum si nécessaire. N'utilise ni emoji, ni titre Markdown, ni tableau, ni formule de salutation répétée. Ne récapitule les indicateurs ERP que si la question les demande explicitement. Pour ton identité ou ton créateur, explique simplement que tu es l'assistant IA d'AC ERP, propulsé par Claude d'Anthropic.",
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
