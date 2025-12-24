// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { EditServicePlan, fetchServiceLogList, fetchServicePlanMetaInfo, SaveServicePlan, UpdateServicePlanStatus } from "@/lib/api";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { formatDate, formatTime } from "@/lib/utils";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { categoryType, planName, servicePlanMockResponse, vehicleType } from "@/lib/mockData";
import SystemLogForm from "./systemLogForm";
import { serviceFormType, serviceMetaInfoType, UserFormType } from "@/lib/types";

export default function SystemLog() {
  const { toast } = useToast();
  const [serviceMetaInfo, setServiceMetaInfo] = useState<serviceMetaInfoType>({
    categoryTypes: [],
    numberOfVisits: [],
    servicePlans: [],
    vehicleTypes: [],
    warrantyPeriods: []

  })
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
    { key: "action", label: "Action", width: "150px" },
    // { key: "description", label: "Description", width: "150px" },
    { key: "ip_address", label: "IP Address", width: "150px" },
    {
      key: "platform", label: (
        <ColumnFilter
          label="Platform"
          value={filters.platform}
          onChange={(val) => {
            setFilters(f => ({ ...f, category_type: val }));
            setPage(1);
          }}
          options={[{ label: 'All', value: '' }, ...serviceMetaInfo.categoryTypes].map(r => ({
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
            setFilters(f => ({ ...f, vehicle_type: val }));
            setPage(1);
          }}
          options={[{ label: 'All', value: '' }, ...serviceMetaInfo.vehicleTypes].map(r => ({
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
          label="Device Type"
          value={filters.device_type}
          onChange={(val) => {
            setFilters(f => ({ ...f, plan_name: val }));
            setPage(1);
          }}
          options={[{ label: 'All', value: '' }, ...serviceMetaInfo.servicePlans].map(r => ({
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
        console.log(_value, 'valuesss');

        return (
          <span className="text-sm font-medium text-gray-700">
            {row?.actor?.name ?? ""}
          </span>
        );
      }
    },


  ], [roles, page, PER_PAGE, filters, serviceMetaInfo]);

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
        });

      const mappedUsers = res.data
      console.log(mappedUsers, 'mappedUsers');

      setHasNext(res.meta.has_next)
      setTotal(res.meta.total)
      setUsers(mappedUsers);
      setLastPage(res.meta.last_page);
    } catch (e) {
      console.error(e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemLog(false);
  }, [search, page, filters, perPage]);
  //    async function getServiceMetaInfo() {
  //     const res = await fetchServicePlanMetaInfo()
  //     setServiceMetaInfo(res)
  //   }
  // useEffect(() => {

  //   getServiceMetaInfo()
  // }, [])
  function resetFilter() {
    setSearch('')
    setPage(1)
    setFilters({
      browser: "",
      platform: "",
      device_type: "",
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
          onRowClick={(row: any) => {
            setIsServicePlanModalOpenInfo({
              open: true,
              type: "view",
              info:row
            })
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
      </CardContent>
    </Card>
  );
}
