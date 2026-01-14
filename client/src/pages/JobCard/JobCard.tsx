// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteTerritory, DeleteUser, EditUser, fetchUserList, getJobCard, jobCardCancel, SaveUser, UpdateTerritoryStatus } from "@/lib/api";
import { TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Badge, Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon, PrinterIcon, Trash2, XCircle } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { customerMockData, jobCardMockData, territoryMasterMockData } from "@/lib/mockData";
import { jobCardStatusList } from "@/lib/constant";

export default function JobCard() {
  const { toast } = useToast();
  const { roles } = useAuth();
  const [jobCards, setJobCards] = useState<Array<any>>([]);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState({
    status: "",
    consumer_id: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isJobCardDeleteModalInfo, setIsJobCardDeleteModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });
  const PER_PAGE = 10;
  const JobCardDeleteHandler = async () => {
    try {
      setIsLoading(true);

      await jobCardCancel(isJobCardDeleteModalInfo?.info?.id);
      toast({ title: `Delete Job Card`, description: "Job Card deleted successfully", variant: "success", });

      fetchJobCard(false)

    } catch (err: any) {

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message || `Failed to delete jobcard`,
        variant: "destructive",
      });
    } finally {
      setIsJobCardDeleteModalOpenInfo({ open: false, info: {} });
      setIsLoading(false);
    }
  };
  const [filterMetaInfo, setFilterMetaInfo] = useState<{ status:{ value: string, label: string }[] }>({
    status: []
  });
  const columns = [
    /* ================= CREATED AT ================= */
    {
      key: "created_at",
      label: "Created On",
      align: "center",
      width: "170px",
      render: (value: string) => (
        <Box className="flex flex-col items-center">
          <span className="font-bold">{formatDate(value)}</span>
          <span className="text-sm text-gray-700">
            {formatTime(value)}
          </span>
        </Box>
      ),
    },

    /* ================= JOB CARD NO ================= */
    {
      key: "job_card_number",
      label: "JC No.",
      width: "110px",
      render: (value: string, row: any) => (
        <span
          className="text-[blue] font-medium cursor-pointer hover:underline"
          onClick={() => navigate(`/jobCard/manage?id=${row.id}&mode=view`)}
        >
          {value}
        </span>
      ),
    },

    /* ================= CUSTOMER ================= */
    {
      key: "consumer",
      label: "Customer",
      width: "180px",
      render: (_: any, row: any) => (
        <div className="flex flex-col" >
          <span className="text-[blue] font-medium cursor-pointer hover:underline" onClick={() => {
            localStorage.setItem("sidebar_active_parent", "customers")

            navigate(`/customers/manage?id=${row.consumer_id}&mode=view`)
          }
          }
          >
            {row.consumer?.name ?? "-"}
          </span>

        </div>
      ),
    },

    /* ================= SERVICE DATE ================= */
    {
      key: "jobcard_date",
      label: "Service Date",
      width: "140px",
      render: (value: string) => (
        <span className="text-sm">
          {formatDate(value)}
        </span>
      ),
    },

    /* ================= VEHICLE TYPE ================= */
    {
      key: "vehicle_type",
      label: "Vehicle Type",
      width: "120px",
    },

    /* ================= REG NO ================= */
    {
      key: "reg_no",
      label: "Reg No.",
      width: "140px",
    },

    /* ================= STORE ================= */
    {
      key: "store",
      label: "Store",
      width: "150px",
      render: (_: any, row: any) => (
        <span className="text-sm">
          {row.store?.name ?? "-"}
        </span>
      ),
    },

    /* ================= STATUS ================= */
    {
      key: "status",
      label: (
        <ColumnFilter
          label="Status"
          value={filters.status}
          onChange={(val) => {
            setFilters(f => ({ ...f, status: val }));
            setPage(1);
          }}
          options={[{ label: 'All', value: '' },...filterMetaInfo.status]}
        />
      ),
      width: "110px",
      render: (value: string) => (
        <Badge
         className={`px-3 py-1 text-xs font-medium rounded-full
  ${
    value === "created"
      ? "bg-blue-100 text-blue-700"
      : value === "completed"
      ? "bg-green-100 text-green-700"
      : value === "invoiced"
      ? "bg-purple-100 text-purple-700"
      : value === "cancelled"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700"
  }
`}

        >
            {filterMetaInfo.status.find((item:any) => item.value === value)?.label}
        
        </Badge>
      ),
    },
    {
      key: "invoice_id",
      label: "Invoice No.",
      width: "150px",
      render: (value: any, row: any) => {
        if (value) {
          return (
            <span
              className="text-[blue] font-medium cursor-pointer hover:underline"
              onClick={() => navigate(`/invoice/manage?id=${row.invoice.id}&mode=view`)}
            >
              {value}
            </span>
          );
        }

        // CASE 2: No invoice → show action
        return (
          <button
            onClick={() => {
              navigate(`/invoice/manage?jobCardId=${row.id}&mode=create`)
            }}
            className="
          px-3 py-1 text-xs font-medium
          rounded-md border border-primary
          text-primary hover:bg-primary hover:text-white
          transition
        "
          >
            Create Invoice
          </button>
        );
      },
    }

  ];

  const fetchJobCard = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res =
        await getJobCard({
          per_page: perPage,
          page,
          search,
          status: filters.status,
          consumer: filters.consumer_id
        });

      const mappedTerritory = res.data.map((item: any) => ({ ...item, invoice_id: item?.invoice?.invoice_number ?? "" }))
      setHasNext(res.meta.has_next)
      setTotal(res.meta.total)
      setJobCards(mappedTerritory);
      setLastPage(res.meta.last_page);

      setFilterMetaInfo(res.meta.filters)
    } catch (e) {
      console.error(e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCard(false);
  }, [search, page, perPage, filters]);
  function resetFilter() {
    setSearch('')
    setPage(1)
    setFilters({
      status: "",
      consumer_id: ""
    })
  }
  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Job Card Management</h1>
            <p className="text-muted-foreground">Manage service workflow and track vehicles</p>
          </div>
        </div>
      </div>
      <Card className="w-full">
        <CardContent>
          <CommonTable
            columns={columns}
            isClear={true}
            data={jobCards}
            isAdd={true}
            perPage={perPage}
            setPerPage={setPerPage}
            resetFilter={resetFilter}
            isLoading={isListLoading}
            total={total}
            hasNext={has_next}
            tabType=""
            tabDisplayName="Job Card"
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
              navigate(`/jobCard/manage`)
            }}
            actions={(row: any) => {
              return (
                <>

                  {(
                    <Box className="gap-3">
                      <IconButton
                        size="xs"
                        mr={2}
                        disabled
                        aria-label="Print"
                        onClick={() => { }
                        }
                      >
                        <PrinterIcon />
                      </IconButton>
                      <IconButton
                        size="xs"
                        mr={2}
                        aria-label="View"
                        onClick={() => {

                          navigate(`/jobCard/manage?id=${row.id}&mode=view`)
                        }
                        }
                      >
                        <EyeIcon />
                      </IconButton>
                      {row.status !== 'cancelled' && <IconButton
                        size="xs"
                        mr={2}
                        aria-label="Edit"
                        onClick={() => {
                          navigate(`/jobCard/manage?id=${row.id}&mode=edit`)

                        }
                        }
                      >
                        <EditIcon />
                      </IconButton>}

                      {

                        row.status !== 'cancelled' && <IconButton
                          size="xs"
                          mr={2}
                          title="Cancel"
                          colorScheme="red"
                          aria-label="Cancel"
                          onClick={() => {
                            setIsJobCardDeleteModalOpenInfo({ open: true, info: row });
                          }}
                        >
                          <XCircle size={16} />
                        </IconButton>}

                    </Box>
                  )}
                </>
              );
            }}

          />
          <CommonDeleteModal
            width="420px"
            maxWidth="420px"
            isOpen={isJobCardDeleteModalInfo.open}
            title="Cancel Job Card"
            description={`Are you sure you want to cancel this job card? This action cannot be undone.`}
            confirmText="Yes, Cancel"
            cancelText="No"
            loadingText="Cancelling..."
            isLoading={isLoading}
            onCancel={() =>
              setIsJobCardDeleteModalOpenInfo({ open: false, info: {} })
            }
            onConfirm={JobCardDeleteHandler}
          />

        </CardContent>
      </Card>
    </div>

  );
}
