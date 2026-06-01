import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function printReceipt(receipt: string) {
  const printerName = process.env.PRINTER_NAME;

  if (!printerName || printerName === "Your Receipt Printer Name") {
    console.log("PRINTER_NAME is not configured. Receipt output:");
    console.log(receipt);
    return;
  }

  const filePath = path.join(os.tmpdir(), `lloyd-order-${Date.now()}.txt`);
  await fs.writeFile(filePath, receipt, "utf8");

  try {
    await execFileAsync("powershell.exe", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      "param($FilePath, $PrinterName) Get-Content -Raw -LiteralPath $FilePath | Out-Printer -Name $PrinterName",
      filePath,
      printerName
    ]);
  } finally {
    await fs.unlink(filePath).catch(() => undefined);
  }
}
