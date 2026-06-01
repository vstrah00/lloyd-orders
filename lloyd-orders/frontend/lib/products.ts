import type { OrderItem } from "./types";

export type Product = Omit<OrderItem, "quantity"> & {
  description?: string;
  optionPrompt?: string;
  optionLabel?: string;
  doubleEligible?: boolean;
};

const categoryPriority = {
  Coffee: 10,
  "Hladne kave": 11,
  "Non carbonated drinks": 20,
  "Carbonated drinks": 21,
  Beer: 30,
  Spirits: 40,
  Liqueurs: 41,
  Wine: 50,
  "Ice cream": 60,
  Cocktails: 90,
} as const;

function product(
  name: string,
  category: keyof typeof categoryPriority,
  printPriority: number,
  price: number,
  extra: Partial<Product> = {}
): Product {
  return {
    name,
    category,
    categoryPriority: categoryPriority[category],
    printPriority,
    price,
    ...extra
  };
}

export const products: Product[] = [
  product("Espresso kava", "Coffee", 10, 1.5),
  product("Mala ladno", "Coffee", 20, 1.5),
  product("Mala toplo", "Coffee", 30, 1.5),
  product("Velika ladno", "Coffee", 40, 2),
  product("Velika toplo", "Coffee", 50, 2),
  product("Americano s mlijekom", "Coffee", 60, 3),
  product("Americano BEZ mlijeka", "Coffee", 65, 3),
  product("Espresso kava s šlagom", "Coffee", 70, 2),
  product("Nescafe", "Coffee", 80, 3),
  product("Bijela kava", "Coffee", 90, 2.5),
  product("Velika espresso kava s šlagom", "Coffee", 100, 2.5),
  product("Caffe Latte", "Coffee", 110, 3),
  product("Cappuccino", "Coffee", 999, 3),

  product("Hladni Nescafe", "Hladne kave", 10, 3),
  product("Ice coffee", "Hladne kave", 20, 3),

  product("Pago jabuka", "Non carbonated drinks", 10, 3),
  product("Pago naranča", "Non carbonated drinks", 20, 3),
  product("Pago jagoda", "Non carbonated drinks", 30, 3),
  product("Pago crni ribiz", "Non carbonated drinks", 40, 3, {
    optionLabel: "0.5L"
  }),
  product("Pago marelica", "Non carbonated drinks", 50, 3),
  product("Cedevita limun", "Non carbonated drinks", 60, 2.5, {
    optionLabel: "0.5L"
  }),
  product("Cedevita naranča", "Non carbonated drinks", 70, 2.5, {
    optionLabel: "0.5L"
  }),
  product("Ice tea breskva", "Non carbonated drinks", 80, 3),
  product("Ice tea brusnica", "Non carbonated drinks", 90, 3),
  product("Prirodna negazirana voda 0,25L", "Non carbonated drinks", 100, 2),
  product("Cijeđena limunada", "Non carbonated drinks", 110, 4),

  product("Tonic", "Carbonated drinks", 10, 3),
  product("Pipi", "Carbonated drinks", 20, 3),
  product("Sprite", "Carbonated drinks", 30, 3),
  product("Orangina", "Carbonated drinks", 40, 4),
  product("Coca-Cola", "Carbonated drinks", 50, 3),
  product("Bitter lemon", "Carbonated drinks", 60, 3),
  product("Romerquelle limunska trava 0,3L", "Carbonated drinks", 70, 2.5),
  product("Jamnica sensation", "Carbonated drinks", 80, 2.5),
  product("Prirodna gazirana voda 0,25L", "Carbonated drinks", 90, 2.5),

  product("Točeno pivo 0,3L", "Beer", 10, 3),
  product("Točeno pivo 0,5L", "Beer", 20, 4.5),
  product("Ožujsko 0,33L", "Beer", 30, 3),
  product("Karlovačko 0,33L", "Beer", 40, 3),
  product("Staropramen 0,33L", "Beer", 50, 3),
  product("Beck's 0,33L", "Beer", 60, 3.5),
  product("Ožujsko limun - Radler 0,33L", "Beer", 70, 3),
  product("Somersby 0,33L", "Beer", 80, 4),
  
  product("CUBA LIBRE", "Cocktails", 10, 8, {
    description: "White rum, squeezed lemon and Coca-Cola"
  }),
  product("BLUE HAWAII", "Cocktails", 20, 10, {
    description: "White rum, blue curacao, coconut syrup and pineapple juice"
  }),
  product("TEQUILA SUNRISE", "Cocktails", 30, 10, {
    description: "Tequila, orange juice and grenadine syrup"
  }),
  product("MEXICAN WAVE", "Cocktails", 40, 10, {
    description: "Tequila, Malibu, blue curacao and Sprite"
  }),
  product("SEX ON THE BEACH", "Cocktails", 50, 10, {
    description: "Vodka, peach liqueur, orange juice and cranberry juice"
  }),
  product("MALIBU BAY BREEZE", "Cocktails", 60, 10),
  product("LONG ISLAND ICED TEA", "Cocktails", 70, 12, {
    description: "White rum, vodka, gin, tequila, lemon juice and Coca-Cola"
  }),
  product("MOJITO", "Cocktails", 80, 12, {
    description: "White rum, mint, lime juice, simple syrup and soda"
  }),
  product("APEROL SPRITZ", "Cocktails", 1, 8, {
    description: "Prosecco, Aperol and sparkling water"
  }),
  product("CAMPARI SPRITZ", "Cocktails", 2, 8, {
    description: "Prosecco, Campari and sparkling water"
  }),
  product("HUGO SPRITZ", "Cocktails", 3, 10, {
    description: "Prosecco, Gin, elderflower syrup, mint and sparkling water"
  }),
  product("MIMOSA", "Cocktails", 4, 7, {
    description: "Prosecco and orange juice"
  }),

  product("Pelinkovac", "Spirits", 10, 2, { doubleEligible: true }),
  product("Orahovac", "Spirits", 20, 2, { doubleEligible: true }),
  product("Travarica", "Spirits", 30, 2, { doubleEligible: true }),
  product("Konjak", "Spirits", 40, 2, { doubleEligible: true }),
  product("Rum", "Spirits", 50, 2, { doubleEligible: true }),
  product("Stock", "Spirits", 60, 2, { doubleEligible: true }),
  product("Gin", "Spirits", 70, 2, { doubleEligible: true }),
  product("Vodka", "Spirits", 80, 2, { doubleEligible: true }),

  product("Baileys liker", "Liqueurs", 10, 3.5, { doubleEligible: true }),
  product("Ballantine's", "Liqueurs", 20, 3, { doubleEligible: true }),
  product("Campari", "Liqueurs", 30, 4, { doubleEligible: true }),
  product("Jagermeister", "Liqueurs", 40, 3, { doubleEligible: true }),
  product("Malibu", "Liqueurs", 50, 3, { doubleEligible: true }),

  product("Bijelo vino - Graševina 0,187L", "Wine", 10, 5),
  product("Crno vino - Plavac 0,187L", "Wine", 20, 5),
  product("Bijelo vino - Malvazija 0,1L", "Wine", 30, 2),
  product("Gemišt 0,3L", "Wine", 40, 4),

  product("Sladoled na štapiću", "Ice cream", 10, 2),
  product("Kornet", "Ice cream", 20, 2.5),
  product("Magnum", "Ice cream", 30, 3.5)
];
