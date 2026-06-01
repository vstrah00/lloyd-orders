type TableSelectorProps = {
  selectedTable: string;
  onSelect: (table: string) => void;
};

const upperTables = Array.from({ length: 9 }, (_, index) => `G${index + 1}`);
const lowerTables = Array.from({ length: 9 }, (_, index) => `D${index + 1}`);

export function TableSelector({ selectedTable, onSelect }: TableSelectorProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-black uppercase tracking-wide">Table</h2>
      <button
        className={`h-14 rounded-md border-2 text-xl font-black ${
          selectedTable === "Šank" ? "border-ink bg-lime text-ink" : "border-ink/15 bg-white"
        }`}
        onClick={() => onSelect("Šank")}
        type="button"
      >
        Šank
      </button>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-black uppercase text-ink/60">Gornja terasa</h3>
        <div className="grid grid-cols-3 gap-2">
          {upperTables.map((table) => (
            <TableButton key={table} selected={selectedTable === table} table={table} onSelect={onSelect} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-black uppercase text-ink/60">Donja terasa</h3>
        <div className="grid grid-cols-3 gap-2">
          {lowerTables.map((table) => (
            <TableButton key={table} selected={selectedTable === table} table={table} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </section>
  );
}

type TableButtonProps = {
  table: string;
  selected: boolean;
  onSelect: (table: string) => void;
};

function TableButton({ table, selected, onSelect }: TableButtonProps) {
  return (
    <button
      className={`h-12 rounded-md border-2 text-lg font-black ${
        selected ? "border-ink bg-lime text-ink" : "border-ink/15 bg-white"
      }`}
      onClick={() => onSelect(table)}
      type="button"
    >
      {table}
    </button>
  );
}
