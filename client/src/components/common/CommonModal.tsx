"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { IconButton } from "@chakra-ui/react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect } from "react";

export default function CommonModal({
  isOpen,
  onClose,
  isLoading = false,
  title = "Modal Title",
  width,
  maxWidth,
  children,
  showCloseIcon = true,
}: any) {
  useEffect(() => {
    const handleUnauthorized = () => {
      onClose();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [onClose]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => {
      if (!open && isLoading) return;
      if (!open) onClose();
    }}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9999]" />

        {/* Content */}
        <Dialog.Content
         className="
  fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
  w-[calc(100%-2rem)]

  rounded-lg bg-white shadow-xl z-[10000]
"   style={{
            width: width ?? "80%",
            maxWidth: maxWidth ?? "80%",
          }}>

          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-4">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

            {showCloseIcon && (
              <Dialog.Close asChild className="text-right flex justify-end h-auto">
                <IconButton aria-label="Close" size="sm" variant="ghost" disabled={isLoading}>
                  <X size={18} />
                </IconButton>
              </Dialog.Close>
            )}
          </div>

          {/* Body */}
          <div className="">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
