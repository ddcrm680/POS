// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { EditServicePlan, fetchServicePlanList, fetchServicePlanMetaInfo, SaveServicePlan, UpdateServicePlanStatus } from "@/lib/api";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { formatDate, formatTime } from "@/lib/utils";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { categoryType, planName, servicePlanMockResponse, vehicleType } from "@/lib/mockData";
import ServiceForm from "./serviceForm";
import { serviceFormType, serviceMetaInfoType, UserFormType } from "@/lib/types";
import ServicePlanView from "./servicePlanView";

export default function Services() {
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
    vehicle_type: "",
    plan_name: "",
    category_type: "",
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
      key: "vehicle_type", label: (
        <ColumnFilter
          label="Vehicle Type"
          value={filters.vehicle_type}
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
      key: "plan_name", label: (
        <ColumnFilter
          label="Plan Name"
          value={filters.plan_name}
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
      key: "category_type", label: (
        <ColumnFilter
          label="Category Type"
          value={filters.category_type}
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
    // { key: "number_of_visits", label: "Visit", width: "150px" },
    // { key: "sac", label: "Sac", width: "150px" },
    {
      key: "price", label: "Price", width: "150px", render: (_value: any,) => {

        return (
          <span className="text-sm font-medium text-gray-700">
            ₹ {_value}
          </span>
        );
      }
    },
    {
      key: "gst", label: "Gst(%)", width: "150px",

    },


    {
      key: "duration", label: "Duration", width: "150px",
      render: (_value: any, row: any) => {

        return (
          <span className="text-sm font-medium text-gray-700">
            {row.warranty_period} {row.warranty_in}
          </span>
        );
      }
    },
    // {
    //   key: "description", label: "Description", width: "150px",
    //   render: (_value: any,) => {

    //     return (
    //       <span className="text-sm font-medium text-gray-700">
    //         * {_value}
    //       </span>
    //     );
    //   }
    // },
    // { key: "raw_materials", label: "	Raw Materials", width: "150px" },
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
            onCheckedChange={() => ServiceStatusUpdateHandler(_row)}
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

  ], [roles, page, PER_PAGE, filters,serviceMetaInfo]);

  const ServiceStatusUpdateHandler = useCallback(async (u: any) => {
    try {
      const newStatus = u.status ? 0 : 1;

      setUsers(prevUsers => {

        return prevUsers.map(item =>
          item.id === u.id
            ? {
              ...item,
              status: newStatus,
            }
            : item
        );
      });

      await UpdateServicePlanStatus({ id: u.id, status: newStatus });

      toast({
        title: "Status Update",
        description: "Service plan status updated successfully",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          "Failed to update service plan status",
        variant: "destructive",
      });
    }
  }, []);

  const ServiceCommonHandler = async (
    value: serviceFormType,
    setError: UseFormSetError<serviceFormType>
  ) => {

    try {
      setIsLoading(true);

      if (isServicePlanModalOpenInfo.type === "edit") {
        await EditServicePlan({
          info: {
            id: isServicePlanModalOpenInfo.info.id,
            vehicle_type: value.vehicle_type,
            plan_name: value.plan_name,
            category_type: value.category_type,
            invoice_name: value.invoice_name,
            price: value.price,
            number_of_visits: value.number_of_visits,
            sac: value.sac??"",
            gst: value.gst,
            warranty_period: value.warranty_period,
            warranty_in: value.warranty_in,
            description: value.description ??"",
            raw_materials: value.raw_materials
          },
        });

        toast({
          title: "Edit User",
          description: "Service plan updated successfully",
          variant: "success",
        });
      } else {
        await SaveServicePlan(value);

        toast({
          title: "Add Service Plan",
          description: "Service plan added successfully",
          variant: "success",
        });
      }

      setIsServicePlanModalOpenInfo({ open: false, type: "create", info: {} });
      fetchServicePlan(false);
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;


      // 👇 THIS IS THE KEY PART
      if (apiErrors && err?.response?.status === 422) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          setError(field as keyof serviceFormType, {
            type: "server",
            message: (messages as string[])[0],
          });
        });
        return;
      }
      if (err?.response?.status === 403) {

        setIsServicePlanModalOpenInfo({ open: false, type: "create", info: {} });
      }
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          `Failed to ${isServicePlanModalOpenInfo.type === "create" ? "add" : "update"
          } user`,
        variant: "destructive",
      });
    } finally {
      getServiceMetaInfo()
      setIsLoading(false);
    }
  };

  const fetchServicePlan = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res =
        await fetchServicePlanList({
          per_page: perPage,
          page,
          search,
          vehicle_category: filters.vehicle_type,
          plan_name: filters.plan_name,
          category_name: filters.category_type,
          status: filters.status,
        });

      const mappedUsers = res.data.map((item: any) => ({
        ...item, warranty_period: item.warranty_period.toString()
        , number_of_visits: item.number_of_visits.toString()
      }))
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
    fetchServicePlan(false);
  }, [search, page, filters, perPage]);
     async function getServiceMetaInfo() {
     try{
       const res = await fetchServicePlanMetaInfo()
      setServiceMetaInfo(res)
     }catch(e){
      console.error(e)
     }
    }
  useEffect(() => {
 
    getServiceMetaInfo()
  }, [])
  function resetFilter() {
    setSearch('')
    setPage(1)
    setFilters({
      vehicle_type: "",
      plan_name: "",
      category_type: "",
      status: ""
    })
  }
  return (
    <Card className="w-full">
      <CardContent>
        <CommonTable
          columns={columns}
          data={users}
          isAdd={true}
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
          actions={(row: any) => {
            return (
              <>

                {(
                  <Box className="gap-0">
                    <IconButton
                      size="xs"
                      mr={2}
                      aria-label="View"
                      onClick={() =>
                        setIsServicePlanModalOpenInfo({
                          open: true,
                          type: "view",
                          info: row,
                        })
                      }
                    >
                      <EyeIcon />
                    </IconButton>
                    {Number(row.role_id) !== roles.find((role) => role.slug === "super-admin").id && <IconButton
                      size="xs"
                      mr={2}
                      aria-label="Edit"
                      onClick={() =>
                        setIsServicePlanModalOpenInfo({
                          open: true,
                          type: "edit",
                          info: row,
                        })
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
        <CommonModal
          isOpen={isServicePlanModalOpenInfo.open}
          onClose={() => setIsServicePlanModalOpenInfo({ open: false, type: 'create', info: {} })}
          title={isServicePlanModalOpenInfo.type === 'view' ? "View Service Plan" : isServicePlanModalOpenInfo.type === 'create' ? "Add Service Plan" : "Edit Service Plan"}
          isLoading={isLoading}
          primaryText={isServicePlanModalOpenInfo.type === 'create' ? "Add" : "Edit"}
          cancelTextClass='hover:bg-[#E3EDF6] hover:text-[#000]'
          primaryColor="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
        >
           {
            isServicePlanModalOpenInfo.type === 'view' ?
              <ServicePlanView
                info={isServicePlanModalOpenInfo.info}
              />
              : 
          <ServiceForm
            id="service-form"
            serviceMetaInfo={serviceMetaInfo}
            initialValues={
              isServicePlanModalOpenInfo.type === "edit" || isServicePlanModalOpenInfo.type === "view"
                ? isServicePlanModalOpenInfo.info
                : {}
            }
            isLoading={isLoading}
            mode={isServicePlanModalOpenInfo.type === 'view' ? "view" : isServicePlanModalOpenInfo.type === "create" ? "create" : "edit"}
            onClose={() =>
              setIsServicePlanModalOpenInfo({ open: false, type: "create", info: {} })
            }
            roles={roles}
            onSubmit={(values, setError) => {
              ServiceCommonHandler(values, setError);
            }}
          />}

        </CommonModal>
      </CardContent>
    </Card>
  );
}
