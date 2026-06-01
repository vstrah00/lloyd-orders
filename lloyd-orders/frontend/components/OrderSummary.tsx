"use client";

import { Send, Trash2 } from "lucide-react";
import { formatEur, lineTotal, orderTotal } from "@/lib/orderFormatting";
import type { OrderItem } from "@/lib/types";
import { QuantityControls } from "./QuantityControls";

type OrderSummaryProps = {
  items: OrderItem[];
  disabled: boolean;
  sending: boolean;
  note: string;
  showNote: boolean;
  onDecrease: (name: string) => void;
  onIncrease: (name: string) => void;
  onSend: () => void;
  onClear: () => void;
  onNoteChange: (note: string) => void;
  onToggleNote: () => void;
};

export function OrderSummary({
  items,
  disabled,
  sending,
  note,
  showNote,
  onDecrease,
  onIncrease,
  onSend,
  onClear,
  onNoteChange,
  onToggleNote
}: OrderSummaryProps) {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const total = orderTotal(items);

  return (
    <section className="sticky bottom-0 -mx-5 border-t-2 border-ink bg-paper px-5 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-md flex-col gap-3">
        {items.length === 0 ? (
          <p className="rounded-md border-2 border-dashed border-ink/20 bg-white px-3 py-4 text-center font-bold text-ink/55">
            No items selected
          </p>
        ) : (
          <div className="flex max-h-48 flex-col gap-2 overflow-auto">
            {items.map((item) => (
              <div className="flex items-center justify-between gap-3 rounded-md bg-white p-2" key={item.name}>
                <span className="min-w-0">
                  <span className="block font-bold">{item.name}</span>
                  <span className="block text-sm font-bold text-ink/60">{formatEur(lineTotal(item))}</span>
                </span>
                <QuantityControls
                  quantity={item.quantity}
                  onDecrease={() => onDecrease(item.name)}
                  onIncrease={() => onIncrease(item.name)}
                />
              </div>
            ))}
          </div>
        )}

        {showNote ? (
          <textarea
            className="min-h-20 resize-none rounded-md border-2 border-ink bg-white p-3 font-bold outline-none"
            maxLength={160}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Optional note"
            value={note}
          />
        ) : null}

        <div className="grid grid-cols-[3.5rem_5rem_1fr] gap-2">
          <button
            aria-label="Clear order"
            className="grid h-14 place-items-center rounded-md border-2 border-ink bg-white disabled:opacity-40"
            disabled={items.length === 0 || sending}
            onClick={onClear}
            type="button"
          >
            <Trash2 aria-hidden className="h-5 w-5" />
          </button>
          <button
            className={`h-14 rounded-md border-2 border-ink px-2 text-sm font-black ${showNote ? "bg-lime" : "bg-white"}`}
            onClick={onToggleNote}
            type="button"
          >
            Note
          </button>
          <button
            className="flex h-14 items-center justify-center gap-2 rounded-md bg-ink px-4 text-lg font-black text-white disabled:opacity-40"
            disabled={disabled || sending}
            onClick={onSend}
            type="button"
          >
            <Send aria-hidden className="h-5 w-5" />
            {sending ? "Sending" : `Send ${totalItems || ""} · ${formatEur(total)}`}
          </button>
        </div>
      </div>
    </section>
  );
}
