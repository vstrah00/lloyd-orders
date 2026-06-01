import { Minus, Plus } from "lucide-react";

type QuantityControlsProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function QuantityControls({ quantity, onDecrease, onIncrease }: QuantityControlsProps) {
  return (
    <div className="grid w-28 grid-cols-3 overflow-hidden rounded-md border-2 border-ink">
      <button aria-label="Decrease quantity" className="grid h-10 place-items-center bg-white" onClick={onDecrease} type="button">
        <Minus aria-hidden className="h-4 w-4" />
      </button>
      <div className="grid h-10 place-items-center bg-ink font-black text-white">{quantity}</div>
      <button aria-label="Increase quantity" className="grid h-10 place-items-center bg-white" onClick={onIncrease} type="button">
        <Plus aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
