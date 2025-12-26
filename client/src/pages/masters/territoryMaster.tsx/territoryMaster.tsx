// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteUser, EditUser, fetchTerritoryMasterList, fetchUserList, SaveUser, UpdateTerritoryStatus, UpdateUserStatus } from "@/lib/api";
import { TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon, Trash2 } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import TerritoryMasterForm from "./territoryMasterForm";
import { territoryMasterMockData } from "@/lib/mockData";

export default function TerritoryMaster() {
  const { toast } = useToast();
  const { roles } = useAuth();
  const [users, setUsers] = useState<Array<any>>([]);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
  const [isTerritoryDeleteModalInfo, setIsTerritoryDeleteModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState({
    status: "",
  });

  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const PER_PAGE = 10;

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
      key: "name", label: "Territory", width: "150px",
      render: (_value: any,) => {

        return (
          <span
            className="text-sm font-medium text-gray-700 cursor-help"
          >
            {_value ?? "-"}
          </span>
        );
      }
    },
    {
      key: "store", label: "	Franchise", width: "150px",
      render: (_value: any,) => {

        return (
          <span
            className="text-sm font-medium text-gray-700 cursor-help"
          >
            {_value ?? "-"}
          </span>
        );
      }
    },
    { key: "country", label: "Country", width: "150px" },
    {
      key: "states", label: "State", width: "150px", render: (_value: any,) => {

        return (
          <span
            className="text-sm font-medium text-gray-700 cursor-help"
            title={formatAndTruncate(_value).fullText}
          >
            {formatAndTruncate(_value).displayText}
          </span>
        );
      }
    },
    {
      key: "cities", label: "City", width: "150px", render: (_value: any,) => {

        return (
          <span
            className="text-sm font-medium text-gray-700 cursor-help"
            title={formatAndTruncate(_value).fullText}
          >
            {formatAndTruncate(_value).displayText}
          </span>);
      }
    },
    {
      key: "is_active",
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
            { label: "Active", value: true },
            { label: "Inactive", value: false },
          ]}
        />
      ),
      width: "120px",
      render: (value: string, _row: any,) => {
        const isActive = value;

        return (
          <Switch.Root checked={isActive}
            onCheckedChange={(e: any) => TerritoryStatusUpdateHandler(_row)}
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

  ], [roles, page, PER_PAGE, filters]);
  const TerritoryStatusUpdateHandler = useCallback(async (u: any) => {
    try {
      const newStatus = u.is_active ? false : true;
      console.log(newStatus,u.is_active , 'newStatus');

      setUsers(prevUsers => {

        return prevUsers.map(item =>
          item.id === u.id
            ? {
              ...item,
              is_active: newStatus,
            }
            : item
        );
      });

      await UpdateTerritoryStatus({ id: u.id, });

      toast({
        title: "Status Update",
        description: "Territory status updated successfully",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          "Failed to update territory status",
        variant: "destructive",
      });
    }
  }, []);
  const TerritoryDeleteHandler = async () => {
    try {
      setIsLoading(true);

      await DeleteUser(isTerritoryDeleteModalInfo?.info?.id);
      toast({ title: `Delete User`, description: "User deleted successfully", variant: "success", });

      fetchTerritoryMaster(false)

    } catch (err: any) {

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message || `Failed to delete user`,
        variant: "destructive",
      });
    } finally {
      setIsTerritoryDeleteModalOpenInfo({ open: false, info: {} });
      setIsLoading(false);
    }
  };
  const fetchTerritoryMaster = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res =
        await fetchTerritoryMasterList({
          per_page: perPage,
          page,
          search,
        });

      const mappedTerritory = res.data
      setHasNext(res.meta.has_next)
      setTotal(res.meta.total)
      setUsers(mappedTerritory);
      setLastPage(res.meta.last_page);
    } catch (e) {
      console.error(e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchTerritoryMaster(false);
  }, [search, page, perPage, filters]);
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
          isClear={false}
          data={users}
          isAdd={true}
          perPage={perPage}
          setPerPage={setPerPage}
          resetFilter={resetFilter}
          isLoading={isListLoading}
          total={total}
          hasNext={has_next}
          tabType=""
          tabDisplayName="Territory"
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
          setIsModalOpen={(value: boolean) => { navigate(`/master/territory/manage`) }}
          actions={(row: any) => {
            return (
              <>

                {(
                  <Box className="gap-3">
                    {Number(row.role_id) !== roles.find((role) => role.slug === "super-admin").id && <IconButton
                      size="xs"
                      mr={2}
                      aria-label="Edit"
                      onClick={() => {
                        navigate(`/master/territory/manage?id=${row.id}&mode=edit`)

                      }
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
        <CommonDeleteModal
          width="420px"
          maxWidth="420px"
          isOpen={isTerritoryDeleteModalInfo.open}
          title="Delete Territory"
          description={`Are you sure you want to delete this territory? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={isLoading}
          onCancel={() =>
            setIsTerritoryDeleteModalOpenInfo({ open: false, info: {} })
          }
          onConfirm={TerritoryDeleteHandler}
        />

      </CardContent>
    </Card>
  );
}
