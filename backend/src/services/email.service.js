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

export const sendDevisEmail = (to, nom, devisNum, pdfBuffer) =>
  sendMail(to, `Devis ${devisNum}`, layout("Devis", `<p>Bonjour ${nom}, veuillez trouver votre devis en piece jointe.</p>`), {
    attachments: [{ filename: `${devisNum}.pdf`, content: pdfBuffer }],
  });

export const sendRelanceEmail = (to, nom, factureNum, montant, joursRetard) =>
  sendMail(to, `Relance facture ${factureNum}`, layout("Relance paiement", `<p>Bonjour ${nom}, la facture ${factureNum} presente un solde de ${montant} avec ${joursRetard} jours de retard.</p>`));

export const sendAlertStockEmail = (to, produit, stockActuel, stockMinimum) =>
  sendMail(to, "Alerte stock", layout("Alerte stock", `<p>${produit} est a ${stockActuel}, minimum attendu ${stockMinimum}.</p>`));

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