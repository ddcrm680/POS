"use client";

import { Button } from "@/components/ui/button";
import CommonModal from "@/components/common/CommonModal";
import { CommonDeleteModalProps } from "@/lib/types";
import { useEffect } from "react";

export default function CommonDeleteModal({
  isOpen,
  width,
  title = "Delete",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  maxWidth,
  onConfirm,
  onCancel,
}: CommonDeleteModalProps) {
  useEffect(() => {
      const handleUnauthorized = () => {
        onCancel();
      };
  
      window.addEventListener("auth:unauthorized", handleUnauthorized);
  
      return () => {
        window.removeEventListener("auth:unauthorized", handleUnauthorized);
      };
    }, [onCancel]);
  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onCancel}
      maxWidth={maxWidth}
      width
      title={title}
      isLoading={isLoading}
      primaryText={confirmText}
      cancelTextClass="hover:bg-[#E3EDF6] hover:text-[#000]"
      primaryColor="bg-red-600 hover:bg-red-700"
    >
      <div className="space-y-6 ">
        <p className="text-sm text-gray-600 px-5 py-4">
          {description}
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t px-5 py-4 !mt-0">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
         {isLoading && <svg
                className="h-6 w-6 animate-spin text-[#fff]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>}   {isLoading ? "Deleting..." : confirmText}
          </Button>
        </div>
      </div>
    </CommonModal>
  );
}
