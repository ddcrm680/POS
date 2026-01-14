import { Box } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
    console.log(value,'valuevalue');
    
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const triggerRef = useRef<HTMLDivElement | null>(null);
    const portalRef = useRef<HTMLDivElement | null>(null);

    // ✅ Close on outside click (portal-safe)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;

            if (
                triggerRef.current?.contains(target) ||
                portalRef.current?.contains(target)
            ) {
                return;
            }

            setOpen(false);
            setSearch("");
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(o =>
        o.label?.toLowerCase().includes(search.toLowerCase())
    );

    const rect = triggerRef.current?.getBoundingClientRect();

    return (
        <div ref={triggerRef} className="relative inline-flex items-center gap-1">
            <Box className="flex gap-[0.5px]">
                <span>{label}</span>
                <Box className={`w-[6px] h-[6px] ${value !== "" && "bg-[#FE0000]"} rounded-full`}></Box>
            </Box>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="p-1 hover:bg-gray-100 rounded"
            >
                <ChevronDown size={14} />
            </button>

            {open &&
                rect &&
                createPortal(
                    <div
                        ref={portalRef}
                        className="fixed z-[9999]"
                        style={{
                            top: rect.bottom + 4,
                            left: rect.left,
                            width: 192,
                        }}
                    >
                        <div className="rounded-md border bg-white shadow-lg">
                            <input
                                placeholder="Search..."
                                className="w-full px-2 py-1 border-b outline-none text-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoFocus
                            />

                            <div className="max-h-40 overflow-auto">
                                {filteredOptions.length === 0 && (
                                    <div className="px-3 py-2 text-gray-400 text-sm">
                                        No results
                                    </div>
                                )}

                                {filteredOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            onChange(opt.value);
                                            setOpen(false);
                                            setSearch("");
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${value === opt.value ? "font-semibold text-blue-600" : ""
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}
