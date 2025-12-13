"use client";

import { useMemo, useState } from "react";
import { Input, Table } from "@chakra-ui/react";
import { Search } from "lucide-react";

export default function CommonTable({
  columns,
  data,
  actions,
  tabType,
  searchable = true,
  className = "",
}: any) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // 🔍 Search across all fields
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;

    return data.filter((row: any) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);
  const paginatedData = filteredData.slice(0, pageSize);

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="flex justify-end">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-inventory"
            />
          </div>

        </div>
      )}

      {/* Table Wrapper */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <Table.Root size="sm" striped className="bg-white">
          {/* ------ Header ------ */}
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
                  className="!py-3 !px-4 text-sm font-semibold text-gray-700 text-end"
                >
                  Actions
                </Table.ColumnHeader>
              )}
            </Table.Row>
          </Table.Header>

          {/* ------ Body ------ */}
          <Table.Body>
            {filteredData.length === 0 && (
              <Table.Row>
                <Table.Cell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="py-6 text-center text-gray-500"
                >
                  No results found
                </Table.Cell>
              </Table.Row>
            )}

            {paginatedData.map((row: any) => (
              <Table.Row
                key={row.id}
                className="
                  transition-all 
                  hover:bg-gray-50 cursor-pointer
                  border-b border-gray-100
                "
              >
                {columns.map((col: any) => (
                  <Table.Cell
                    key={col.key}
                    textAlign={col.align || "start"}
                    width={col.width}
                    className="!py-3 !px-4 text-sm text-gray-700"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </Table.Cell>
                ))}

                {actions && (
                  <Table.Cell
                    width="120px"
                    className="!py-3 !px-4 text-end"
                  >
                    {actions(row)}
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
