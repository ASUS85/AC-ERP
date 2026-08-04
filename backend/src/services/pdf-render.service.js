import Handlebars from "handlebars";
import puppeteer from "puppeteer";

const DEFAULT_BROWSER_OPTIONS = {
  headless: true,
  protocolTimeout: 60000,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
};

const DEFAULT_PDF_OPTIONS = {
  format: "A4",
  printBackground: true,
  margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" },
};

function buildHtml({ html, template, data = {} }) {
  if (typeof html === "string" && html.trim()) {
    return html;
  }

  if (typeof template === "function") {
    return template(data);
  }

  if (typeof template === "string" && template.trim()) {
    const compiled = Handlebars.compile(template);
    return compiled(data);
  }

  throw new Error(
    "Aucun template HTML exploitable fourni pour la generation PDF",
  );
}

async function waitForStableRender(page, timeoutMs) {
  try {
    await page.waitForNetworkIdle({ idleTime: 500, timeout: timeoutMs });
  } catch {}

  try {
    await page.evaluate(async () => {
      if (document?.fonts?.ready) {
        await document.fonts.ready;
      }
    });
  } catch {}
}

export async function renderPdfDocument({
  html,
  template,
  data,
  browserOptions,
  pdfOptions,
  mediaType = "print",
  timeoutMs = 30000,
  scripts = [],
  styles = [],
  onPageReady,
} = {}) {
  let browser;
  try {
    const compiledHtml = buildHtml({ html, template, data });

    browser = await puppeteer.launch({
      ...DEFAULT_BROWSER_OPTIONS,
      ...(browserOptions || {}),
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(timeoutMs);
    page.setDefaultTimeout(timeoutMs);

    await page.setContent(compiledHtml, {
      waitUntil: ["domcontentloaded", "networkidle0"],
      timeout: timeoutMs,
    });

    for (const style of styles) {
      if (style?.content) {
        await page.addStyleTag({ content: style.content });
      }
      if (style?.url) {
        await page.addStyleTag({ url: style.url });
      }
    }

    for (const script of scripts) {
      if (script?.content) {
        await page.addScriptTag({ content: script.content });
      }
      if (script?.url) {
        await page.addScriptTag({ url: script.url });
      }
    }

    await waitForStableRender(page, timeoutMs);
    await page.emulateMediaType(mediaType);

    if (typeof onPageReady === "function") {
      await onPageReady(page);
      await waitForStableRender(page, timeoutMs);
    }

    const buffer = await page.pdf({
      ...DEFAULT_PDF_OPTIONS,
      ...(pdfOptions || {}),
    });

    return {
      buffer,
      base64Content: buffer.toString("base64"),
    };
  } catch (error) {
    const detail = error?.message || "Erreur inconnue";
    throw new Error(`PDF_RENDER_FAILED: ${detail}`);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
