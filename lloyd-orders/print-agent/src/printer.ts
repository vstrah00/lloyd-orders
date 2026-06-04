import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { chromium } from "playwright";

const execFileAsync = promisify(execFile);

export async function printReceipt(receiptHtml: string) {
  const printerName = process.env.PRINTER_NAME ?? "SLK-TS400";

  const htmlPath = path.join(os.tmpdir(), `lloyd-order-${Date.now()}.html`);
  const pdfPath = path.join(os.tmpdir(), `lloyd-order-${Date.now()}.pdf`);

  await fs.writeFile(htmlPath, receiptHtml, "utf8");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath.replace(/\\/g, "/")}`);

  await page.pdf({
    path: pdfPath,
    width: "80mm",
    printBackground: true,
    margin: {
      top: "0mm",
      right: "0mm",
      bottom: "0mm",
      left: "0mm"
    }
  });

  await browser.close();

  await execFileAsync("C:\\Users\\kompj\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe", [
    "-print-to",
    printerName,
    "-silent",
    pdfPath
  ]);

  setTimeout(() => {
    fs.unlink(htmlPath).catch(() => undefined);
    fs.unlink(pdfPath).catch(() => undefined);
  }, 30000);
}