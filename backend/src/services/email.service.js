import { sendMail } from "../config/email.js";

const layout = (title, body) => `
  <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
    <h2>${title}</h2>
    ${body}
  </div>
`;

export const sendWelcomeEmail = (to, nom, motDePasseTemp) =>
  sendMail(to, "Invitation ERP Intelligent", layout("Bienvenue", `<p>Bonjour ${nom}, votre mot de passe temporaire est <strong>${motDePasseTemp}</strong>.</p>`));

export const sendPasswordResetEmail = (to, nom, lien) =>
  sendMail(to, "Reinitialisation du mot de passe", layout("Reinitialisation", `<p>Bonjour ${nom}, cliquez ici: <a href="${lien}">${lien}</a>.</p>`));

export const sendFactureEmail = (to, nom, factureNum, pdfBuffer) =>
  sendMail(to, `Facture ${factureNum}`, layout("Facture", `<p>Bonjour ${nom}, veuillez trouver votre facture en piece jointe.</p>`), {
    attachments: [{ filename: `${factureNum}.pdf`, content: pdfBuffer }],
  });

export const sendDevisEmail = (to, nom, devisNum, pdfBuffer) =>
  sendMail(to, `Devis ${devisNum}`, layout("Devis", `<p>Bonjour ${nom}, veuillez trouver votre devis en piece jointe.</p>`), {
    attachments: [{ filename: `${devisNum}.pdf`, content: pdfBuffer }],
  });

export const sendRelanceEmail = (to, nom, factureNum, montant, joursRetard) =>
  sendMail(to, `Relance facture ${factureNum}`, layout("Relance paiement", `<p>Bonjour ${nom}, la facture ${factureNum} presente un solde de ${montant} avec ${joursRetard} jours de retard.</p>`));

export const sendAlertStockEmail = (to, produit, stockActuel, stockMinimum) =>
  sendMail(to, "Alerte stock", layout("Alerte stock", `<p>${produit} est a ${stockActuel}, minimum attendu ${stockMinimum}.</p>`));

