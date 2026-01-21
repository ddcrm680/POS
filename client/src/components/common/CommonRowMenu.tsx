"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EllipsisVertical } from "lucide-react";

export type CommonMenuItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  show?: boolean;
  danger?: boolean;
  disabled?: boolean;
};

type Props = {
  items: CommonMenuItem[];
  width?: number;
};

export default function CommonRowMenu({ items, width = 190 }: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  /* ----------------------------------------
   * Calculate position (UP / DOWN)
   * -------------------------------------- */
  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 240;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 8;

    setPos({
      top: openUpward
        ? rect.top - menuHeight - 6
        : rect.bottom + 6,
      left: rect.right - width,
    });
  }, [open, width]);

  /* ----------------------------------------
   * Close on outside click
   * -------------------------------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ----------------------------------------
   * Filter visible items
   * -------------------------------------- */
  const visibleItems = items.filter(i => i.show !== false);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(v => !v)}
        title="More actions"
        className="p-1 rounded hover:bg-gray-100"
      >
        <EllipsisVertical size={18} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              width,
            }}
            className="rounded-md border bg-white shadow-lg"
          >
            {visibleItems.map(item => (
              <button
                key={item.key}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2 text-sm
                  hover:bg-gray-100 text-left
                  ${item.danger ? "text-red-600" : ""}
                  ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
