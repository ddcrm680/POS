// src/components/profile/profile.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton } from "@chakra-ui/react";
import { EyeIcon } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { transferProductsMockData } from "@/lib/mockData";
import { reusableComponentType } from "@/lib/types";
import { mapColumnsForCustomerView } from "@/lib/helper";

export default function TransferProducts({ noTitle = false, hideColumnListInCustomer = { list: [], actionShowedList: [] }, noPadding = false, apiLink = "" }: reusableComponentType) {
  const { toast } = useToast();
  const { roles } = useAuth();
const [transferProduct,setTransferProduct] = useState(transferProductsMockData);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState({
    status: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(true);

  const PER_PAGE = 10;

const columns = useMemo(() => [

  /* ================= DATE / CREATED BY ================= */
  {
    key: "created_at",
    label: "Created On",
    width: "180px",
    align:"center",
    render: (value: string, row: any) => (
        <Box className="flex flex-col justify-center items-center">
            <span className="font-bold  ">
              {formatDate(value)}
            </span>
            <span className="text-sm font-medium  text-gray-700">
              {formatTime(value)}
            </span></Box>
    ),
  },

  /* ================= FRANCHISE ================= */
  {
    key: "franchise",
    label: "Store",
    width: "180px",
    render: (val: string,row:any) => (
      <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={()=>{
              localStorage.removeItem('sidebar_active_parent')
              localStorage.setItem('sidebar_active_parent','stores')
              navigate(`/master/stores/manage?id=${row?.store_id}&mode=view`)
      }}>
        {val}
      </span>
    ),
  },

  /* ================= CONTACT ================= */
  {
    key: "phone",
    label: "Contact No.",
    width: "180px",
  },

  /* ================= TRANSFER ID ================= */
  {
    key: "transfer_id",
    label: "Transfer ID",
    width: "180px",
    render: (val: string,row:any) => (
      <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => {
                                            localStorage.removeItem('sidebar_active_parent')
              navigate(`/products/transfer-stock/view?id=${row.id}`)
                                        }}>
        {val}
      </span>
    ),
  },

  /* ================= QTY ================= */
  {
    key: "transferred_qty",
    label: "Transferred Qty",
    width: "180px",
    // align: "right",
  },

  /* ================= AMOUNT ================= */
  {
    key: "total_amount",
    label: "Total Amount",
    width: "180px",
    // align: "right",
    render: (val: number) => `₹ ${val.toFixed(2)}`,
  },
], []);



  const fetchTransferProduct = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      // const res =
      //   await getTransferProduct({
      //     per_page: perPage,
      //     page,
      //     search,
      //     status: filters.status
      //   });

      // const mappedTerritory = res.data
      // setHasNext(res.meta.has_next)
      // setTotal(res.meta.total)
      setTransferProduct(transferProductsMockData);
      // setLastPage(res.meta.last_page);
    } catch (e) {
      console.error(e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchTransferProduct(false);
  }, [search, page, perPage, filters]);
  function resetFilter() {
    setSearch('')
    setPage(1)
    setFilters({
      status: ""
    })
  }
  
    const resolvedColumns = useMemo(() => {
      const list = hideColumnListInCustomer?.list;
  
      // 🔓 No config → show all columns
      if (!Array.isArray(list) || list.length === 0) {
        return columns;
      }
  console.log(columns, list,'columns, list');
  
      return mapColumnsForCustomerView(columns, list);
    }, [columns, hideColumnListInCustomer]);

    useEffect(()=>{
      console.log(resolvedColumns,'resolvedColumns');
      
    })
  return (
    <div className="">
     
      <Card className="w-full">
        <CardContent>
          <CommonTable
            columns={resolvedColumns}
            isClear={false}
            data={transferProduct}
        
            isAdd={noTitle ? false : true}
            perPage={perPage}
            setPerPage={setPerPage}
            resetFilter={resetFilter}
            isLoading={isListLoading}
            total={total}
            hasNext={has_next}
            tabType=""
            tabDisplayName="Transfer Stock"
            page={page}
            setPage={setPage}
            lastPage={lastPage}
            searchValue={search}
            onSearch={(value: string) => {
              // if (value) {
              setSearch(value);
              setPage(1); // reset page on new search
              // }
            }}
            setIsModalOpen={(value: boolean) => {
              localStorage.removeItem('sidebar_active_parent')
              navigate(`/products/transfer-stock/manage`)
            }}
            actions={(row: any) => (
              <Box className="gap-0">
                                {row.status !== "cancelled" ? (
                                    <IconButton
                                        size="xs"
                                        // mr={2}
                                        title="View "

                                        aria-label="View"
                                        onClick={() => {
                                            localStorage.removeItem('sidebar_active_parent')
              navigate(`/products/transfer-stock/view?id=${row.id}`)
                                        }}
                                    >
                                        <EyeIcon size={16} />
                                    </IconButton>
                                ) : (
                                    "-"
                                )}
                            </Box>
            )}

          />

        </CardContent>
      </Card>
    </div>

  );
}
