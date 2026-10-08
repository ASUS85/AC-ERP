import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prisma from "../../config/database.js";
import { ApiError } from "../../utils/response.util.js";
import { renderPdfDocument } from "../../services/pdf-render.service.js";
import { iaRepository } from "./ia.repository.js";

const MODEL = process.env.LLM_MODEL;
const LLM_MAX_TOKENS = Number(process.env.LLM_MAX_TOKENS) || 2048;

const FALLBACK_RECOMMENDATIONS = [
  "Analyser les tendances de vente récentes.",
  "Vérifier les niveaux de stock critiques.",
  "Relancer les clients avec des factures impayées.",
  "Optimiser les délais de réapprovisionnement.",
];

const number = (value) => Number(value || 0);

const money = (value) =>
  `${number(value).toLocaleString("fr-FR")} FCFA`;

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
  maxTokens = LLM_MAX_TOKENS,
) {
  requireApiKey();

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: MODEL,
      system,
      messages,
      max_tokens: maxTokens,
    });

    return (
      response.content?.find((part) => part.type === "text")?.text || ""
    );
  } catch (error) {
    throw new ApiError(
      503,
      "IA_UNAVAILABLE",
      "Le service IA est temporairement indisponible. Réessayez dans quelques instants.",
      error?.message,
    );
  }
}

function periodRange(dateDebut, dateFin) {
  const start = new Date(`${dateDebut}T00:00:00`);
  const end = new Date(`${dateFin}T23:59:59.999`);

  return {
    gte: start,
    lte: end,
  };
}

function periodStart(period) {
  const date = new Date();

  if (period === "jour") {
    date.setHours(0, 0, 0, 0);
  } else if (period === "semaine") {
    date.setDate(date.getDate() - 7);
  } else if (period === "mois") {
    date.setDate(1);
  } else if (period === "trimestre") {
    date.setMonth(date.getMonth() - 2, 1);
  } else if (period === "annee") {
    date.setMonth(0, 1);
  } else {
    date.setMonth(date.getMonth() - 12);
  }

  date.setHours(0, 0, 0, 0);

  return date;
}

function detectPeriod(message) {
  const query = message.toLowerCase();

  if (
    /aujourd'hui|aujourd hui|ce jour|aujourd’hui/.test(query)
  )
    return "jour";

  if (
    /hier|jour précédent|jour precedent/.test(query)
  )
    return "hier";

  if (
    /cette semaine|cette semaine-ci|semaine en cours/.test(query)
  )
    return "semaine";

  if (
    /semaine dernière|semaine derniere|semaine précédente|semaine precedente/.test(
      query,
    )
  )
    return "semaine_derniere";

  if (
    /ce mois|mois en cours|mois actuel/.test(query)
  )
    return "mois";

  if (
    /mois dernier|mois précédent|mois precedent/.test(query)
  )
    return "mois_dernier";

  if (/trimestre/.test(query))
    return "trimestre";

  if (
    /cette année|cette annee|année en cours|annee en cours|annuel|annuelle/.test(
      query,
    )
  )
    return "annee";

  if (
    /année dernière|annee derniere|année précédente|annee precedente/.test(
      query,
    )
  )
    return "annee_derniere";

  return "global";
}

function getDateRangeFromPeriod(period) {
  const now = new Date();

  if (period === "jour") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return { gte: start, lte: end };
  }

  if (period === "hier") {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    return { gte: start, lte: end };
  }

  if (period === "semaine") {
    return {
      gte: periodStart("semaine"),
      lte: now,
    };
  }

  if (period === "mois") {
    return {
      gte: periodStart("mois"),
      lte: now,
    };
  }

  if (period === "trimestre") {
    return {
      gte: periodStart("trimestre"),
      lte: now,
    };
  }

  if (period === "annee") {
    return {
      gte: periodStart("annee"),
      lte: now,
    };
  }

  if (period === "mois_dernier") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    return { gte: start, lte: end };
  }

  if (period === "annee_derniere") {
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(
      now.getFullYear() - 1,
      11,
      31,
      23,
      59,
      59,
      999,
    );

    return { gte: start, lte: end };
  }

  return null;
}

function detectContextNeeds(message) {
  const query = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return {
    ventes:
      /vente|ventes|vendu|vendue|vendus|vendues|chiffre|ca\b|commercial|revenu|recette/.test(
        query,
      ),

    achats:
      /achat|achats|achete|achetes|fournisseur|fournisseurs|commande|commandes|approvisionnement/.test(
        query,
      ),

    stocks:
      /stock|stocks|rupture|ruptures|inventaire|disponible|disponibilite|quantite|quantites|reapprovisionnement/.test(
        query,
      ),

    clients:
      /client|clients|acheteur|acheteurs|credit|impaye|impayes|dette|dettes/.test(
        query,
      ),

    fournisseurs:
      /fournisseur|fournisseurs|prestataire|prestataires/.test(query),

    produits:
      /produit|produits|article|articles|reference|references|prix|designation|categorie|categories/.test(
        query,
      ),

    factures:
      /facture|factures|facturation|solde|soldee|reste a payer|echeance|retard/.test(
        query,
      ),

    paiements:
      /paiement|paiements|paye|payee|payes|payees|encaisse|encaissement|tresorerie/.test(
        query,
      ),

    previsions:
      /prevision|previsions|forecast|tendance|tendances|futur|future|avenir|rupture estimee/.test(
        query,
      ),

    rapports:
      /rapport|rapports|analyse|analyses|performance|performances|statistique|statistiques|indicateur|indicateurs/.test(
        query,
      ),

    aide:
      /comment|comment faire|comment effectuer|comment creer|comment modifier|comment supprimer|ou trouver|ou se trouve|fonctionnement|utiliser|utilisation|faire pour/.test(
        query,
      ),
  };
}

function buildKnowledgeContext() {
  return `
AC ERP est un ERP intelligent destiné à la gestion commerciale d'une entreprise.

OBJECTIF :
AC ERP centralise les opérations commerciales et administratives d'une entreprise :
ventes, achats, produits, stocks, clients, fournisseurs, facturation, paiements,
rapports, statistiques, prévisions et assistance intelligente.

MODULES PRINCIPAUX :
- Tableau de bord
- Utilisateurs
- Rôles et permissions
- Produits
- Catégories
- Clients
- Fournisseurs
- Stocks
- Achats
- Bons de commande fournisseurs
- Réceptions
- Factures
- Paiements
- Notifications
- Rapports
- Statistiques
- Prévisions
- Alertes de rupture
- Assistant IA

GESTION DES UTILISATEURS :
Les utilisateurs peuvent disposer de rôles et permissions.
Les permissions doivent être contrôlées côté backend.
Masquer un bouton dans l'interface ne constitue pas à lui seul une mesure de sécurité.

GESTION DES PRODUITS :
Un produit peut posséder notamment :
- une référence ;
- une désignation ;
- une catégorie ;
- un prix d'achat ;
- un prix de vente ;
- un stock ;
- un stock minimum ;
- un statut.

GESTION DU STOCK :
Le stock permet de connaître les quantités disponibles.
Le stock minimum sert de seuil de sécurité.
Les mouvements permettent de suivre les entrées et sorties.
Une vente validée entraîne une sortie de stock.
Une réception d'achat validée entraîne une entrée de stock.

GESTION DES VENTES :
Une vente peut être associée à un client.
Une vente contient des lignes de produits.
Les lignes déterminent notamment les quantités et montants.
La vente peut générer une facture.
Le paiement est enregistré sur la facture.
Une facture peut être totalement ou partiellement payée.
Le stock est mis à jour lors de la validation de la vente.

GESTION DES CLIENTS :
Un client peut avoir plusieurs factures.
Les factures permettent de suivre les montants dus et les paiements.
Un client peut être analysé selon son volume d'achat, ses paiements et ses impayés.

GESTION DES ACHATS :
Les achats sont réalisés auprès des fournisseurs.
Un bon de commande fournisseur peut contenir plusieurs lignes.
Une commande peut être réceptionnée.
La réception permet d'enregistrer les quantités réellement reçues.
Les opérations d'achat peuvent ensuite être associées à la facturation et aux paiements.

GESTION DES FOURNISSEURS :
Un fournisseur peut avoir plusieurs commandes et factures d'achat.
L'historique permet d'analyser les montants d'achat et les opérations réalisées.

FACTURATION :
Les factures possèdent un numéro.
Une facture contient des lignes et peut être associée à des paiements.
Une facture peut être émise, partiellement payée, soldée ou en retard selon les données disponibles.
Le reste à payer correspond au montant dû diminué des paiements enregistrés.

PAIEMENTS :
Une facture peut recevoir plusieurs paiements.
Un paiement peut être associé à une facture.
Les paiements permettent de suivre les encaissements ou règlements.

RAPPORTS :
AC ERP peut produire des rapports sur :
- les ventes ;
- les achats ;
- les stocks ;
- les données financières.

INTELLIGENCE ARTIFICIELLE :
L'assistant peut :
- répondre aux questions sur AC ERP ;
- analyser les données commerciales fournies par le backend ;
- présenter des statistiques ;
- identifier des tendances ;
- fournir des recommandations ;
- exploiter les prévisions générées par le système.

PRÉVISIONS :
Les prévisions sont des estimations calculées à partir des données historiques.
Elles ne doivent jamais être présentées comme des certitudes.

SÉCURITÉ DE L'IA :
L'assistant IA n'accède jamais directement à la base de données.
Il ne dispose d'aucun accès SQL.
Il ne dispose d'aucun accès Prisma.
Le backend AC ERP effectue les requêtes nécessaires puis transmet uniquement les résultats pertinents à l'IA.
L'IA ne peut pas modifier directement les données de la base.
`;
}

function isPoliteMessage(message) {
  const query = String(message || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return /^(merci|merci beaucoup|merci bien|merci infiniment|je te remercie|je vous remercie|thanks|thank you|d'accord|ok|okay|parfait|super|tres bien|c'est bon|cest bon|bien recu|compris|entendu|a bientot|bonne journee|bonne soiree|au revoir|salut|bonjour|bonsoir)[.!?,\s]*$/i.test(
    query,
  );
}

async function collectContext(message) {
  const query = String(message || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const needs = detectContextNeeds(message);
  const period = detectPeriod(message);
  const dateRange = getDateRangeFromPeriod(period);

  const context = {
    source: "backend_ac_erp",
    access: "donnees_preparees_par_le_backend",
    databaseAccess: false,
    period,
  };

  const tasks = [];

  /*
   * CONTEXTE GENERAL
   * Toujours récupérer quelques indicateurs légers.
   */
  tasks.push(
    Promise.all([
      prisma.facture.aggregate({
        where: {
          typeFacture: "VENTE",
          ...(dateRange ? { dateEmission: dateRange } : {}),
        },
        _sum: {
          totalTtc: true,
          montantPaye: true,
        },
        _count: {
          id: true,
        },
      }),

      prisma.produit.count({
        where: { statut: "ACTIF" },
      }),

      prisma.client.count({
        where: { statut: "ACTIF" },
      }),
    ]).then(([sales, products, clients]) => {
      context.resume = {
        chiffreAffaires: number(sales._sum.totalTtc),
        montantPaye: number(sales._sum.montantPaye),
        nombreFacturesVente: sales._count.id,
        nombreProduitsActifs: products,
        nombreClientsActifs: clients,
      };
    }),
  );

  /*
   * VENTES / FACTURES
   */
  if (needs.ventes || needs.factures || needs.clients) {
    tasks.push(
      prisma.facture
        .findMany({
          where: {
            typeFacture: "VENTE",
            ...(dateRange ? { dateEmission: dateRange } : {}),
          },
          take: 100,
          orderBy: {
            dateEmission: "desc",
          },
          select: {
            numeroFacture: true,
            totalTtc: true,
            montantPaye: true,
            statut: true,
            dateEmission: true,
            client: {
              select: {
                nom: true,
              },
            },
            lignes: {
              select: {
                idProduit: true,
                quantite: true,
                prixUnitaireHt: true,
                montantHt: true,
              },
            },
            paiements: {
              select: {
                montant: true,
                modePaiement: true,
                datePaiement: true,
              },
            },
          },
        })
        .then((factures) => {
          context.ventes = factures.map((facture) => ({
            numeroFacture: facture.numeroFacture,
            client: facture.client?.nom || null,
            totalTtc: number(facture.totalTtc),
            montantPaye: number(facture.montantPaye),
            resteAPayer: Math.max(
              0,
              number(facture.totalTtc) - number(facture.montantPaye),
            ),
            statut: facture.statut,
            dateEmission: facture.dateEmission,
            lignes: facture.lignes,
            paiements: facture.paiements,
          }));
        }),
    );
  }

  /*
   * STOCKS
   */
  if (needs.stocks || needs.produits || needs.previsions) {
    tasks.push(
      prisma.stock
        .findMany({
          take: 100,
          include: {
            produit: {
              select: {
                designation: true,
                reference: true,
                stockMinimum: true,
                prixAchatHt: true,
                prixVenteHt: true,
                statut: true,
              },
            },
          },
        })
        .then((stocks) => {
          context.stocks = stocks.map((stock) => ({
            idProduit: stock.idProduit,
            reference: stock.produit?.reference || null,
            designation: stock.produit?.designation || null,
            stockActuel: number(stock.stockActuel),
            stockMinimum: number(stock.produit?.stockMinimum),
            prixAchatHt: number(stock.produit?.prixAchatHt),
            prixVenteHt: number(stock.produit?.prixVenteHt),
            valeurStock:
              number(stock.stockActuel) *
              number(stock.produit?.prixAchatHt),
            statut: stock.produit?.statut || null,
            alerte:
              number(stock.stockActuel) <=
              number(stock.produit?.stockMinimum),
          }));

          context.stockAnalyse = {
            produitsSousSeuil: context.stocks.filter(
              (item) => item.alerte,
            ).length,

            valeurTotale: context.stocks.reduce(
              (sum, item) => sum + number(item.valeurStock),
              0,
            ),
          };
        }),
    );
  }

  /*
   * CLIENTS / IMPAYES
   */
  if (needs.clients || needs.factures || /impaye|dette|credit/.test(query)) {
    tasks.push(
      prisma.facture
        .findMany({
          where: {
            typeFacture: "VENTE",
            statut: {
              in: [
                "EMISE",
                "PARTIELLEMENT_PAYEE",
                "EN_RETARD",
              ],
            },
          },
          take: 100,
          orderBy: {
            dateEmission: "desc",
          },
          include: {
            client: {
              select: {
                nom: true,
              },
            },
            paiements: {
              select: {
                montant: true,
              },
            },
          },
        })
        .then((factures) => {
          context.impayes = factures.map((facture) => {
            const totalPaye = facture.paiements.reduce(
              (sum, paiement) =>
                sum + number(paiement.montant),
              0,
            );

            return {
              numeroFacture: facture.numeroFacture,
              client: facture.client?.nom || null,
              totalTtc: number(facture.totalTtc),
              montantPaye:
                number(facture.montantPaye) || totalPaye,
              resteAPayer: Math.max(
                0,
                number(facture.totalTtc) -
                (number(facture.montantPaye) || totalPaye),
              ),
              statut: facture.statut,
              dateEmission: facture.dateEmission,
            };
          });

          context.totalImpayes = context.impayes.reduce(
            (sum, facture) =>
              sum + number(facture.resteAPayer),
            0,
          );
        }),
    );
  }

  /*
   * ACHATS
   */
  if (needs.achats || needs.fournisseurs) {
    tasks.push(
      prisma.bonCommandeFournisseur
        .findMany({
          where: dateRange
            ? {
              dateCommande: dateRange,
            }
            : undefined,
          take: 100,
          orderBy: {
            dateCommande: "desc",
          },
          include: {
            fournisseur: {
              select: {
                raisonSociale: true,
              },
            },
            lignes: true,
          },
        })
        .then((achats) => {
          context.achats = achats.map((achat) => ({
            numeroBcf: achat.numeroBcf,
            fournisseur:
              achat.fournisseur?.raisonSociale || null,
            totalTtc: number(achat.totalTtc),
            statut: achat.statut,
            dateCommande: achat.dateCommande,
            nombreLignes: achat.lignes?.length || 0,
          }));

          context.totalAchats = context.achats.reduce(
            (sum, achat) =>
              sum + number(achat.totalTtc),
            0,
          );
        }),
    );
  }

  /*
   * PAIEMENTS
   */
  if (needs.paiements || needs.factures || needs.ventes) {
    tasks.push(
      prisma.paiement
        .findMany({
          where: dateRange
            ? {
              datePaiement: dateRange,
            }
            : undefined,
          take: 100,
          orderBy: {
            datePaiement: "desc",
          },
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
        .then((paiements) => {
          context.paiements = paiements.map((paiement) => ({
            montant: number(paiement.montant),
            modePaiement: paiement.modePaiement,
            datePaiement: paiement.datePaiement,
            facture:
              paiement.facture?.numeroFacture || null,
            typeFacture:
              paiement.facture?.typeFacture || null,
            totalFacture:
              number(paiement.facture?.totalTtc),
          }));

          context.totalPaiements = context.paiements.reduce(
            (sum, paiement) =>
              sum + number(paiement.montant),
            0,
          );
        }),
    );
  }

  /*
   * PRODUITS
   */
  if (needs.produits) {
    tasks.push(
      prisma.produit
        .findMany({
          where: {
            statut: "ACTIF",
          },
          take: 100,
          select: {
            id: true,
            designation: true,
            reference: true,
            prixAchatHt: true,
            prixVenteHt: true,
            stockMinimum: true,
            statut: true,
          },
        })
        .then((produits) => {
          context.produits = produits.map((produit) => ({
            id: produit.id,
            designation: produit.designation,
            reference: produit.reference,
            prixAchatHt: number(produit.prixAchatHt),
            prixVenteHt: number(produit.prixVenteHt),
            stockMinimum: number(produit.stockMinimum),
            statut: produit.statut,
          }));
        }),
    );
  }

  /*
   * MOUVEMENTS DE STOCK
   */
  if (needs.stocks || needs.previsions) {
    const mouvementsDateRange =
      dateRange || {
        gte: periodStart("mois"),
        lte: new Date(),
      };

    tasks.push(
      prisma.mouvementStock
        .findMany({
          where: {
            createdAt: mouvementsDateRange,
          },
          take: 100,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            idProduit: true,
            quantite: true,
            typeMouvement: true,
            stockAvant: true,
            createdAt: true,
          },
        })
        .then((mouvements) => {
          context.mouvementsStock = mouvements;
        }),
    );
  }

  await Promise.all(tasks);

  /*
   * CONTEXTE GENERAL DE SECOURS
   */
  if (Object.keys(context).length <= 3) {
    context.general = {
      description:
        "Résumé général des données disponibles dans AC ERP.",
      recommandations: FALLBACK_RECOMMENDATIONS,
    };
  }

  return context;
}

async function collectReportData(type, dateDebut, dateFin) {
  const dateRange = periodRange(dateDebut, dateFin);

  if (type === "stocks") {
    const currentStocks = await prisma.stock.findMany({
      take: 50,
      include: {
        produit: true,
      },
    });

    const movementsAfterPeriod = currentStocks.length
      ? await prisma.mouvementStock.findMany({
        where: {
          idProduit: {
            in: currentStocks.map(
              (stock) => stock.idProduit,
            ),
          },
          createdAt: {
            gt: dateRange.lte,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          idProduit: true,
          stockAvant: true,
        },
      })
      : [];

    const stockAtPeriodEnd = new Map();

    for (const movement of movementsAfterPeriod) {
      if (!stockAtPeriodEnd.has(movement.idProduit))
        stockAtPeriodEnd.set(
          movement.idProduit,
          movement.stockAvant,
        );
    }

    const stocks = currentStocks.map((stock) => ({
      ...stock,
      stockActuel:
        stockAtPeriodEnd.get(stock.idProduit) ??
        stock.stockActuel,
    }));

    return {
      stocks,
      total: stocks.reduce(
        (sum, item) =>
          sum +
          number(item.stockActuel) *
          number(item.produit?.prixAchatHt),
        0,
      ),
      marge: 0,
      risque: stocks.filter(
        (item) =>
          item.stockActuel <=
          item.produit.stockMinimum,
      ).length,
    };
  }

  if (type === "achats") {
    const achats =
      await prisma.bonCommandeFournisseur.findMany({
        where: {
          dateCommande: dateRange,
        },
        take: 50,
        orderBy: {
          dateCommande: "desc",
        },
        include: {
          fournisseur: true,
          lignes: true,
        },
      });

    return {
      achats,
      total: achats.reduce(
        (sum, item) => sum + number(item.totalTtc),
        0,
      ),
      marge: 0,
      risque: achats.length,
    };
  }

  const factures = await prisma.facture.findMany({
    where: {
      dateEmission: dateRange,
      typeFacture:
        type === "ventes"
          ? "VENTE"
          : {
            in: ["VENTE", "ACHAT"],
          },
    },
    take: 50,
    orderBy: {
      dateEmission: "desc",
    },
    include: {
      client: true,
      fournisseur: true,
      lignes: true,
      paiements: true,
    },
  });

  const paiements =
    type === "financier"
      ? await prisma.paiement.findMany({
        where: {
          datePaiement: dateRange,
        },
        take: 50,
        orderBy: {
          datePaiement: "desc",
        },
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

  const total = factures.reduce(
    (sum, item) => sum + number(item.totalTtc),
    0,
  );

  const achats = factures
    .filter(
      (item) => item.typeFacture === "ACHAT",
    )
    .reduce(
      (sum, item) => sum + number(item.totalTtc),
      0,
    );

  return {
    factures,
    paiements,
    totalPaiements: paiements.reduce(
      (sum, paiement) =>
        sum + number(paiement.montant),
      0,
    ),
    total,
    marge: total - achats,
    risque: factures.filter(
      (item) => item.statut !== "SOLDEE",
    ).length,
  };
}

function reportRows(data, type) {
  if (type === "stocks")
    return (data.stocks || [])
      .map(
        (stock) =>
          `<tr><td>${escapeHtml(
            stock.produit?.reference || "-",
          )}</td><td>${escapeHtml(
            stock.produit?.designation || "-",
          )}</td><td class="text-center">${stock.stockActuel
          }</td><td class="text-center">${stock.produit?.stockMinimum || 0
          }</td><td class="text-right">${money(
            number(stock.stockActuel) *
            number(stock.produit?.prixAchatHt),
          )}</td><td class="text-center">${number(stock.stockActuel) <=
            number(stock.produit?.stockMinimum)
            ? "Alerte"
            : "Normal"
          }</td></tr>`,
      )
      .join("");

  if (type === "achats")
    return (data.achats || [])
      .map(
        (item) =>
          `<tr><td>${escapeHtml(
            item.numeroBcf,
          )}</td><td>${escapeHtml(
            item.fournisseur?.raisonSociale || "-",
          )}</td><td>${escapeHtml(
            item.statut,
          )}</td><td class="text-right">${money(
            item.totalTtc,
          )}</td><td>${new Date(
            item.dateCommande,
          ).toLocaleDateString("fr-FR")}</td></tr>`,
      )
      .join("");

  return (data.factures || [])
    .map(
      (item) =>
        `<tr><td>${escapeHtml(
          item.numeroFacture,
        )}</td><td>${escapeHtml(
          item.client?.nom ||
          item.fournisseur?.raisonSociale ||
          "-",
        )}</td><td>${escapeHtml(
          item.statut,
        )}</td><td class="text-right">${money(
          item.totalTtc,
        )}</td><td>${new Date(
          item.dateEmission,
        ).toLocaleDateString("fr-FR")}</td></tr>`,
    )
    .join("");
}

function svgBarChart(
  title,
  items,
  color = "#2563eb",
) {
  const values = items.map((item) =>
    Math.max(0, number(item.value)),
  );

  const maxValue = Math.max(...values, 1);
  const width = 520;
  const height = 190;
  const baseline = 150;

  const barWidth = Math.max(
    24,
    Math.floor(
      410 / Math.max(items.length, 1),
    ) - 12,
  );

  const bars = items
    .slice(0, 6)
    .map((item, index) => {
      const barHeight = Math.round(
        (Math.max(0, number(item.value)) /
          maxValue) *
        105,
      );

      const x =
        58 + index * (barWidth + 12);
      const y = baseline - barHeight;

      const label = escapeHtml(
        String(item.label).slice(0, 13),
      );

      return `<g><rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}"/><text x="${x + barWidth / 2
        }" y="${baseline + 16
        }" text-anchor="middle" font-size="8" fill="#64748b">${label}</text><text x="${x + barWidth / 2
        }" y="${y - 5
        }" text-anchor="middle" font-size="8" fill="#0f172a">${Math.round(
          number(item.value),
        ).toLocaleString("fr-FR")}</text></g>`;
    })
    .join("");

  return `<div class="chart-block"><div class="chart-title">${escapeHtml(
    title,
  )}</div><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(
    title,
  )}"><line x1="45" y1="${baseline}" x2="500" y2="${baseline}" stroke="#cbd5e1"/>${bars}</svg></div>`;
}

function svgDonutChart(title, items) {
  const palette = [
    "#2563eb",
    "#059669",
    "#d97706",
    "#7c3aed",
    "#dc2626",
  ];

  const total =
    items.reduce(
      (sum, item) =>
        sum +
        Math.max(0, number(item.value)),
      0,
    ) || 1;

  let offset = 0;

  const segments = items
    .filter(
      (item) => number(item.value) > 0,
    )
    .slice(0, 5)
    .map((item, index) => {
      const portion =
        (number(item.value) / total) * 100;

      const segment = `<circle cx="86" cy="86" r="55" fill="none" stroke="${palette[index]
        }" stroke-width="22" stroke-dasharray="${portion} ${100 - portion
        }" stroke-dashoffset="${-offset}" pathLength="100" transform="rotate(-90 86 86)"/>`;

      offset += portion;

      return segment;
    })
    .join("");

  const legend = items
    .slice(0, 5)
    .map(
      (item, index) =>
        `<div class="chart-legend"><span style="background:${palette[index]
        }"></span>${escapeHtml(
          item.label,
        )} <strong>${Math.round(
          number(item.value),
        ).toLocaleString(
          "fr-FR",
        )}</strong></div>`,
    )
    .join("");

  return `<div class="chart-block"><div class="chart-title">${escapeHtml(
    title,
  )}</div><div class="donut-layout"><svg viewBox="0 0 172 172" role="img" aria-label="${escapeHtml(
    title,
  )}"><circle cx="86" cy="86" r="55" fill="none" stroke="#e2e8f0" stroke-width="22"/>${segments}<text x="86" y="82" text-anchor="middle" font-size="16" font-weight="700" fill="#0f172a">${Math.round(
    total,
  ).toLocaleString(
    "fr-FR",
  )}</text><text x="86" y="100" text-anchor="middle" font-size="9" fill="#64748b">total</text></svg><div class="chart-legends">${legend}</div></div></div>`;
}

function buildReportCharts(data, type) {
  if (type === "stocks") {
    const stockItems = (
      data.stocks || []
    )
      .slice(0, 6)
      .map((stock) => ({
        label:
          stock.produit?.reference ||
          "Produit",
        value: number(
          stock.stockActuel,
        ),
      }));

    const normal = (
      data.stocks || []
    ).filter(
      (stock) =>
        number(stock.stockActuel) >
        number(
          stock.produit?.stockMinimum,
        ),
    ).length;

    const critical =
      (data.stocks || []).length -
      normal;

    return `${svgBarChart(
      "Niveaux de stock par référence",
      stockItems,
      "#2563eb",
    )}${svgDonutChart(
      "Répartition des seuils",
      [
        {
          label: "Conformes",
          value: normal,
        },
        {
          label: "Sous seuil",
          value: critical,
        },
      ],
    )}`;
  }

  const records =
    type === "achats"
      ? data.achats || []
      : data.factures || [];

  const statusItems = Object.entries(
    records.reduce(
      (acc, item) => {
        acc[item.statut] =
          (acc[item.statut] || 0) + 1;
        return acc;
      },
      {},
    ),
  ).map(
    ([label, value]) => ({
      label,
      value,
    }),
  );

  const amountItems = records
    .slice(0, 6)
    .map((item) => ({
      label:
        type === "achats"
          ? item.numeroBcf
          : item.numeroFacture,
      value: number(
        item.totalTtc,
      ),
    }));

  const charts = `${svgBarChart(
    "Volumes par document",
    amountItems,
    type === "achats"
      ? "#059669"
      : "#2563eb",
  )}${svgDonutChart(
    "Répartition par statut",
    statusItems,
  )}`;

  if (type === "financier") {
    const paymentItems = (
      data.paiements || []
    )
      .slice(0, 6)
      .map((payment) => ({
        label:
          payment.modePaiement,
        value: number(
          payment.montant,
        ),
      }));

    return `${charts}${svgBarChart(
      "Encaissements récents",
      paymentItems,
      "#d97706",
    )}`;
  }

  return charts;
}

function buildReportNarrative(
  type,
  periode,
  data,
) {
  const elements =
    data.factures?.length ||
    data.achats?.length ||
    data.stocks?.length ||
    0;

  const periodLabel =
    {
      semaine:
        "la semaine en cours",
      mois: "le mois en cours",
      trimestre:
        "le trimestre en cours",
      annee: "l'année en cours",
    }[periode] || periode;

  if (type === "stocks") {
    return `Sur ${elements} références analysées pour ${periodLabel}, la valeur estimée du stock est de ${money(
      data.total,
    )}. ${data.risque
      } référence(s) sont au seuil de sécurité ou en dessous. La priorité est de sécuriser les articles critiques et de confirmer les réapprovisionnements nécessaires.`;
  }

  if (type === "achats") {
    return `Les ${elements} bons de commande fournisseurs recensés pour ${periodLabel} représentent ${money(
      data.total,
    )} TTC. Le suivi doit porter sur les commandes non réceptionnées, les délais fournisseurs et le rapprochement entre commandes, réceptions et factures.`;
  }

  if (type === "financier") {
    return `Pour ${periodLabel}, le périmètre financier analyse ${elements} facture(s), un volume de ${money(
      data.total,
    )} et ${money(
      data.totalPaiements,
    )} d'encaissements. La marge indicative est de ${money(
      data.marge,
    )} ; ${data.risque
      } facture(s) nécessitent un suivi de règlement.`;
  }

  return `Pour ${periodLabel}, ${elements} facture(s) de vente représentent ${money(
    data.total,
  )} de chiffre d'affaires. ${data.risque
    } facture(s) ne sont pas soldées. Les actions prioritaires sont le suivi des échéances, la relance des impayés et la consolidation des opportunités commerciales.`;
}

async function buildReportHtml(
  type,
  periode,
  data,
  narrative,
) {
  const filename = path.resolve(
    path.dirname(
      fileURLToPath(import.meta.url),
    ),
    "../../services/rapport_global_commercial_financier.html",
  );

  const template = await fs.readFile(
    filename,
    "utf8",
  );

  const title = {
    ventes:
      "Rapport Performance Ventes & Commercial",
    achats:
      "Rapport des Achats & Approvisionnements",
    stocks:
      "Rapport de Gestion des Stocks & Inventaire",
    financier:
      "Rapport Financier & Compte de Résultat",
  }[type];

  const headers =
    type === "stocks"
      ? "<th>Référence</th><th>Produit</th><th>Stock</th><th>Seuil</th><th>Valeur</th><th>Statut</th>"
      : "<th>Référence</th><th>Partenaire</th><th>Statut</th><th>Montant TTC</th><th>Date</th>";

  const charts =
    buildReportCharts(data, type);

  const chartStyles = `<style>.report-charts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0 20px}.chart-block{border:1px solid #cbd5e1;background:#fff;padding:10px;break-inside:avoid}.chart-title{font-size:8.5pt;font-weight:700;color:#0f172a;margin-bottom:4px}.chart-block svg{display:block;width:100%;height:180px}.donut-layout{display:flex;align-items:center;gap:8px}.donut-layout svg{width:48%;height:150px}.chart-legends{flex:1}.chart-legend{font-size:7.5pt;color:#475569;margin:5px 0}.chart-legend span{display:inline-block;width:8px;height:8px;margin-right:5px;border-radius:50%}.chart-legend strong{color:#0f172a;float:right}@media print{.report-charts{grid-template-columns:1fr 1fr}.chart-block{break-inside:avoid}}</style>`;

  const body = `${chartStyles}<div class="header-container"><table style="width:100%"><tr><td><div class="company-name">AC ERP</div><div class="report-main-title">${title}</div><div class="report-subtitle">Rapport réel généré pour la période : ${periode}</div></td><td class="text-right"><span class="period-pill">IA ERP</span><div style="font-size:8pt;color:#64748b;margin-top:6px">Généré le : ${new Date().toLocaleDateString(
    "fr-FR",
  )}</div></td></tr></table></div><table class="kpi-table"><tr><td class="kpi-card"><div class="kpi-title">Éléments analysés</div><div class="kpi-value">${data.factures?.length ||
  data.achats?.length ||
  data.stocks?.length ||
  0
    }</div><div class="kpi-trend trend-up">Données ERP réelles</div></td><td class="kpi-card green"><div class="kpi-title">Montant total</div><div class="kpi-value">${money(
      data.total,
    )}</div><div class="kpi-trend trend-up">Période ${periode}</div></td><td class="kpi-card amber"><div class="kpi-title">Marge brute</div><div class="kpi-value">${money(
      data.marge,
    )}</div><div class="kpi-trend trend-up">Calculée sur les données</div></td><td class="kpi-card purple"><div class="kpi-title">Indicateur</div><div class="kpi-value">${data.risque ||
    "Suivi"
    }</div><div class="kpi-trend trend-up">Analyse automatisée</div></td></tr></table><div class="executive-box"><div class="executive-title">Synthèse exécutive</div><p class="executive-text">${escapeHtml(
      narrative,
    )}</p></div><div class="section-header"><div class="section-title">Indicateurs graphiques</div></div><div class="report-charts">${charts}</div><div class="section-header"><div class="section-title">Détail des données ERP</div></div><table class="data-table"><thead><tr>${headers}</tr></thead><tbody>${reportRows(data, type) ||
    `<tr><td colspan="6" class="text-center">Aucune donnée sur cette période</td></tr>`
    }</tbody></table>`;

  return template.replace(
    /<body>[\s\S]*<\/body>/i,
    `<body>${body}</body>`,
  );
}

export async function buildForecasts() {
  const since = new Date();

  since.setMonth(
    since.getMonth() - 6,
    1,
  );

  const invoices =
    await prisma.facture.findMany({
      where: {
        typeFacture: "VENTE",
        dateEmission: {
          gte: since,
        },
      },
      take: 50,
      select: {
        totalTtc: true,
        dateEmission: true,
      },
    });

  const monthly = new Map();

  for (const invoice of invoices) {
    const key = new Date(
      invoice.dateEmission,
    )
      .toISOString()
      .slice(0, 7);

    monthly.set(
      key,
      (monthly.get(key) || 0) +
      number(invoice.totalTtc),
    );
  }

  const values = [
    ...monthly.entries(),
  ]
    .sort(([a], [b]) =>
      a.localeCompare(b),
    )
    .map(([, value]) => value);

  const average = values.length
    ? values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / values.length
    : 0;

  const growth =
    values.length > 1 && values[0]
      ? (values[values.length - 1] /
        values[0]) **
      (1 /
        (values.length - 1)) -
      1
      : 0;

  const previsionsMensuelles =
    Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date();

        date.setMonth(
          date.getMonth() +
          index +
          1,
          1,
        );

        const montantPrevu =
          Math.round(
            average *
            (1 + growth) **
            (index + 1),
          );

        return {
          mois: date
            .toISOString()
            .slice(0, 7),
          montantPrevu,
          min: Math.round(
            montantPrevu * 0.8,
          ),
          max: Math.round(
            montantPrevu * 1.2,
          ),
        };
      },
    );

  const salesByProduct =
    await prisma.ligneFacture.findMany({
      where: {
        facture: {
          typeFacture: "VENTE",
          dateEmission: {
            gte: since,
          },
        },
        idProduit: {
          not: null,
        },
      },
      take: 50,
      select: {
        idProduit: true,
        quantite: true,
      },
    });

  const quantitiesByProduct =
    new Map();

  for (const line of salesByProduct) {
    quantitiesByProduct.set(
      line.idProduit,
      (quantitiesByProduct.get(
        line.idProduit,
      ) || 0) + line.quantite,
    );
  }

  const nextMonth = new Date();

  nextMonth.setMonth(
    nextMonth.getMonth() + 1,
    1,
  );

  nextMonth.setUTCHours(
    0,
    0,
    0,
    0,
  );

  await Promise.all(
    [
      ...quantitiesByProduct.entries(),
    ].map(
      ([
        idProduit,
        quantite,
      ]) => {
        const moyenneMensuelle =
          Math.max(
            1,
            Math.round(
              quantite / 6,
            ),
          );

        return iaRepository.savePrevision(
          {
            idProduit,
            periode: nextMonth,
            quantitePrevue:
              moyenneMensuelle,
            quantiteMin: Math.max(
              0,
              Math.floor(
                moyenneMensuelle *
                0.8,
              ),
            ),
            quantiteMax: Math.ceil(
              moyenneMensuelle *
              1.2,
            ),
            tendance:
              growth > 0.02
                ? "HAUSSE"
                : growth < -0.02
                  ? "BAISSE"
                  : "STABLE",
            tauxConfiance: 85,
          },
        );
      },
    ),
  );

  const thirtyDaysAgo =
    new Date();

  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() -
    30,
  );

  const stocks =
    await prisma.stock.findMany({
      take: 50,
      include: {
        produit: true,
      },
    });

  const mouvements =
    await prisma.mouvementStock.findMany(
      {
        where: {
          idProduit: {
            in: stocks.map(
              (stock) =>
                stock.idProduit,
            ),
          },
          typeMouvement:
            "SORTIE_VENTE",
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        take: 50,
        select: {
          idProduit: true,
          quantite: true,
        },
      },
    );

  const sortiesParProduit =
    new Map();

  for (const mouvement of mouvements) {
    sortiesParProduit.set(
      mouvement.idProduit,
      (sortiesParProduit.get(
        mouvement.idProduit,
      ) || 0) +
      mouvement.quantite,
    );
  }

  const produitsRisque = [];
  const nouvellesAlertes = [];

  for (const stock of stocks) {
    if (
      stock.stockActuel >
      stock.produit.stockMinimum *
      1.5
    )
      continue;

    const vitesseEcoulement =
      (sortiesParProduit.get(
        stock.idProduit,
      ) || 0) / 30;

    const joursAvantRupture =
      vitesseEcoulement
        ? Math.floor(
          stock.stockActuel /
          vitesseEcoulement,
        )
        : null;

    const produitRisque = {
      idProduit:
        stock.idProduit,
      produit:
        stock.produit.designation,
      stockActuel:
        stock.stockActuel,
      stockMinimum:
        stock.produit.stockMinimum,
      vitesseEcoulement,
      joursAvantRupture,
    };

    produitsRisque.push(
      produitRisque,
    );

    if (
      joursAvantRupture !== null
    ) {
      const alerteExistante =
        await iaRepository.findAlerteActiveByProduit(
          stock.idProduit,
        );

      if (!alerteExistante) {
        await iaRepository.saveAlerteRupture(
          {
            idProduit:
              stock.idProduit,
            joursAvantRupture,
            vitesseEcoulement,
            qteRecommandee:
              Math.max(
                stock.produit
                  .stockMinimum *
                2 -
                stock.stockActuel,
                Math.ceil(
                  vitesseEcoulement *
                  30,
                ),
              ),
            statut:
              joursAvantRupture <=
                7
                ? "CRITIQUE"
                : "VIGILANCE",
          },
        );

        nouvellesAlertes.push(
          produitRisque,
        );
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
    nouvellesAlertes,
    recommandations,
    fiabilite: 85,
    caPrevu:
      previsionsMensuelles[0]
        ?.montantPrevu || 0,
  };
}

export const iaService = {
  async chat({
    message,
    idConversation,
    userId,
  }) {
    if (
      !String(message || "").trim()
    )
      throw new ApiError(
        400,
        "MESSAGE_REQUIRED",
        "Le message est obligatoire",
      );

    let conversation =
      idConversation
        ? await iaRepository.findConversationById(
          idConversation,
        )
        : null;

    if (
      conversation &&
      conversation.idUtilisateur !==
      userId
    )
      throw new ApiError(
        403,
        "CONVERSATION_FORBIDDEN",
        "Cette conversation ne vous appartient pas",
      );

    if (!conversation)
      conversation =
        await iaRepository.createConversation(
          userId,
          message,
        );

    /*
     * HISTORIQUE DE CONVERSATION
     *
     * On conserve uniquement les 20 derniers
     * messages afin d'éviter de faire grossir
     * inutilement le contexte envoyé au modèle.
     */
    const history = (
      await iaRepository.findMessages(
        conversation.id,
      )
    )
      .reverse()
      .slice(-20)
      .map((item) => ({
        role: item.role,
        content: item.contenu,
      }));

    /*
     * IMPORTANT :
     *
     * collectContext() exécute les requêtes
     * Prisma côté BACKEND.
     *
     * Claude ne reçoit que le résultat JSON.
     * Claude ne reçoit :
     * - ni DATABASE_URL ;
     * - ni connexion MySQL ;
     * - ni Prisma ;
     * - ni requête SQL.
     */
    const context =
      await collectContext(
        message,
      );

    const knowledge =
      buildKnowledgeContext();

    const currentDate =
      new Date().toLocaleDateString(
        "fr-FR",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );

    const systemPrompt = `
Tu es AC, l'assistante IA intégrée à AC ERP.

IDENTITÉ :
Tu es l'assistant intelligent d'AC ERP.
Tu es propulsée par Claude d'Anthropic.
Si l'utilisateur demande qui tu es ou qui t'a créée, explique simplement que tu es l'assistante IA d'AC ERP propulsée par Claude d'Anthropic.

DATE ACTUELLE :
${currentDate}

${knowledge}

RÈGLES FONDAMENTALES :

1. LANGUE
- Réponds uniquement en français.
- N'utilise pas d'emoji.
- Évite les formules de salutation répétitives.

2. PÉRIMÈTRE
Tu es spécialisée dans :
- la gestion commerciale ;
- les ventes ;
- les achats ;
- les stocks ;
- les produits ;
- les clients ;
- les fournisseurs ;
- les factures ;
- les paiements ;
- les rapports ;
- les statistiques ;
- les prévisions ;
- l'utilisation du logiciel AC ERP.

Pour une question hors de ce domaine, explique poliment que tu es spécialisée dans la gestion commerciale et l'utilisation d'AC ERP.

3. DONNÉES ERP
Les données ERP fournies dans le contexte sont issues de requêtes exécutées par le backend AC ERP.

Tu n'as PAS accès directement à la base de données.

Tu ne dois jamais prétendre :
- avoir accès à MySQL ;
- avoir accès à Prisma ;
- exécuter une requête SQL ;
- modifier directement la base de données.

Tu dois utiliser uniquement les données fournies dans :
"DONNEES ERP DU BACKEND".

4. FIABILITÉ
- Ne jamais inventer un client.
- Ne jamais inventer un fournisseur.
- Ne jamais inventer un produit.
- Ne jamais inventer une facture.
- Ne jamais inventer un montant.
- Ne jamais inventer une date.
- Ne jamais inventer un stock.
- Ne jamais inventer une statistique.
- Ne jamais présenter une estimation comme une donnée réelle.

Si les données disponibles ne permettent pas de répondre précisément, indique-le clairement.

5. CALCULS
Lorsque les données fournies permettent un calcul fiable, tu peux calculer :
- totaux ;
- différences ;
- pourcentages ;
- marges ;
- taux ;
- restes à payer ;
- comparaisons ;
- classements.

Explique brièvement le calcul lorsque cela aide à comprendre.

6. PRÉVISIONS
Les prévisions sont des estimations.
Utilise des formulations telles que :
- "selon la prévision disponible" ;
- "estimation" ;
- "projection".
Ne présente jamais une prévision comme une certitude.

7. ASSISTANCE AC ERP
Si l'utilisateur demande comment effectuer une opération dans AC ERP, donne une procédure pratique et claire.

Exemples :

Créer une facture :
- Aller dans "Ventes".
- Ouvrir "Factures".
- Cliquer sur "Nouvelle facture".
- Sélectionner le client.
- Ajouter les produits.
- Vérifier les quantités et les totaux.
- Enregistrer.

Créer une réception :
- Aller dans "Achats".
- Ouvrir "Réceptions".
- Cliquer sur "Nouvelle réception".
- Sélectionner ou lier le bon de commande fournisseur.
- Vérifier les quantités reçues.
- Valider.

Pour les autres opérations, utilise la logique fonctionnelle connue d'AC ERP.
Ne prétends jamais avoir exécuté une opération si aucune action backend n'a réellement été exécutée.

8. FORMAT
Utilise le format le plus adapté.

Tableau Markdown pour :
- listes de produits ;
- listes de clients ;
- listes de factures ;
- comparaisons ;
- classements ;
- données comportant plusieurs colonnes.

Listes à puces pour :
- recommandations ;
- procédures ;
- étapes.

Gras pour :
- montants importants ;
- résultats principaux ;
- alertes ;
- conclusions.

Utilise ## pour structurer les réponses longues.

9. CONVERSATION
Réponds à la question actuelle.
Ne répète pas automatiquement la réponse précédente.
Utilise l'historique uniquement lorsqu'il est nécessaire pour comprendre la question actuelle.

10. DONNEES INSUFFISANTES
Si l'utilisateur demande une information qui n'est pas présente dans les données fournies :
- ne l'invente pas ;
- indique que les données disponibles ne permettent pas de répondre avec certitude ;
- demande éventuellement une précision si cela permettrait au backend de fournir des données plus pertinentes.

11. ACTIONS
Tu es un assistant d'analyse et d'aide.
Tu ne dois pas prétendre :
- créer une facture ;
- supprimer un client ;
- modifier un produit ;
- enregistrer un paiement ;
- modifier un stock ;
- supprimer une donnée ;
si aucune fonction backend correspondante n'a réellement été exécutée.

DONNEES ERP DU BACKEND :
${JSON.stringify(
      context,
      null,
      2,
    )}
`;

    const userMessage = `
Question actuelle de l'utilisateur :
${message}

Utilise uniquement les informations pertinentes disponibles dans le contexte ERP fourni par le backend.
`;

    const politeMessage = isPoliteMessage(message);

    if (politeMessage) {
      const answer = await askClaude(
        `Tu es AC, l'assistante IA de AC ERP.

RÈGLE IMPORTANTE :
L'utilisateur vient simplement d'envoyer une formule de politesse, de remerciement, d'accord ou de clôture de conversation.

Tu dois répondre naturellement et brièvement.

Tu ne dois surtout pas :
- répondre à une ancienne question ;
- répéter une réponse précédente ;
- analyser les données ERP ;
- inventer une nouvelle demande ;
- réutiliser le contexte ERP précédent.

Exemples :
- "Merci" → "Avec plaisir."
- "Merci beaucoup" → "Avec plaisir."
- "D'accord" → "Très bien."
- "Parfait" → "Parfait."
- "Bonne journée" → "Bonne journée à vous."

Réponds uniquement en français, de manière courte et naturelle.`,
        [
          {
            role: "user",
            content: message,
          },
        ],
        128,
      );

      await iaRepository.createMessages([
        {
          idConversation: conversation.id,
          role: "user",
          contenu: message,
          donnees: null,
        },
        {
          idConversation: conversation.id,
          role: "assistant",
          contenu: answer,
        },
      ]);

      return {
        reponse: answer,
        idConversation: conversation.id,
      };
    }


    const answer =
      await askClaude(
        systemPrompt,
        [
          ...history,
          {
            role: "user",
            content: userMessage,
          },
        ],
        LLM_MAX_TOKENS,
      );

    await iaRepository.createMessages([
      {
        idConversation:
          conversation.id,
        role: "user",
        contenu: message,
        donnees: context,
      },
      {
        idConversation:
          conversation.id,
        role: "assistant",
        contenu: answer,
      },
    ]);

    return {
      reponse: answer,
      idConversation:
        conversation.id,
    };
  },

  getConversations(userId) {
    return iaRepository.findConversations(
      userId,
    );
  },

  async getConversationMessages(
    idConversation,
    userId,
  ) {
    const conversation =
      await iaRepository.findConversationById(
        idConversation,
      );

    if (
      !conversation ||
      conversation.idUtilisateur !==
      userId
    )
      throw new ApiError(
        404,
        "CONVERSATION_NOT_FOUND",
        "Conversation introuvable",
      );

    return (
      await iaRepository.findMessages(
        idConversation,
      )
    ).reverse();
  },

  async renameConversation(
    idConversation,
    titre,
    userId,
  ) {
    const conversation =
      await iaRepository.findConversationById(
        idConversation,
      );

    if (
      !conversation ||
      conversation.idUtilisateur !==
      userId
    )
      throw new ApiError(
        404,
        "CONVERSATION_NOT_FOUND",
        "Conversation introuvable",
      );

    if (
      !String(titre || "").trim()
    )
      throw new ApiError(
        400,
        "TITLE_REQUIRED",
        "Le titre est obligatoire",
      );

    return iaRepository.updateConversationTitle(
      idConversation,
      String(titre).trim(),
    );
  },

  async deleteConversation(
    idConversation,
    userId,
  ) {
    const conversation =
      await iaRepository.findConversationById(
        idConversation,
      );

    if (
      !conversation ||
      conversation.idUtilisateur !==
      userId
    )
      throw new ApiError(
        404,
        "CONVERSATION_NOT_FOUND",
        "Conversation introuvable",
      );

    await iaRepository.deleteConversation(
      idConversation,
    );
  },

  async genererRapport({
    type,
    dateDebut,
    dateFin,
    userId,
  }) {
    if (
      ![
        "ventes",
        "achats",
        "stocks",
        "financier",
      ].includes(type)
    ) {
      throw new ApiError(
        400,
        "INVALID_REPORT_TYPE",
        "Type de rapport invalide",
      );
    }

    if (!dateDebut || !dateFin) {
      throw new ApiError(
        400,
        "REPORT_PERIOD_REQUIRED",
        "La période du rapport est obligatoire",
      );
    }

    const data =
      await collectReportData(
        type,
        dateDebut,
        dateFin,
      );

    const periode = `${dateDebut} au ${dateFin}`;

    const narrative =
      buildReportNarrative(
        type,
        periode,
        data,
      );

    const html =
      await buildReportHtml(
        type,
        periode,
        data,
        narrative,
      );

    const report =
      await iaRepository.createRapport(
        {
          idUtilisateur: userId,
          typeRapport: type,
          periode,
          dateDebut: new Date(
            `${dateDebut}T00:00:00`,
          ),
          dateFin: new Date(
            `${dateFin}T23:59:59.999`,
          ),
          contenu: narrative,
        },
      );

    return {
      ...report,
      html,
      dateDebut,
      dateFin,
    };
  },

  getPrevisions() {
    return buildForecasts();
  },

  getRapports(userId) {
    return iaRepository.findRapports(
      userId,
    );
  },

  async telechargerRapportPdf(
    idRapport,
    userId,
  ) {
    const report =
      await iaRepository.findRapportById(
        idRapport,
      );

    if (
      !report ||
      report.idUtilisateur !== userId
    )
      throw new ApiError(
        404,
        "REPORT_NOT_FOUND",
        "Rapport introuvable",
      );

    const dateDebut =
      report.dateDebut
        .toISOString()
        .slice(0, 10);

    const dateFin =
      report.dateFin
        .toISOString()
        .slice(0, 10);

    const data =
      await collectReportData(
        report.typeRapport,
        dateDebut,
        dateFin,
      );

    const html =
      await buildReportHtml(
        report.typeRapport,
        report.periode,
        data,
        report.contenu,
      );

    const { buffer } =
      await renderPdfDocument({
        html,
        pdfOptions: {
          format: "A4",
          printBackground: true,
        },
      });

    return {
      buffer,
      filename: `rapport-${report.typeRapport}-${dateDebut}-${dateFin}.pdf`,
    };
  },

  getAlertesRupture() {
    return iaRepository.findAlertesActives();
  },

  previsionsVentes() {
    return iaRepository.previsions({
      orderBy: {
        periode: "desc",
      },
    });
  },

  alertesRupture() {
    return iaRepository.findAlertesActives();
  },

  conversations({ user }) {
    return iaRepository.findConversations(
      user.userId,
    );
  },

  rapports({ user }) {
    return iaRepository.findRapports(
      user.userId,
    );
  },

  rapportAuto(data, { user }) {
    return this.genererRapport({
      ...data,
      userId: user.userId,
    });
  },
};