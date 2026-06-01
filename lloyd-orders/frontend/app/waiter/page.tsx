"use client";

import { useMemo, useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { OrderSummary } from "@/components/OrderSummary";
import { TableSelector } from "@/components/TableSelector";
import { createOrder } from "@/lib/api";
import { products, type Product } from "@/lib/products";
import type { OrderItem } from "@/lib/types";

export default function WaiterPage() {
  const [selectedTable, setSelectedTable] = useState("Šank");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canSend = useMemo(() => selectedTable.length > 0 && items.length > 0, [selectedTable, items]);

  function addProduct(product: Product, variant?: "option" | "double") {
    setMessage(null);
    const selectedProduct =
      variant === "double"
        ? { ...product, name: `${product.name} double`, price: product.price * 2, printPriority: product.printPriority + 0.1 }
        : variant === "option" && product.optionLabel
          ? { ...product, name: `${product.name} ${product.optionLabel}` }
          : product;

    setItems((current) => {
      const existing = current.find((item) => item.name === selectedProduct.name);
      if (existing) {
        return current.map((item) => (item.name === selectedProduct.name ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [
        ...current,
        {
          name: selectedProduct.name,
          category: selectedProduct.category,
          categoryPriority: selectedProduct.categoryPriority,
          printPriority: selectedProduct.printPriority,
          price: selectedProduct.price,
          quantity: 1
        }
      ];
    });
  }

  function decreaseProduct(name: string) {
    setItems((current) =>
      current
        .map((item) => (item.name === name ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function increaseProduct(name: string) {
    setItems((current) => current.map((item) => (item.name === name ? { ...item, quantity: item.quantity + 1 } : item)));
  }

  async function sendOrder() {
    if (!selectedTable || items.length === 0) {
      return;
    }

    setSending(true);
    setMessage(null);
    try {
      await createOrder(selectedTable, items, note);
      setItems([]);
      setNote("");
      setShowNote(false);
      setSelectedTable("Šank");
      setMessage(`Order sent to bar for ${selectedTable}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-5 pt-5 text-ink">
      <div className="mx-auto flex max-w-md flex-col gap-6 pb-40">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase text-sea">Lloyd Orders</p>
            <h1 className="text-3xl font-black">Waiter</h1>
          </div>
          <div className="rounded-md bg-ink px-3 py-2 font-black text-white">{selectedTable}</div>
        </header>

        {message ? <p className="rounded-md bg-lime px-3 py-3 text-center font-bold">{message}</p> : null}

        <TableSelector selectedTable={selectedTable} onSelect={setSelectedTable} />
        <ProductGrid products={products} onAdd={addProduct} />
      </div>

      <OrderSummary
        disabled={!canSend}
        items={items}
        note={note}
        sending={sending}
        showNote={showNote}
        onClear={() => setItems([])}
        onDecrease={decreaseProduct}
        onIncrease={increaseProduct}
        onNoteChange={setNote}
        onSend={sendOrder}
        onToggleNote={() => setShowNote((current) => !current)}
      />
    </main>
  );
}
