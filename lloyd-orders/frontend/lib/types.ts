export type OrderStatus = "new" | "completed";

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
  timestamp: string;
  items: OrderItem[];
  note?: string;
  status: OrderStatus;
};
