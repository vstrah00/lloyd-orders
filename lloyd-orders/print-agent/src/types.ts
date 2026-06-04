export type OrderItem = {
  name: string;
  category: string;
  categoryPriority: number;
  printPriority: number;
  price: number;
  quantity: number;
};

export type Order = {
  id: number;
  tableLabel: string;
  waiterName?: string;
  timestamp: string;
  items: OrderItem[];
  note?: string;
  printedAt?: string | null;
  status: "new" | "completed";
};
