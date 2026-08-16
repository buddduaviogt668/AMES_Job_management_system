import html2pdf from "html2pdf.js";

const collectPrintStyles = () => {
  let css = "";
  const walk = (rules) => {
    for (const rule of Array.from(rules || [])) {
      if (rule.cssRules) {
        if (rule.conditionText === "print" || rule.type === CSSRule.MEDIA_RULE) {
          walk(rule.cssRules);
        } else {
          css += `${rule.cssText}\n`;
        }
      } else if (rule.selectorText && (rule.selectorText.includes(".print-") || rule.selectorText.includes(".invoice-print-only"))) {
        css += `${rule.cssText}\n`;
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules);
    } catch {
      // Cross-origin stylesheets cannot be read; the invoice styles are local and are captured above.
    }
  }
  return css;
};

export const invoicePrintElementToPdf = async (element, fileName) => {
  if (!element) throw new Error("The printable invoice is not available yet.");
  const sandbox = document.createElement("div");
  sandbox.style.position = "fixed";
  sandbox.style.left = "-100000px";
  sandbox.style.top = "0";
  sandbox.style.width = "210mm";
  sandbox.style.background = "#ffffff";
  sandbox.style.zIndex = "-1";
  const styles = document.createElement("style");
  styles.textContent = collectPrintStyles();
  sandbox.appendChild(styles);
  const printDocument = element.cloneNode(true);
  printDocument.style.display = "block";
  printDocument.style.width = "210mm";
  printDocument.style.margin = "0";
  sandbox.appendChild(printDocument);
  document.body.appendChild(sandbox);

  try {
    return await html2pdf()
      .set({
        margin: 0,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(printDocument)
      .outputPdf("blob");
  } finally {
    sandbox.remove();
  }
};
