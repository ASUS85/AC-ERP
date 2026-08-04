import { renderPdfDocument } from "./pdf-render.service.js";

const money = (value, currency = "XAF") =>
  `${Number(value || 0).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
const date = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "-";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function pdfText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(value, max = 92) {
  const words = String(value || "").split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > max) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function buildBcfTextLines(bonCommande, entreprise = {}) {
  const currency = entreprise.devise || "XAF";
  const fournisseur = bonCommande.fournisseur || {};
  const lines = [
    "BON DE COMMANDE FOURNISSEUR",
    `Numero: ${bonCommande.numeroBcf}`,
    `Date commande: ${date(bonCommande.dateCommande)}    Livraison prevue: ${date(bonCommande.dateLivraisonPrevue)}    Statut: ${bonCommande.statut}`,
    "",
    "EMETTEUR",
    `${entreprise.raisonSociale || "AC ERP"}`,
    `NIF/RCCM: ${entreprise.numeroFiscal || "-"}    Telephone: ${entreprise.telephone || "-"}    Email: ${entreprise.email || "-"}`,
    `Adresse: ${entreprise.adresse || "-"}`,
    "",
    "FOURNISSEUR",
    `${fournisseur.raisonSociale || "-"}`,
    `Code: ${fournisseur.codeFournisseur || "-"}    NIF/RCCM: ${fournisseur.numeroFiscal || "-"}`,
    `Telephone: ${fournisseur.telephone || "-"}    Email: ${fournisseur.email || "-"}`,
    `Adresse: ${fournisseur.adresse || "-"} ${fournisseur.ville || ""}`,
    "",
    "ARTICLES COMMANDES",
  ];

  (bonCommande.lignes || []).forEach((ligne, index) => {
    const produit = ligne.produit || {};
    const quantite = Number(ligne.quantiteCommandee || 0);
    const prix = Number(ligne.prixUnitaireHt || 0);
    const remise = Number(ligne.remise || 0);
    const tauxTva = Number(produit.tauxTva || 18);
    const montantHt = Number(
      ligne.montantHt || quantite * prix * (1 - remise / 100),
    );
    const label = `${index + 1}. ${produit.reference || ligne.idProduit} - ${produit.designation || "Produit"} | Qte: ${quantite} | PU HT: ${money(prix, currency)} | Remise: ${remise}% | TVA: ${tauxTva}% | Montant HT: ${money(montantHt, currency)}`;
    lines.push(...wrapText(label));
  });

  lines.push(
    "",
    `Total HT: ${money(bonCommande.totalHt, currency)}`,
    `Total TVA: ${money(bonCommande.totalTva, currency)}`,
    `Total TTC: ${money(bonCommande.totalTtc, currency)}`,
    "",
    "CONDITIONS ET OBSERVATIONS",
    `Conditions paiement: ${fournisseur.conditionsPaiement || "Selon accord commercial"}`,
    `Notes: ${bonCommande.notes || "-"}`,
    "",
    "Signature et cachet de l'entreprise: ______________________________",
    "Accuse de reception fournisseur: _________________________________",
    "",
    "Document a conserver comme piece justificative et a rapprocher avec la facture fournisseur et la reception marchandise.",
  );

  return lines;
}

function buildSimplePdf(lines) {
  const pages = [];
  for (let i = 0; i < lines.length; i += 42) pages.push(lines.slice(i, i + 42));

  const objects = [];
  const add = (content) => {
    objects.push(content);
    return objects.length;
  };

  const pageRefs = [];
  const fontRef = 3;
  const pagesRef = 2;
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  for (const pageLines of pages) {
    const content = [
      "BT",
      "/F1 10 Tf",
      "50 790 Td",
      "14 TL",
      ...pageLines.map(
        (line, index) => `${index === 0 ? "" : "T* "}(${pdfText(line)}) Tj`,
      ),
      "ET",
    ].join("\n");
    const contentRef = add(
      `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
    );
    const pageRef = add(
      `<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontRef} 0 R >> >> /Contents ${contentRef} 0 R >>`,
    );
    pageRefs.push(pageRef);
  }

  objects[pagesRef - 1] =
    `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;

  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(chunks.join(""), "utf8"));
    chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });
  const xrefOffset = Buffer.byteLength(chunks.join(""), "utf8");
  chunks.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  offsets
    .slice(1)
    .forEach((offset) =>
      chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`),
    );
  chunks.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );
  return Buffer.from(chunks.join(""), "utf8");
}

export function buildBcfHtml(bonCommande, entreprise = {}) {
  const currency = entreprise.devise || "XAF";
  const fournisseur = bonCommande.fournisseur || {};
  const lignes = (bonCommande.lignes || [])
    .map((ligne, index) => {
      const produit = ligne.produit || {};
      const quantite = Number(ligne.quantiteCommandee || 0);
      const prix = Number(ligne.prixUnitaireHt || 0);
      const remise = Number(ligne.remise || 0);
      const tauxTva = Number(produit.tauxTva || 18);
      const montantHt = Number(
        ligne.montantHt || quantite * prix * (1 - remise / 100),
      );
      const montantTva = montantHt * (tauxTva / 100);

      return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(produit.reference || ligne.idProduit)}</td>
        <td>${escapeHtml(produit.designation || "Produit")}</td>
        <td>${escapeHtml(produit.uniteMesure || "PIECE")}</td>
        <td class="num">${quantite}</td>
        <td class="num">${money(prix, currency)}</td>
        <td class="num">${remise.toLocaleString("fr-FR")} %</td>
        <td class="num">${tauxTva.toLocaleString("fr-FR")} %</td>
        <td class="num">${money(montantHt, currency)}</td>
        <td class="num">${money(montantTva, currency)}</td>
      </tr>
    `;
    })
    .join("");

  return `<!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Bon de commande ${escapeHtml(bonCommande.numeroBcf)}</title>
    <style>
      * { box-sizing: border-box; }
      html, body { height: 100%; }
      body { color: #111827; font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 0; }
      .a4-sheet { display: flex; flex-direction: column; min-height: calc(297mm - 24mm); padding: 18px; }
      h1 { font-size: 24px; letter-spacing: .04em; margin: 0 0 8px; text-transform: uppercase; }
      h2 { border-bottom: 1px solid #d1d5db; font-size: 12px; margin: 18px 0 8px; padding-bottom: 5px; text-transform: uppercase; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #d1d5db; padding: 7px; vertical-align: top; }
      th { background: #f3f4f6; text-align: left; }
      .header { align-items: flex-start; display: flex; justify-content: space-between; gap: 32px; }
      .muted { color: #4b5563; }
      .box { border: 1px solid #d1d5db; padding: 10px; }
      .grid { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; }
      .num { text-align: right; white-space: nowrap; }
      .summary { margin-left: auto; margin-top: 16px; width: 320px; }
      .summary td:first-child { font-weight: 700; }
      .total { background: #111827; color: #fff; font-weight: 700; }
      .signatures { display: grid; gap: 24px; grid-template-columns: 1fr 1fr; margin-top: 36px; }
      .signature { border-top: 1px solid #111827; padding-top: 8px; text-align: center; }
      .footer { border-top: 1px solid #d1d5db; color: #6b7280; font-size: 10px; margin-top: auto; padding-top: 8px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="a4-sheet">
    <div class="header">
      <div>
        <h1>Bon de commande fournisseur</h1>
        <div class="muted">Document commercial et comptable</div>
      </div>
      <div class="box">
        <strong>N° ${escapeHtml(bonCommande.numeroBcf)}</strong><br />
        Date commande : ${date(bonCommande.dateCommande)}<br />
        Livraison prevue : ${date(bonCommande.dateLivraisonPrevue)}<br />
        Statut : ${escapeHtml(bonCommande.statut)}
      </div>
    </div>

    <div class="grid">
      <div>
        <h2>Emetteur</h2>
        <div class="box">
          <strong>${escapeHtml(entreprise.raisonSociale || "AC ERP")}</strong><br />
          NIF/RCCM : ${escapeHtml(entreprise.numeroFiscal || "-")}<br />
          Adresse : ${escapeHtml(entreprise.adresse || "-")}<br />
          Telephone : ${escapeHtml(entreprise.telephone || "-")}<br />
          Email : ${escapeHtml(entreprise.email || "-")}
        </div>
      </div>
      <div>
        <h2>Fournisseur</h2>
        <div class="box">
          <strong>${escapeHtml(fournisseur.raisonSociale || "-")}</strong><br />
          Code : ${escapeHtml(fournisseur.codeFournisseur || "-")}<br />
          NIF/RCCM : ${escapeHtml(fournisseur.numeroFiscal || "-")}<br />
          Adresse : ${escapeHtml(fournisseur.adresse || "-")}, ${escapeHtml(fournisseur.ville || "")}<br />
          Telephone : ${escapeHtml(fournisseur.telephone || "-")}<br />
          Email : ${escapeHtml(fournisseur.email || "-")}
        </div>
      </div>
    </div>

    <h2>Articles commandes</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Reference</th>
          <th>Designation</th>
          <th>Unite</th>
          <th class="num">Qte</th>
          <th class="num">Prix HT</th>
          <th class="num">Remise</th>
          <th class="num">TVA</th>
          <th class="num">Montant HT</th>
          <th class="num">TVA</th>
        </tr>
      </thead>
      <tbody>${lignes}</tbody>
    </table>

    <table class="summary">
      <tr><td>Total HT</td><td class="num">${money(bonCommande.totalHt, currency)}</td></tr>
      <tr><td>Total TVA</td><td class="num">${money(bonCommande.totalTva, currency)}</td></tr>
      <tr class="total"><td>Total TTC</td><td class="num">${money(bonCommande.totalTtc, currency)}</td></tr>
    </table>

    <h2>Conditions et observations</h2>
    <div class="box">
      Conditions paiement : ${escapeHtml(fournisseur.conditionsPaiement || "Selon accord commercial")}<br />
      Notes : ${escapeHtml(bonCommande.notes || "-")}
    </div>

    <div class="signatures">
      <div class="signature">Signature et cachet de l'entreprise</div>
      <div class="signature">Accuse de reception fournisseur</div>
    </div>

    <div class="footer">
      Ce document doit etre conserve comme piece justificative de la commande et rapproche avec la facture fournisseur et la reception marchandise.
    </div>
    </div>
  </body>
  </html>`;
}

export async function buildBcfPdf(bonCommande, entreprise) {
  try {
    const { buffer } = await renderPdfDocument({
      html: buildBcfHtml(bonCommande, entreprise),
      pdfOptions: {
        format: "A4",
        printBackground: true,
        margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" },
      },
    });
    return buffer;
  } catch {
    return buildSimplePdf(buildBcfTextLines(bonCommande, entreprise));
  }
}
