"use client";

import { useEffect, useRef, useState } from "react";
import { Table } from "@chakra-ui/react";
import { Plus, Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function CommonTable({
  columns,
  data,
  actions,
  isLoading,
  setIsModalOpen,
  tabDisplayName,
  tabType,
  searchable = true,
  lastPage,
  setPage,
  page,
  searchValue = "",
  onSearch,
  className = "",
  debounceDelay = 300, // 👈 default 3 ms
}: any) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  // 🔁 Keep local state in sync if parent changes search
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // ⏳ Debounce logic
useEffect(() => {
  if (!hasUserTyped.current) return;

  const timer = setTimeout(() => {
    onSearch?.(localSearch);

    // ✅ RESET after firing search
    hasUserTyped.current = false;
  }, debounceDelay);

  return () => clearTimeout(timer);
}, [localSearch, debounceDelay, onSearch]);

  const hasUserTyped = useRef(false);
  return (
    <div className={`w-full space-y-4 pt-6 ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="flex justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2
             text-gray-400 w-4 h-4
             z-10 pointer-events-none"
            />

            <Input
              placeholder={`Search ${tabType}...`}
              value={localSearch}
              onChange={(e) => {
                hasUserTyped.current = true;   // 👈 user action
                setLocalSearch(e.target.value);
              }}
              className="pl-10"
            />
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] flex gap-2"
          >
            <Plus className="h-4 w-4" />
            Add {tabDisplayName || "Item"}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table.Root size="sm" striped>
          <Table.Header>
            <Table.Row className="!bg-gray-100 border-b border-gray-200">
              {columns.map((col: any) => (
                <Table.ColumnHeader
                  key={col.key}
                  textAlign={col.align || "start"}
                  width={col.width}
                  className="!py-3 !px-4 text-sm font-semibold text-gray-700"
                >
                  {col.label}
                </Table.ColumnHeader>
              ))}

              {actions && (
                <Table.ColumnHeader
                  width="120px"
                  className="!py-3 !px-4 text-sm font-semibold text-gray-700 "
                >
                  Actions
                </Table.ColumnHeader>
              )}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {isLoading && (
              <Table.Row>
                <Table.Cell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="py-10 text-center"
                >
                  <div className="flex items-center justify-center gap-3 text-gray-500">
                    <svg
                      className="h-5 w-5 animate-spin"
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
                    </svg>
                    <span className="text-sm">Loading...</span>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}


            {!isLoading && data.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1} className="text-center py-6">
                  No data found
                </Table.Cell>
              </Table.Row>
            )}

            {!isLoading &&
              data.map((row: any, rowIndex: number) => (
                <Table.Row
                  key={row.id ?? rowIndex}
                  className="transition-all hover:bg-gray-50 border-b border-gray-100"
                >
                  {columns.map((col: any) => (
                    <Table.Cell
                      key={col.key}
                      textAlign={col.align || "start"}
                      width={col.width}
                      className="!py-3 !px-4 text-sm text-gray-700"
                    >
                      {col.render
                        ? col.render(row[col.key], row, rowIndex)
                        : row[col.key]}
                    </Table.Cell>
                  ))}

                  {actions && (
                    <Table.Cell width="120px" className="!py-3 !px-4">
                      {actions(row)}
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}

          </Table.Body>
        </Table.Root>
      </div>
      {lastPage > 1 && (
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p: number) => p - 1)}
          >
            Prev
          </Button>

          <span className="text-sm">
            Page <strong>{page}</strong> of <strong>{lastPage}</strong>
          </span>

          <Button
            variant="outline"
            disabled={page === lastPage}
            onClick={() => setPage((p: number) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
