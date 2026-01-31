// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteTerritory, DeleteUser, EditUser, fetchUserList, getConsumer, ProductCountHelper, SaveUser, UpdateProductStatus, UpdateTerritoryStatus, UpdateUserStatus } from "@/lib/api";
import { ProductFormType, ProductModalInfo, TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Badge, Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon, Trash2 } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { brandOptions, categoryOptions, customerMockData, filterMetaInfo, mockProducts, productTypeOptions, storeOptions, territoryMasterMockData } from "@/lib/mockData";
import CommonRowMenu from "@/components/common/CommonRowMenu";
import { Kpi } from "../Customer/DashboardCards";
import ProductSellStockCountHandlerModal from "../Products/ProductSellStockCountHandlerModal";
import { appointmentMockData } from "@/lib/constant";

export default function NewAppointmentsPage() {
  const { toast } = useToast();

const [appointments, setAppointments] = useState(appointmentMockData);
  const { roles } = useAuth();
  const [productListingModalInfo, setProductListingModalInfo] = useState<ProductModalInfo>({
    open: false,
    info: {},
    type: "",
    subOpnType: ""
  });
  
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState({
    brand: "",
    category: "",
    type: "",
    store: "",
    tag: "",
    status: "",
    visibility: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isCustomerDeleteModalInfo, setIsCustomerDeleteModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });
  const PER_PAGE = 10;
  const CustomerDeleteHandler = async () => {
    try {
      setIsLoading(true);

      // await DeleteCustomer(isCustomerDeleteModalInfo?.info?.id);
      // toast({ title: `Delete Customer`, description: "Customer deleted successfully", variant: "success", });

      fetchCustomer(false)

    } catch (err: any) {

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message || `Failed to delete territory`,
        variant: "destructive",
      });
    } finally {
      setIsCustomerDeleteModalOpenInfo({ open: false, info: {} });
      setIsLoading(false);
    }
  };

const columns = useMemo(() => [
  {
    key: "created_at",
    label: "Created On",
    align: "center",
    width: "160px",
    render: (val: string) => (
      <Box className="flex flex-col items-center">
        <span className="font-semibold">{formatDate(val)}</span>
        <span className="text-sm text-gray-600">{formatTime(val)}</span>
      </Box>
    ),
  },

  {
    key: "title",
    label: "Title",
    width: "180px",
  },

  {
    key: "consumer",
    label: "Customer",
    width: "180px",
    render: (val: any) => (
      <div className="flex flex-col">
        <span className="font-medium">{val?.name}</span>
        <span className="text-xs text-gray-500">{val?.phone}</span>
      </div>
    ),
  },

  {
    key: "store",
    label: "Store",
    width: "150px",
    render: (val: any) => val?.name,
  },

  {
    key: "appointment_type",
    label: "Type",
    width: "120px",
    render: (val: string) => (
      <Badge className="capitalize">{val}</Badge>
    ),
  },

  {
    key: "priority",
    label: "Priority",
    width: "120px",
    render: (val: string) => (
      <Badge
        colorScheme={
          val === "critical"
            ? "red"
            : val === "urgent"
            ? "orange"
            : "gray"
        }
        className="capitalize"
      >
        {val}
      </Badge>
    ),
  },

  {
    key: "status",
    label: "Status",
    width: "120px",
    render: (val: string) => (
      <Badge
        colorScheme={
          val === "confirmed"
            ? "green"
            : val === "pending"
            ? "yellow"
            : "gray"
        }
        className="capitalize"
      >
        {val}
      </Badge>
    ),
  },

  {
    key: "scheduled_at",
    label: "Scheduled At",
    width: "170px",
    render: (val: string) => (
      <div className="flex flex-col">
        <span>{formatDate(val)}</span>
        <span className="text-xs text-gray-500">{formatTime(val)}</span>
      </div>
    ),
  },

  {
    key: "estimated_value",
    label: "Amount",
    width: "120px",
    align: "right",
    render: (val: number) => `₹${val?.toLocaleString()}`,
  },
], []);


  const fetchCustomer = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res =
        await getConsumer({
          per_page: perPage,
          page,
          search,
          status: filters.status
        });

      // const mappedTerritory = res.data
      // setHasNext(res.meta.has_next)
      // setTotal(res.meta.total)
      // setProducts(mappedTerritory);
      // setLastPage(res.meta.last_page);
    } catch (e) {
      console.error(e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer(false);
  }, [search, page, perPage, filters]);
  function resetFilter() {
    setSearch('')
    setPage(1)
    setFilters({
      brand: "",
      category: "",
      type: "",
      store: "",
      tag: "",
      status: "",
      visibility: "",
    })
  }
  return (
    <div className="p-3">
      <div className="mx-auto mb-3   space-y-6">
        <div className="flex items-center justify-between ">
          <div>
            <h1 className="text-lg font-semibold">Appointment Management</h1>
            <p className="text-muted-foreground text-sm">  Advanced appointment system with real-time communication</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 ">
          <>
            <Kpi
              label="Total"
              value={7}
              tone="info"
            />

            <Kpi
              label="Critical"
              value={1}
              tone="danger"
            />

            <Kpi
              label="Urgent"
              value={2}
              tone="danger"
            />

            <Kpi
              label="Confirmed"
              value={2}
              tone="success"
            />

            <Kpi
              label="Pending"
              value={4}
            />

            <Kpi
              label="Total Value"
              value="₹267K"
              tone="info"
            />
          </>

        </div>
      </div>
      <Card className="w-full">
        <CardContent>
          <CommonTable
            columns={columns}
            isClear={false}
            data={appointments}
            isAdd={true}
            perPage={perPage}
            setPerPage={setPerPage}
            resetFilter={resetFilter}
            isLoading={isListLoading}
            total={total}
            hasNext={has_next}
            tabType=""
            tabDisplayName="Appointments "
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
              sessionStorage.removeItem('sidebar_active_parent')
              navigate("/products/product-listing/manage")
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
                      sessionStorage.removeItem('sidebar_active_parent')
                      navigate(`/products/product-listing/view?id=${22}`)
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
         
          <CommonDeleteModal
            width="330px"
            maxWidth="330px"
            isOpen={isCustomerDeleteModalInfo.open}
            title="Delete Customer"
            description={`Are you sure you want to delete this customer? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            isLoading={isLoading}
            onCancel={() =>
              setIsCustomerDeleteModalOpenInfo({ open: false, info: {} })
            }
            onConfirm={CustomerDeleteHandler}
          />

        </CardContent>
      </Card>
    </div>

  );
}
