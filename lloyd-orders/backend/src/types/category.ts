export type Category = {
  id: number;
  name: string;
  priority: number;
};

export type CategoryInput = Omit<Category, "id">;
