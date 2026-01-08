"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Table } from "@chakra-ui/react";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Loader } from "./loader";
import CommonModal from "./CommonModal";
import { vehicleCardItem, vehicleType } from "@/lib/types";
import { VehicleCardInfo } from "@/pages/masters/vehicleMaster/vehicleCardInfo";

export default function CommonTable({
  columns,
  data,
  actions,
  total,
  isLoading,
  setIsModalOpen, CardComponent,
  hasNext,
  tabDisplayName,
  tabType,
  setIsUserModalOpenInfo,
  searchable = true,
  isTotal=true,
  lastPage,
  setPage,
  isAdd = false,
  isClear = false,
  onRowClick,
  page,
  resetFilter,
  searchValue = "",
  perPage = 2,
  setPerPage,
  isCard = false,
  perPageOptions = [10, 25, 50, 100],
  onSearch,
  className = "",
  debounceDelay = 300,
  filtersSlot = null
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
  const renderCardView = () => {
    if (isLoading) {
      return (
        <div className="py-10 text-center text-gray-500">
          <Loader />
        </div>
      );
    }

    if (!isLoading && data.length === 0) {
      return (
        <div className="py-10 text-center text-gray-500">
          No data found
        </div>
      );
    }

    if (!CardComponent) return null;

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((item: any, idx: number) => (
          <CardComponent
            key={item.id ?? idx}
            item={item}
            isInModal={false}
            setIsUserModalOpenInfo={(value: boolean) => setIsUserModalOpenInfo({ open: value, info: item })}
          />
        ))}
      </div>
    );
  };


  return (
    <div className={`w-full space-y-4 pt-4 ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
         <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2
             text-gray-400 w-4 h-4
             z-10 pointer-events-none"
            />

            <Input
              placeholder={`${tabType ? "Search..." : `Search ${tabType}...`}`}
              value={localSearch}
              onChange={(e) => {
                hasUserTyped.current = true;   // 👈 user action
                setLocalSearch(e.target.value);
              }}
     className="
  pl-9 h-9 text-sm
  bg-white
  border border-gray-300
  rounded-md

  focus-visible:outline-none
  focus-visible:ring-0
  focus-visible:ring-offset-0
  focus-visible:border-gray-400

  hover:border-gray-400
  transition-colors
"
            />
          </div>
          <Box className="flex flex-col md:flex-row gap-2 ">
            {filtersSlot}
            <Box className="flex gap-3">
              {isClear && <Button
                variant="outline"
                className={'hover:bg-[#E3EDF6] hover:text-[#000]'}
                onClick={() => { resetFilter() }}
              >
                {'Clear Filter'}
              </Button>}
              {isAdd && <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] flex gap-2"
              >
                <Plus className="h-4 w-4" />
                Add {tabDisplayName || "Item"}
              </Button>}
            </Box>
          </Box>
        </div>
      )}

      {/* Table */}
      {isCard ? (
        renderCardView()
      ) : (<div className="relative overflow-x-auto rounded-lg border">
        <Table.Root size="sm" className="min-w-[900px]" >
         <Table.Header className="sticky top-0 z-20 bg-gray-50 backdrop-blur border-b">
            <Table.Row className="!bg-gray-100 border-b border-gray-200">
              {columns.map((col: any) => (
                <Table.ColumnHeader
                  key={col.key}
                  textAlign={col.align || "start"}
                  width={col.width}
                 className="
  !py-2 !px-3
  text-xs font-semibold uppercase tracking-wide
  text-gray-600
"
                >
                  {col.label}
                </Table.ColumnHeader>
              ))}

              {actions && (
               <Table.ColumnHeader
  width="160px"
  className="sticky right-0 z-30 bg-inherit text-xs font-semibold    text-gray-600 uppercase"
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
                  <Loader />
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
                  onClick={() => onRowClick?.(row, rowIndex)}
                 className="
  group
  transition-colors
  border-b border-gray-100
  hover:bg-blue-50/40
  focus-within:bg-blue-50/60
"
                >
                  {columns.map((col: any) => (
                    <Table.Cell
                      key={col.key}
                      textAlign={col.align || "start"}
                      width={col.width}
                    className="!py-2 !px-3 text-[13px] text-gray-700 leading-snug"
                    >
                      {col.render
                        ? col.render(row[col.key], row, rowIndex)
                        : row[col.key]}
                    </Table.Cell>
                  ))}

                  {actions && (
                    <Table.Cell  width="100px"
    className="sticky right-0 z-10 bg-inherit"
>
                      {actions(row)}
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}

          </Table.Body>
        </Table.Root>
      </div>)}

      {/* Pagination */}
      { (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
{
  (total > perPageOptions[0] || lastPage > 1) && <>  {setPerPage && total > perPageOptions[0] && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                {perPageOptions.map((size: number) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pagination buttons */}
          {/* {lastPage > 1 && ( */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              disabled={page === 1}
              className="py-1 h-[27.2px] rounded"
              onClick={() => setPage((p: number) => p - 1)}
            >
      Prev
    </Button>

            <span className="text-sm">
              <strong>{page}</strong> of <strong>{lastPage}</strong>
            </span>

            <Button
              variant="outline"  className="py-1 h-[27.2px] rounded"
              disabled={!hasNext || page === lastPage}
              onClick={() => setPage((p: number) => p + 1)}
            >
      Next
    </Button>
             
</div></>
}
          {/* Per Page selector */}
        
       {isTotal &&   <span className="text-sm text-gray-600">
            Total : <strong>{total}</strong>
          </span>}
          {/* )} */}

        </div>
      )}
      
    </div>
  );
}
