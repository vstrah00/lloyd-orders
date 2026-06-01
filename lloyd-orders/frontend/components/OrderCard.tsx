import { Check } from "lucide-react";
import { formatEur, groupOrderItems, lineTotal, orderTotal } from "@/lib/orderFormatting";
import type { Order } from "@/lib/types";

type OrderCardProps = {
  order: Order;
  onComplete: (id: number) => void;
  completing?: boolean;
};

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

export function OrderCard({ order, onComplete, completing }: OrderCardProps) {
  const groups = groupOrderItems(order.items);
  const itemGroups = groups.filter((group) => group.category !== "Note");
  const noteGroup = groups.find((group) => group.category === "Note");
  const total = orderTotal(order.items);

  return (
    <article className="rounded-md border-2 border-lime bg-zinc-950 text-white shadow-lg">
      <header className="flex items-center justify-between border-b-2 border-lime bg-zinc-900 px-4 py-3">
        <div>
          <p className="text-sm font-black uppercase text-lime">Table</p>
          <h2 className="text-5xl font-black leading-none text-white">{order.tableLabel}</h2>
        </div>
        <time className="rounded bg-lime px-3 py-2 text-2xl font-black text-ink" dateTime={order.timestamp}>
          {formatTime(order.timestamp)}
        </time>
      </header>

      <div className="flex flex-col gap-4 px-4 py-4">
        {noteGroup ? (
          <section className="rounded-md border-2 border-coral bg-coral/20 px-3 py-2">
            <h3 className="text-sm font-black uppercase text-coral">Note</h3>
            <p className="mt-1 font-black text-white">{noteGroup.items.map((item) => item.name.replace(/^NOTE:\s*/, "")).join(" ")}</p>
          </section>
        ) : null}

        {itemGroups.map((group) => (
          <section className="flex flex-col gap-2" key={group.category}>
            <h3 className="rounded bg-lime px-2 py-1 text-sm font-black uppercase text-ink">{group.category}</h3>
            <ul className="flex flex-col gap-2">
              {group.items.map((item) => (
                <li className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-base font-bold" key={item.name}>
                  <span className="font-black text-lime">{item.quantity}x</span>
                  <span className="text-white">{item.name}</span>
                  <span />
                  <span className="text-sm font-black text-white/75">
                    {item.quantity} x {formatEur(item.price)} = {formatEur(lineTotal(item))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="border-t-2 border-lime pt-3 text-right text-xl font-black text-lime">TOTAL: {formatEur(total)}</div>
      </div>

      <footer className="px-4 pb-4">
        <button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-lime font-black text-ink disabled:opacity-50"
          disabled={completing}
          onClick={() => onComplete(order.id)}
          type="button"
        >
          <Check aria-hidden className="h-5 w-5" />
          Done
        </button>
      </footer>
    </article>
  );
}
