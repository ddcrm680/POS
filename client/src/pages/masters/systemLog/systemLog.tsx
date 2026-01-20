// src/components/profile/profile.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { DeleteSystemLog, DeleteUser, fetchServiceLogList } from "@/lib/api";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton } from "@chakra-ui/react";
import { EyeIcon, Trash2 } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";

import { formatDate, formatTime } from "@/lib/utils";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import SystemLogForm from "./systemLogForm";
import { systemLogMetaInfoType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";

export default function SystemLog() {
  const [systemLogMetaInfo, setSystemLogMetaInfo] = useState<systemLogMetaInfoType>({
    action: [],
    browser: [],
    device_type: [],
    platform: [],
  })
  const [dateRange, setDateRange] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });
  const { toast } = useToast();
  const [isSystemLogDeleteModalInfo, setIsSystemLogDeleteModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });
  const { roles } = useAuth();
  const [users, setUsers] = useState<Array<any>>([]);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
  const [isServicePlanModalOpenInfo, setIsServicePlanModalOpenInfo] = useState<{ open: boolean, type: string, info: any }>({
    open: false,
    type: 'create',
    info: {}
  });
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const PER_PAGE = 10;
  const [filters, setFilters] = useState({
    browser: "",
    platform: "",
    device_type: "",
    action: ""
  });
  const SystemLogDeleteHandler = async () => {
    try {
      setIsLoading(true);

      await DeleteSystemLog(isSystemLogDeleteModalInfo?.info?.id);
      toast({ title: `Delete System log`, description: "System log deleted successfully", variant: "success", });

      fetchSystemLog(false)

    } catch (err: any) {

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message || `Failed to delete system log`,
        variant: "destructive",
      });
    } finally {
      setIsSystemLogDeleteModalOpenInfo({ open: false, info: {} });
      setIsLoading(false);
    }
  };
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
      key: "action", label: (
        <ColumnFilter
          label="Operation"
          value={filters.action}
          onChange={(val) => {
            setFilters(f => ({ ...f, action: val }));
            setPage(1);
          }}
          options={[{ label: 'All', value: '' }, ...systemLogMetaInfo.action].map(r => ({
            label: r.label,
            value: r.value,
          }))}
        />
      ), width: "150px", render: (_value: any,) => {

        return (
          <span className="text-sm font-medium text-gray-700">
            {_value.split('_').map((item: string) => item.substring(0, 1).toUpperCase() + item.substring(1)).join(' ')}   </span>
        );
      }
    },
    {
      key: "description", label: "Description", width: "150px",
      render: (_value: any,) => {
      
        return (
          <span
          >
            {_value}
          </span>);
      }
    },
    {
      key: "platform", label: (
        <ColumnFilter
          label="Platform"
          value={filters.platform}
          onChange={(val) => {
            setFilters(f => ({ ...f, platform: val }));
            setPage(1);
          }}
          options={[{ label: 'All', value: '' }, ...systemLogMetaInfo.platform].map(r => ({
            label: r.label,
            value: r.value,
          }))}
        />
      ), width: "150px",
      render: (_value: any,) => {

        return (
          <span className="text-sm font-medium text-gray-700">
            {_value}   </span>
        );
      }
    },
    {
      key: "browser", label: (
        <ColumnFilter
          label="Browser"
          value={filters.browser}
          onChange={(val) => {
            setFilters(f => ({ ...f, browser: val }));
            setPage(1);
          }}
          options={[{ label: 'All', value: '' }, ...systemLogMetaInfo.browser].map(r => ({
            label: r.label,
            value: r.value,
          }))}
        />
      ), width: "150px",
      render: (_value: any,) => {

        return (
          <span className="text-sm font-medium text-gray-700">
            {_value}
          </span>
        );
      }
    },
    {
      key: "device_type", label: (
        <ColumnFilter
          label="Device"
          value={filters.device_type}
          onChange={(val) => {
            setFilters(f => ({ ...f, device_type: val }));
            setPage(1);
          }}
          options={[{ label: 'All', value: '' }, ...systemLogMetaInfo.device_type].map(r => ({
            label: r.label,
            value: r.value,
          }))}
        />
      ), width: "150px",
      render: (_value: any,) => {

        return (
          <span className="text-sm font-medium text-gray-700">
            {_value}   </span>
        );
      }
    },
    {
      key: "done_by", label: "Done By", width: "150px", render: (_value: any, row: any) => {

        return (
          <span className="text-sm font-medium text-gray-700">
            {row?.actor?.name ?? ""}
          </span>
        );
      }
    },


  ], [roles, page, PER_PAGE, filters, systemLogMetaInfo]);

  const fetchSystemLog = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res =
        await fetchServiceLogList({
          per_page: perPage,
          page,
          search,
          browser: filters.browser,
          platform: filters.platform,
          device_type: filters.device_type,
          action: filters.action,
          from_date: dateRange?.startDate
            ? dateRange?.startDate.toISOString().slice(0, 10)
            : undefined,
          to_date: dateRange?.endDate
            ? dateRange?.endDate.toISOString().slice(0, 10)
            : undefined,
        });

      const mappedLogs = res.data

      setHasNext(res.meta.has_next)
      setTotal(res.meta.total)
      setUsers(mappedLogs);
      setLastPage(res.meta.last_page);
      setSystemLogMetaInfo(res.meta.filters)
    } catch (e) {
      console.error(e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemLog(false);
  }, [search, page, filters, perPage,]);

  function resetFilter() {
    setSearch('')
    setPage(1)
    setDateRange({
      startDate: null,
      endDate: null,
    })
    setFilters({
      browser: "",
      platform: "",
      device_type: "",
      action: ""
    })
  }

  return (
    <Card className="w-full">
      <CardContent>
        <CommonTable
          columns={columns}
          data={users}
          isAdd={false}
          isClear={true}
          perPage={perPage}
          setPerPage={setPerPage}
          resetFilter={resetFilter}
          isLoading={isListLoading}
          total={total}
          hasNext={has_next}
          filtersSlot={
            <div className="flex items-end gap-3 relative z-50">

              <div className="flex flex-col gap-1 relative z-[9999]">


                <Datepicker
                  placeholder="From date       -      To date"
                  value={dateRange}
                  onChange={(val) => {
                    setDateRange(val);
                    setPage(1);
                  }}
                  showShortcuts
                  popoverDirection="down"
                  containerClassName="relative z-[9999]"
                  inputClassName="
          w-[220px]
          border rounded-md
          py-2 px-3
          text-sm
          focus:ring-1 focus:ring-red-500
        "
                />
              </div>

              <Button
                onClick={() => fetchSystemLog()}
                className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] text-white"
              >
                Apply
              </Button>
            </div>
          }


          tabType=""
          tabDisplayName="Service Plan"
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
          setIsModalOpen={(value: boolean) =>
            setIsServicePlanModalOpenInfo({ open: value, type: "create", info: {} })
          }

          actions={(row: any) => {
            return (
              <>

                {(
                  <Box className="gap-3">
                    <IconButton
                      size="xs"
                      // mr={2}
                       title="View"
                      aria-label="View"
                      onClick={() =>
                        setIsServicePlanModalOpenInfo({
                          open: true,
                          type: "view",
                          info: row
                        })
                      }
                    >
                      <EyeIcon />
                    </IconButton>

 {
                      Number(row.role_id) !== roles.find((role) => role.slug === "super-admin").id &&
                      <IconButton
                        size="xs"
                        // mr={2}
                        colorScheme="red"
                         title="Delete"
                        aria-label="Delete"
                        onClick={() => {
                          setIsSystemLogDeleteModalOpenInfo({ open: true, info: row });
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
        <CommonModal
          isOpen={isServicePlanModalOpenInfo.open}
          onClose={() => setIsServicePlanModalOpenInfo({ open: false, type: 'create', info: {} })}
          title={isServicePlanModalOpenInfo.type === 'view' ? "View System Log" : isServicePlanModalOpenInfo.type === 'create' ? "Add System Log" : "Edit System Log"}
          isLoading={isLoading}
          primaryText={isServicePlanModalOpenInfo.type === 'create' ? "Add" : "Edit"}
          cancelTextClass='hover:bg-[#E3EDF6] hover:text-[#000]'
          primaryColor="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
        >
          <SystemLogForm
            initialValues={
              isServicePlanModalOpenInfo.type === "edit" ||
                isServicePlanModalOpenInfo.type === "view"
                ? isServicePlanModalOpenInfo.info
                : {}
            }
            mode={
              isServicePlanModalOpenInfo.type === "view"
                ? "view"
                : isServicePlanModalOpenInfo.type === "create"
                  ? "create"
                  : "edit"
            }
            onClose={() =>
              setIsServicePlanModalOpenInfo({ open: false, type: "create", info: {} })
            }
          />


        </CommonModal>
        <CommonDeleteModal
                  width="330px"
                  maxWidth="330px"
                  isOpen={isSystemLogDeleteModalInfo.open}
                  title="Delete System Log"
                  description={`Are you sure you want to delete this system log? This action cannot be undone.`}
                  confirmText="Delete"
                  cancelText="Cancel"
                  isLoading={isLoading}
                  onCancel={() =>
                    setIsSystemLogDeleteModalOpenInfo({ open: false, info: {} })
                  }
                  onConfirm={SystemLogDeleteHandler}
                />
      </CardContent>
    </Card>
  );
}
