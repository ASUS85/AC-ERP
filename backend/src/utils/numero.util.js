import dayjs from "dayjs";
import prisma from "../config/database.js";
import { DOCUMENT_PREFIXES } from "../config/constants.js";

const MODEL_BY_PREFIX = {
  DEV: ["devis", "numeroDevis"],
  BCC: ["bonCommandeClient", "numeroBcc"],
  BL: ["bonLivraison", "numeroBl"],
  BCF: ["bonCommandeFournisseur", "numeroBcf"],
  DA: ["demandeAchat", "numeroDa"],
  FAC: ["facture", "numeroFacture"],
  AV: ["avoir", "numeroAvoir"],
};

async function generateDocumentNumber(prefix) {
  const ym = dayjs().format("YYYY-MM");
  const [model, field] = MODEL_BY_PREFIX[prefix];
  const startsWith = `${prefix}-${ym}-`;
  const count = await prisma[model].count({ where: { [field]: { startsWith } } });
  return `${startsWith}${String(count + 1).padStart(4, "0")}`;
}

export const generateNumeroDevis = () => generateDocumentNumber(DOCUMENT_PREFIXES.devis);
export const generateNumeroBCC = () => generateDocumentNumber(DOCUMENT_PREFIXES.bcc);
export const generateNumeroBL = () => generateDocumentNumber(DOCUMENT_PREFIXES.bl);
export const generateNumeroBCF = () => generateDocumentNumber(DOCUMENT_PREFIXES.bcf);
export const generateNumeroDA = () => generateDocumentNumber(DOCUMENT_PREFIXES.da);
export const generateNumeroFacture = () => generateDocumentNumber(DOCUMENT_PREFIXES.facture);
export const generateNumeroAvoir = () => generateDocumentNumber(DOCUMENT_PREFIXES.avoir);

export async function generateSKU(prefix = DOCUMENT_PREFIXES.sku) {
  const year = dayjs().format("YYYY");
  const startsWith = `${prefix}-${year}-`;
  const count = await prisma.produit.count({ where: { reference: { startsWith } } });
  return `${startsWith}${String(count + 1).padStart(4, "0")}`;
}

