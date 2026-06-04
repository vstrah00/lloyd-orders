"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import type { ProductVariant } from "@/components/ProductGrid";
import { OrderSummary } from "@/components/OrderSummary";
import { TableSelector } from "@/components/TableSelector";
import { createOrder, fetchProducts, fetchWaiters } from "@/lib/api";
import type { OrderItem, Product, Waiter } from "@/lib/types";

export default function WaiterPage() {
  const [selectedTable, setSelectedTable] = useState("Šank");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [waiterName, setWaiterName] = useState("");
  const [showWaiterName, setShowWaiterName] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canSend = useMemo(() => selectedTable.length > 0 && items.length > 0, [selectedTable, items]);

  useEffect(() => {
    const savedWaiterName = window.localStorage.getItem("lloyd-waiter-name") ?? "";
    setWaiterName(savedWaiterName);
    fetchProducts()
      .then(setProducts)
      .catch((error) => setMessage(error instanceof Error ? error.message : "Failed to load products"))
      .finally(() => setLoadingProducts(false));
    fetchWaiters()
      .then((loadedWaiters) => {
        setWaiters(loadedWaiters);
        if (savedWaiterName && !loadedWaiters.some((waiter) => waiter.name === savedWaiterName)) {
          updateWaiterName("");
        }
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Failed to load waiters"));
  }, []);

  function updateWaiterName(value: string) {
    setWaiterName(value);
    if (value) {
      window.localStorage.setItem("lloyd-waiter-name", value);
    } else {
      window.localStorage.removeItem("lloyd-waiter-name");
    }
  }

  function addProduct(product: Product, variant?: ProductVariant) {
    setMessage(null);
    const selectedName = variant?.name ?? product.name;
    const selectedPrice = variant?.price ?? product.price;
    const selectedPrintPriority = variant?.printPriority ?? product.printPriority;

    setItems((current) => {
      const existing = current.find((item) => item.name === selectedName);
      if (existing) {
        const updated = current.map((item) => (item.name === selectedName ? { ...item, quantity: item.quantity + 1 } : item));
        return [updated.find((item) => item.name === selectedName)!, ...updated.filter((item) => item.name !== selectedName)];
      }

      return [
        {
          name: selectedName,
          category: product.category,
          categoryPriority: product.categoryPriority,
          printPriority: selectedPrintPriority,
          price: selectedPrice,
          quantity: 1
        },
        ...current
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
      await createOrder(selectedTable, items, note, waiterName);
      setItems([]);
      setNote("");
      setShowNote(false);
      setShowWaiterName(false);
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
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase text-sea">Lloyd Orders</p>
            <h1 className="text-3xl font-black">Waiter</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Waiter name"
              className={`grid h-11 w-11 place-items-center rounded-md border-2 border-ink ${
                waiterName ? "bg-lime text-ink" : "bg-white text-ink"
              }`}
              onClick={() => setShowWaiterName((current) => !current)}
              title={waiterName ? `Waiter: ${waiterName}` : "Waiter name"}
              type="button"
            >
              <User aria-hidden className="h-5 w-5" />
            </button>
            <div className="rounded-md bg-ink px-3 py-2 font-black text-white">{selectedTable}</div>
          </div>
        </header>

        {showWaiterName ? (
          <section className="flex flex-col gap-2 rounded-md border-2 border-ink bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase">Waiter</h2>
              {waiterName ? (
                <button className="text-xs font-black uppercase text-coral" onClick={() => updateWaiterName("")} type="button">
                  Clear
                </button>
              ) : null}
            </div>
            {waiters.length === 0 ? (
              <p className="text-sm font-bold text-ink/55">Add waiter names in Products Admin.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {waiters.map((waiter) => (
                  <button
                    className={`h-11 rounded-md border-2 px-3 font-black ${
                      waiterName === waiter.name ? "border-ink bg-lime" : "border-ink/15 bg-paper"
                    }`}
                    key={waiter.id}
                    onClick={() => {
                      updateWaiterName(waiter.name);
                      setShowWaiterName(false);
                    }}
                    type="button"
                  >
                    {waiter.name}
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {message ? <p className="rounded-md bg-lime px-3 py-3 text-center font-bold">{message}</p> : null}

        <TableSelector selectedTable={selectedTable} onSelect={setSelectedTable} />
        {loadingProducts ? (
          <p className="rounded-md bg-white px-3 py-4 text-center font-black text-ink/60">Loading products</p>
        ) : (
          <ProductGrid products={products} onAdd={addProduct} />
        )}
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
