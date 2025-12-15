import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ColumnFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: any }[];
  value: any;
  onChange: (val: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);

  // 🔴 Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o =>
   o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center gap-1"
    >
      <span>{label}</span>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-48 rounded-md border bg-white shadow-lg">
          <input
            placeholder="Search..."
            className="w-full px-2 py-1 font-[400] border-b outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />

          <div className="max-h-40 overflow-auto">
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 font-[400] text-gray-400">
                No results
              </div>
            )}

            {filteredOptions.map(opt => {
                return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full text-left px-3 py-2 font-[400] hover:bg-gray-100 `}
              >
                {opt.label}
              </button>
            )})}
          </div>
        </div>
      )}
    </div>
  );
}
