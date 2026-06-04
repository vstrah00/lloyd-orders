export type OrderStatus = "new" | "completed";

export type OrderItem = {
  name: string;
  category: string;
  categoryPriority: number;
  printPriority: number;
  price: number;
  quantity: number;
};

export type Product = Omit<OrderItem, "quantity"> & {
  id: number;
  optionalFlag?: string;
};

export type ProductInput = {
  name: string;
  category: string;
  printPriority: number;
  price: number;
  optionalFlag?: string;
};

export type Category = {
  id: number;
  name: string;
  priority: number;
};

export type CategoryInput = Omit<Category, "id">;

export type Waiter = {
  id: number;
  name: string;
};

export type WaiterInput = {
  name: string;
};

export type Order = {
  id: number;
  tableLabel: string;
  waiterName?: string;
  timestamp: string;
  items: OrderItem[];
  note?: string;
  status: OrderStatus;
};
