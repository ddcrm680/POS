// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteTerritory, DeleteUser, EditUser, fetchUserList, SaveUser, UpdateTerritoryStatus } from "@/lib/api";
import { TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon, Trash2 } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import TerritoryMasterForm from "./JobCardForm";
import { customerMockData, territoryMasterMockData } from "@/lib/mockData";

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

      // await DeleteCustomer(isCustomerDeleteModalInfo?.info?.id);
      // toast({ title: `Delete JobCard`, description: "JobCard deleted successfully", variant: "success", });

      fetchJobCard(false)

    } catch (err: any) {

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message || `Failed to delete territory`,
        variant: "destructive",
      });
    } finally {
      setIsJobCardDeleteModalOpenInfo({ open: false, info: {} });
      setIsLoading(false);
    }
  };
const columns = useMemo(() => [
  /* ================= CREATED ON ================= */
  {
    key: "created_at",
    label: " Created On",
    align: "center",
    width: "140px",
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

  /* ================= NAME ================= */
  {
    key: "name",
    label: "Name",
    width: "150px",
  },

  /* ================= MOBILE ================= */
  {
    key: "mobile_no",
    label: "Mobile No.",
    width: "150px",
   
  },

  /* ================= VEHICLE TYPE ================= */
  {
    key: "vehicle_type",
    label: "Vehicle Type",
    width: "160px",
    render: (value: string) => (
      <span className="text-sm text-gray-700">
        {value || "-"}
      </span>
    ),
  },

  /* ================= INTERESTED IN ================= */
  {
    key: "interested_in",
    label: "Interested In",
    width: "160px",
    render: (value: string) => (
      <span className="text-sm text-gray-700 capitalize">
        {value || "-"}
      </span>
    ),
  },

  /* ================= SOURCE ================= */
  {
    key: "source",
    label: "Source",
    width: "150px",
    render: (value: string) => (
      <span className="text-sm text-gray-700">
        {value || "-"}
      </span>
    ),
  },

  /* ================= ADDRESS ================= */
  // {
  //   key: "address",
  //   label: "Address",
  //   width: "240px",
  //   render: (value: string) => (
  //     <span
  //       className="text-sm text-gray-700 cursor-help"
  //       title={value}
  //     >
  //       {value || "-"}
  //     </span>
  //   ),
  // },

 
], []);

  const fetchJobCard = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res ={
        data:customerMockData}
        // await fetchCustomerList({
        //   per_page: perPage,
        //   page,
        //   search,
        //   status: filters.status
        // });

      const mappedTerritory = res.data
      // setHasNext(res.meta.has_next)
      // setTotal(res.meta.total)
      setJobCards(mappedTerritory);
      // setLastPage(res.meta.last_page);
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
      status: ""
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
            setIsModalOpen={(value: boolean) => {    navigate(`/jobCard/manage`)
}}
            actions={(row: any) => {
              return (
                <>

                  {(
                    <Box className="gap-3">
                       <IconButton
                      size="xs"
                      mr={2}
                      aria-label="View"
                      onClick={() =>
                       {}
                      }
                    >
                      <EyeIcon />
                    </IconButton>
                      {Number(row.role_id) !== roles.find((role) => role.slug === "super-admin").id && <IconButton
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
                        Number(row.role_id) !== roles.find((role) => role.slug === "super-admin").id && !row.store &&
                        <IconButton
                          size="xs"
                          mr={2}
                          colorScheme="red"
                          aria-label="Delete"
                          onClick={() => {
                            setIsJobCardDeleteModalOpenInfo({ open: true, info: row });
                          }}
                        >
                          <Trash2 size={16} />
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
            title="Delete JobCard"
            description={`Are you sure you want to delete this job card? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
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
