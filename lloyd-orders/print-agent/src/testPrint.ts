import "dotenv/config";
import { formatReceipt } from "./formatReceipt.js";
import { printReceipt } from "./printer.js";
import type { Order } from "./types.js";

const sampleOrder: Order = {
  id: 0,
  tableLabel: "TEST",
  waiterName: "Test Waiter",
  timestamp: new Date().toISOString(),
  status: "new",
  items: [
    {
      name: "Espresso kava",
      category: "Coffee",
      categoryPriority: 10,
      printPriority: 10,
      price: 1.5,
      quantity: 1
    },
    {
      name: "Coca-Cola",
      category: "Carbonated drinks",
      categoryPriority: 21,
      printPriority: 20,
      price: 3,
      quantity: 2
    },
    {
      name: "Gin double",
      category: "Spirits",
      categoryPriority: 40,
      printPriority: 70.1,
      price: 4,
      quantity: 1
    },
    {
      name: "NOTE: test print",
      category: "Note",
      categoryPriority: 0,
      printPriority: 0,
      price: 0,
      quantity: 1
    }
  ]
};

await printReceipt(formatReceipt(sampleOrder));
console.log("Test receipt sent to printer.");
