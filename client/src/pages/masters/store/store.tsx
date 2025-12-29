// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { EditOrganization, fetchStoresList, SaveOrganizations, UpdateStoreStatus } from "@/lib/api";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { franchiseTableMockData, organizationMockData } from "@/lib/mockData";
import { organizationFormType, storeFormApi } from "@/lib/types";
import { useLocation } from "wouter";

export default function Store() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { roles } = useAuth();
  const [stores, setStores] = useState<Array<storeFormApi>>([]);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)

  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const PER_PAGE = 10;
  const [filters, setFilters] = useState({

    status: ""
  });

  const columns = useMemo(() => [
    {
      key: "created_at", label: "Created On", align: "center", width: "100px", render: (_value: any,) => {

        return (
          <Box className="flex flex-col justify-center items-center">
            <span className="font-bold  ">
              {formatDate(_value)}
            </span>
            <span className="text-sm font-medium  text-gray-700">
              {formatTime(_value)}
            </span></Box>
        );
      },
    },
    {
      key: "name",
      label: "Store name",
      width: "250px",

    },
    {
      key: "email", label: "Email", width: "150px",

    },
    {
      key: "phone", label: "Phone", width: "150px",

    },
    {
      key: "territory_id", label: "Territory", width: "150px",
    },
    {
      key: "organization", label: "Organization", width: "150px",
    },

    {
      key: "opening_date", label: "Opening date",  align: "center", width: "150px",
       render: (_value: any,) => {

        return (
          <Box className="flex flex-col justify-center items-center">
            <span className="font-bold  ">
              {formatDate(_value)}
            </span>
          </Box>
        );
      },
    },
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
          options={[
            { label: 'All', value: '' },
            { label: "Active", value: 1 },
            { label: "Inactive", value: 0 },
          ]}
        />
      ),
      width: "120px",
      render: (value: string, _row: any,) => {
        const isActive = value;

        return (
          <Switch.Root checked={isActive}
            onCheckedChange={() => StoreStatusUpdateHandler(_row)}
            size="sm">
            <Switch.HiddenInput />
            <Switch.Control
              bg="#ffa9a9"          // unchecked color
              _checked={{
                bg: "#22c55e",     // checked color
              }}
            />
          </Switch.Root>

        );
      },
    },

  ], [roles, page, PER_PAGE, filters,]);

  const StoreStatusUpdateHandler = useCallback(async (u: any) => {
    try {
      const newStatus = u.status ? 0 : 1;

      setStores(prevUsers => {

        return prevUsers.map(item =>
          item.id === u.id
            ? {
              ...item,
              status: newStatus,
            }
            : item
        );
      });

      await UpdateStoreStatus({ id: u.id, });

      toast({
        title: "Status Update",
        description: "Store status updated successfully",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          "Failed to update store status",
        variant: "destructive",
      });
    }
  }, []);

  const fetchStores = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res =
        await fetchStoresList({
          per_page: perPage,
          page,
          search,
          status: filters.status,
        });

      const mappedStores = res.data.map((item: any) => ({
        ...item,
        territory_id: item?.territory?.name,
        organization: item?.organization?.company_name,
      }))
      setHasNext(res.meta.has_next)
      setTotal(res.meta.total)
      setStores(mappedStores);
      setLastPage(res.meta.last_page);
    } catch (e) {
      console.error(e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(false);
  }, [search, page, filters, perPage]);

  function resetFilter() {
    setSearch('')
    setPage(1)
    setFilters({
      status: ""
    })
  }
  return (
    <Card className="w-full">
      <CardContent>
        <CommonTable
          columns={columns}
          data={stores}
          isAdd={true}
          isClear={true}
          perPage={perPage}
          setPerPage={setPerPage}
          resetFilter={resetFilter}
          isLoading={isListLoading}
          total={total}
          hasNext={has_next}
          tabType=""
          tabDisplayName="Store"
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
            navigate(`/master/stores/manage`)

          }
          }
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
                        navigate(`/master/stores/manage?id=${row.id}&mode=view`)
                      }
                    >
                      <EyeIcon />
                    </IconButton>
                    {Number(row.role_id) !== roles.find((role) => role.slug === "super-admin").id && <IconButton
                      size="xs"
                      mr={2}
                      aria-label="Edit"
                      onClick={() =>
                        navigate(`/master/stores/manage?id=${row.id}&mode=edit`)
                      }
                    >
                      <EditIcon />
                    </IconButton>}


                  </Box>
                )}
              </>
            );
          }}

        />

      </CardContent>
    </Card>
  );
}
