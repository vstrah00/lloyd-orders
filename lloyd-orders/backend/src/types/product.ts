export type Product = {
  id: number;
  name: string;
  category: string;
  categoryPriority: number;
  printPriority: number;
  price: number;
  optionalFlag?: string;
};

export type ProductInput = {
  name: string;
  category: string;
  categoryPriority?: number;
  printPriority: number;
  price: number;
  optionalFlag?: string;
};
