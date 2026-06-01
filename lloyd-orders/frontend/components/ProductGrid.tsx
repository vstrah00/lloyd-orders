import { Plus } from "lucide-react";
import { formatEur } from "@/lib/orderFormatting";
import type { Product } from "@/lib/products";

type ProductGridProps = {
  products: Product[];
  onAdd: (product: Product, variant?: "option" | "double") => void;
};

export function ProductGrid({ products, onAdd }: ProductGridProps) {
  const categories = [...new Map(
    products
      .sort((left, right) => left.categoryPriority - right.categoryPriority || left.printPriority - right.printPriority)
      .map((product) => [product.category, product.categoryPriority])
  ).entries()].sort((left, right) => left[1] - right[1]);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-black uppercase tracking-wide">Products</h2>
      {categories.map(([category]) => (
        <div className="flex flex-col gap-2" key={category}>
          <h3 className="rounded-md bg-ink px-3 py-2 text-sm font-black uppercase text-white">{category}</h3>
          <div className="grid grid-cols-2 gap-2">
            {products
              .filter((product) => product.category === category)
              .sort((left, right) => left.printPriority - right.printPriority || left.name.localeCompare(right.name))
              .map((product) => (
                <div
                  className="flex min-h-20 flex-col gap-2 rounded-md border-2 border-ink/15 bg-white px-3 py-3"
                  key={`${product.category}-${product.name}`}
                >
                  <button className="flex flex-1 items-start justify-between gap-2 text-left active:scale-[0.98]" onClick={() => onAdd(product)} type="button">
                    <span className="min-w-0">
                      <span className="block font-black leading-tight">{product.name}</span>
                      <span className="mt-1 block text-sm font-bold text-ink/65">{formatEur(product.price)}</span>
                    </span>
                    <Plus aria-hidden className="mt-1 h-5 w-5 shrink-0" />
                  </button>
                  {product.optionLabel || product.doubleEligible ? (
                    <button
                      className="h-9 rounded bg-coral px-2 text-xs font-black uppercase text-white active:scale-[0.98]"
                      onClick={() => onAdd(product, product.doubleEligible ? "double" : "option")}
                      type="button"
                    >
                      {product.doubleEligible ? `Double ${formatEur(product.price * 2)}` : `${product.optionLabel}`}
                    </button>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
