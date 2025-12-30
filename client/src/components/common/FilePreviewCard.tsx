"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isPdfUrl } from "@/lib/utils";
import { FileLightbox } from "@/components/common/FileLightbox";

type FilePreviewCardProps = {
  label?: string;
  src?: string | null;
  height?: string;
};

export function FilePreviewCard({
  label,
  src,
  height = "h-32",
}: FilePreviewCardProps) {
  const [open, setOpen] = useState(false);

  if (!src) {
    return (
      <div className="space-y-2 text-sm">
        {label && <p className="text-gray-500">{label}</p>}
        <div className={`${height} rounded-lg border bg-gray-50 flex items-center justify-center`}>
          <span className="text-xs text-gray-400">No document</span>
        </div>
      </div>
    );
  }

  const isPdf = isPdfUrl(src);

  return (
    <>
      <div className="space-y-2 text-sm">
        {label && <p className="text-gray-500">{label}</p>}

        <div className={`relative ${height} rounded-lg border bg-gray-50 overflow-hidden group`}>
          {/* PREVIEW */}
          {isPdf ? (
            <iframe
              src={src}
              className="w-full h-full pointer-events-none"
            />
          ) : (
            <img
              src={src}
              className="w-full h-full object-contain pointer-events-none"
            />
          )}

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition" />

          {/* VIEW BUTTON */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition">
            <Button
              type="button"
              onClick={() => setOpen(true)}
              className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] text-white px-6 py-2 text-sm font-semibold shadow-lg"
            >
              View
            </Button>
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      <FileLightbox
        open={open}
        src={src}
        isPdf={isPdf}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
