"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { OrderCard } from "@/components/OrderCard";
import { completeOrder, fetchNewOrders } from "@/lib/api";
import { createSocket } from "@/lib/socket";
import type { Order } from "@/lib/types";

function playNotification() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const audio = new AudioContextClass();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.frequency.value = 880;
  oscillator.type = "sine";
  gain.gain.value = 0.08;
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.18);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export default function BarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const audioUnlocked = useRef(false);

  const activeOrders = useMemo(() => orders.filter((order) => order.status === "new"), [orders]);

  async function loadOrders() {
    setLoading(true);
    try {
      setOrders(await fetchNewOrders());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();

    const socket = createSocket();
    socket.on("order:new", (order: Order) => {
      setOrders((current) => [order, ...current.filter((existing) => existing.id !== order.id)]);
      if (audioUnlocked.current) {
        playNotification();
      }
    });

    socket.on("order:updated", (updated: Order) => {
      setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function markComplete(id: number) {
    setCompletingId(id);
    try {
      const updated = await completeOrder(id);
      setOrders((current) => current.map((order) => (order.id === id ? updated : order)));
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <main
      className="min-h-screen bg-ink px-4 py-5 text-white"
      onPointerDown={() => {
        audioUnlocked.current = true;
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-lime">Lloyd Orders</p>
            <h1 className="text-4xl font-black">Bar</h1>
          </div>
          <button
            aria-label="Refresh orders"
            className="grid h-12 w-12 place-items-center rounded-md border-2 border-white/30 bg-white/10"
            onClick={loadOrders}
            type="button"
          >
            <RefreshCw aria-hidden className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </header>

        <section className="rounded-md bg-white/10 px-4 py-3">
          <p className="text-lg font-black">{activeOrders.length} active orders</p>
        </section>

        {activeOrders.length === 0 ? (
          <div className="grid min-h-72 place-items-center rounded-md border-2 border-dashed border-white/25 text-center text-xl font-black text-white/60">
            No active orders
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeOrders.map((order) => (
              <OrderCard completing={completingId === order.id} key={order.id} order={order} onComplete={markComplete} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
