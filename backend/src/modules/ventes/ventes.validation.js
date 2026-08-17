import { z } from "zod";

const clientTypeSchema = z.enum(["OCCASIONNEL", "ENREGISTRE"]);
const paymentModeSchema = z.enum([
  "ESPECES",
  "CHEQUE",
  "VIREMENT",
  "MOBILE_MONEY",
  "CARTE",
  "COMPENSATION",
]);

const venteLigneSchema = z.object({
  idProduit: z.string().uuid("idProduit invalide"),
  quantite: z.number().positive("La quantite doit etre superieure a 0"),
  remise: z.number().min(0, "La remise ne peut pas etre negative").optional(),
  tauxTva: z
    .number()
    .min(0, "Le taux de TVA ne peut pas etre negatif")
    .optional(),
});

const paiementSchema = z.object({
  montant: z.number().min(0, "Le montant ne peut pas etre negatif"),
  modePaiement: paymentModeSchema,
  reference: z.string().trim().max(191).optional(),
  notes: z.string().trim().max(1000).optional(),
});

const clientOccasionnelInfoSchema = z.object({
  nom: z.string().trim().max(120).optional(),
  prenom: z.string().trim().max(120).optional(),
  sexe: z.string().trim().max(40).optional(),
  numeroCni: z.string().trim().max(80).optional(),
  telephone: z.string().trim().max(40).optional(),
});

export const createVenteDirecteSchema = z
  .object({
    typeClient: clientTypeSchema.default("OCCASIONNEL"),
    idClient: z.string().uuid("idClient invalide").nullable().optional(),
    clientOccasionnelInfo: clientOccasionnelInfoSchema.optional(),
    lignes: z
      .array(venteLigneSchema)
      .min(1, "La vente doit contenir au moins une ligne"),
    paiement: paiementSchema.optional(),
    dateEcheance: z.string().optional(),
    mentionsLegales: z.string().trim().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.typeClient === "ENREGISTRE" && !data.idClient) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["idClient"],
        message: "idClient est obligatoire quand typeClient = ENREGISTRE",
      });
    }
  });
