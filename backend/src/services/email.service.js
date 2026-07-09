import { sendMail } from "../config/email.js";

const layout = (title, body) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
</head>
<body style="
    margin:0;
    padding:0;
    background:#f4f6f9;
    font-family:Segoe UI,Arial,sans-serif;
">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="padding:40px 20px;">
                <table width="650" cellpadding="0" cellspacing="0" style="
                    background:#ffffff;
                    border-radius:12px;
                    overflow:hidden;
                    box-shadow:0 2px 12px rgba(0,0,0,.08);
                ">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="
                            background:#ffffff;
                            padding:30px 20px 10px;
                            border-bottom:1px solid #e5e7eb;
                        ">
                            <img
                                src="https://ton-domaine.com/logo-ac-erp.png"
                                alt="AC ERP"
                                width="180"
                                style="display:block"
                            />

                            <h1 style="
                                margin:20px 0 0;
                                color:#0f172a;
                                font-size:24px;
                            ">
                                ${title}
                            </h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="
                            padding:35px;
                            color:#334155;
                            font-size:15px;
                            line-height:1.7;
                        ">
                            ${body}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="
                            background:#f8fafc;
                            padding:20px;
                            text-align:center;
                            font-size:12px;
                            color:#64748b;
                            border-top:1px solid #e5e7eb;
                        ">
                            © ${new Date().getFullYear()} AC ERP<br/>
                            ERP Intelligent de Gestion Commerciale
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const sendWelcomeEmail = (to, nom, motDePasseTemp) =>
  sendMail(
    to,
    "Bienvenue sur AC ERP",
    layout(
      "Bienvenue dans AC ERP",
      `
      <p>Bonjour <strong>${nom}</strong>,</p>

      <p>
        Votre compte a été créé avec succès.
      </p>

      <p>
        Mot de passe temporaire :
      </p>

      <div style="
        background:#f8fafc;
        border-left:4px solid #2563eb;
        padding:15px;
        margin:20px 0;
        font-size:18px;
        font-weight:bold;
      ">
        ${motDePasseTemp}
      </div>

      <p>
        Nous vous recommandons de modifier ce mot de passe dès votre première connexion.
      </p>
      `
    )
  );

export const sendPasswordResetEmail = (to, nom, lien) =>
  sendMail(
    to,
    "Réinitialisation du mot de passe",
    layout(
      "Réinitialisation du mot de passe",
      `
      <p>Bonjour <strong>${nom}</strong>,</p>

      <p>
        Une demande de réinitialisation de mot de passe a été effectuée.
      </p>

      <div style="text-align:center;margin:30px 0;">
        <a href="${lien}" style="
          background:#2563eb;
          color:#ffffff;
          text-decoration:none;
          padding:14px 24px;
          border-radius:8px;
          font-weight:600;
        ">
          Réinitialiser mon mot de passe
        </a>
      </div>

      <p>
        Si vous n'êtes pas à l'origine de cette demande,
        ignorez simplement cet email.
      </p>
      `
    )
  );

export const sendFactureEmail = (to, nom, factureNum, pdfBuffer) =>
  sendMail(to, `Facture ${factureNum}`, layout("Facture", `<p>Bonjour ${nom}, veuillez trouver votre facture en piece jointe.</p>`), {
    attachments: [{ filename: `${factureNum}.pdf`, content: pdfBuffer }],
  });

export const sendDevisEmail = (to, nom, devis, downloadUrl) =>
  sendMail(
    to,
    `Devis ${devis.numeroDevis}`,
    layout(
      "Votre devis",
      `<p>Bonjour <strong>${nom}</strong>,</p>
      <p>Veuillez trouver votre devis <strong>${devis.numeroDevis}</strong>, valable jusqu'au <strong>${new Date(devis.dateValidite).toLocaleDateString("fr-FR")}</strong>.</p>
      <p>Total TTC : <strong>${Number(devis.totalTtc || 0).toLocaleString("fr-FR")} XAF</strong></p>
      <div style="margin:24px 0 8px;">
        <a href="${downloadUrl}" style="display:inline-flex;align-items:center;gap:8px;color:#2563eb;text-decoration:none;font-size:13px;font-weight:600;"><span style="display:inline-block;background:#fee2e2;border:1px solid #fecaca;border-radius:4px;color:#b91c1c;font-size:10px;font-weight:700;line-height:1;padding:4px 5px;">PDF</span><span>Telecharger le devis</span></a>
      </div>`
    )
  );

export const sendRelanceEmail = (to, nom, factureNum, montant, joursRetard) =>
  sendMail(to, `Relance facture ${factureNum}`, layout("Relance paiement", `<p>Bonjour ${nom}, la facture ${factureNum} presente un solde de ${montant} avec ${joursRetard} jours de retard.</p>`));

export const sendAlertStockEmail = (to, produit, stockActuel, stockMinimum) =>
  sendMail(to, "Alerte stock", layout("Alerte stock", `<p>${produit} est a ${stockActuel}, minimum attendu ${stockMinimum}.</p>`));

export const sendBonCommandeFournisseurEmail = (to, fournisseurNom, bonCommande, links = {}) => {
  const lignes = (bonCommande.lignes || [])
    .map((ligne) => {
      const designation = ligne.produit?.designation || ligne.idProduit;
      const quantite = Number(ligne.quantiteCommandee || 0);
      const prix = Number(ligne.prixUnitaireHt || 0);
      const montant = Number(ligne.montantHt || quantite * prix);

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${designation}</td>
          <td align="right" style="padding:10px;border-bottom:1px solid #e5e7eb;">${quantite}</td>
          <td align="right" style="padding:10px;border-bottom:1px solid #e5e7eb;">${prix.toLocaleString("fr-FR")}</td>
          <td align="right" style="padding:10px;border-bottom:1px solid #e5e7eb;">${montant.toLocaleString("fr-FR")}</td>
        </tr>
      `;
    })
    .join("");

  const dateLivraison = bonCommande.dateLivraisonPrevue
    ? new Date(bonCommande.dateLivraisonPrevue).toLocaleDateString("fr-FR")
    : "A confirmer";

  return sendMail(
    to,
    `Bon de commande ${bonCommande.numeroBcf}`,
    layout(
      "Bon de commande fournisseur",
      `
      <p>Bonjour <strong>${fournisseurNom}</strong>,</p>
      <p>Veuillez trouver ci-dessous notre bon de commande <strong>${bonCommande.numeroBcf}</strong>.</p>
      <p>Date de livraison prevue : <strong>${dateLivraison}</strong></p>
      <div style="margin:24px 0 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td align="left" style="padding:0;">
              ${links.acceptUrl ? `<a href="${links.acceptUrl}" style="display:inline-block;background:#ecfdf5;border:1px solid #86efac;color:#166534;text-decoration:none;padding:9px 14px;border-radius:6px;font-size:13px;font-weight:600;">Valider</a>` : ""}
            </td>
            <td align="right" style="padding:0;">
              ${links.rejectUrl ? `<a href="${links.rejectUrl}" style="display:inline-block;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;text-decoration:none;padding:9px 14px;border-radius:6px;font-size:13px;font-weight:600;">Refuser</a>` : ""}
            </td>
          </tr>
        </table>
      </div>
      <div style="margin:0 0 24px;text-align:left;">
        ${links.downloadUrl ? `<a href="${links.downloadUrl}" style="display:inline-flex;align-items:center;gap:8px;color:#2563eb;text-decoration:none;font-size:13px;font-weight:600;"><span style="display:inline-block;background:#fee2e2;border:1px solid #fecaca;border-radius:4px;color:#b91c1c;font-size:10px;font-weight:700;line-height:1;padding:4px 5px;">PDF</span><span>Telecharger le bon de commande</span></a>` : ""}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="background:#f8fafc;">
            <th align="left" style="padding:10px;border-bottom:1px solid #e5e7eb;">Produit</th>
            <th align="right" style="padding:10px;border-bottom:1px solid #e5e7eb;">Quantite</th>
            <th align="right" style="padding:10px;border-bottom:1px solid #e5e7eb;">Prix HT</th>
            <th align="right" style="padding:10px;border-bottom:1px solid #e5e7eb;">Montant HT</th>
          </tr>
        </thead>
        <tbody>${lignes}</tbody>
      </table>
      <p>Total HT : <strong>${Number(bonCommande.totalHt || 0).toLocaleString("fr-FR")}</strong></p>
      <p>Total TVA : <strong>${Number(bonCommande.totalTva || 0).toLocaleString("fr-FR")}</strong></p>
      <p>Total TTC : <strong>${Number(bonCommande.totalTtc || 0).toLocaleString("fr-FR")}</strong></p>
      <p>Merci de confirmer la bonne reception de cette commande.</p>
      `
    )
  );
};

export const sendMfaCodeEmail = (to, nom, code) =>
  sendMail(
    to,
    "Code de vérification AC ERP",
    layout(
      "Vérification en deux étapes",
      `
      <p>Bonjour <strong>${nom}</strong>,</p>

      <p>
        Une tentative de connexion à votre compte AC ERP a été détectée.
      </p>

      <p>
        Utilisez le code de sécurité suivant pour terminer votre authentification :
      </p>

      <div style="
        text-align:center;
        margin:30px 0;
      ">
        <div style="
          display:inline-block;
          background:#eff6ff;
          border:2px solid #2563eb;
          border-radius:12px;
          padding:18px 35px;
          font-size:32px;
          font-weight:700;
          letter-spacing:10px;
          color:#2563eb;
        ">
          ${code}
        </div>
      </div>

      <p>
        Ce code est valable pendant <strong>10 minutes</strong>.
      </p>

      <p>
        Si vous n'êtes pas à l'origine de cette tentative de connexion,
        veuillez modifier immédiatement votre mot de passe et contacter
        l'administrateur du système.
      </p>

      <p>
        Pour votre sécurité, ne communiquez jamais ce code à un tiers.
      </p>
      `
    )
  );
