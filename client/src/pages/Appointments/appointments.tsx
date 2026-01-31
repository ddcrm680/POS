// src/components/profile/profile.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteAppointment, getAppointment, getConsumer } from "@/lib/api";
import { ProductModalInfo, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Badge, Box, IconButton } from "@chakra-ui/react";
import { EditIcon, EyeIcon, Trash2 } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { Kpi } from "../Customer/DashboardCards";
import { appointmentFilterMeta, appointmentMockData } from "@/lib/constant";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import CommonRowMenu from "@/components/common/CommonRowMenu";

export default function NewAppointmentsPage() {
  const { toast } = useToast();

  const [appointments, setAppointments] = useState(appointmentMockData);
  const { roles } = useAuth();

  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState({
    type: "",
    priority: "",
    status: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(false);
  const [isAppointmentDeleteModalOpenInfo, setIsAppointmentDeleteModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });

  const PER_PAGE = 10;
  const AppointmentDeleteHandler = async () => {
    try {
      setIsLoading(true);

      // await DeleteAppointment(isAppointmentDeleteModalOpenInfo?.info?.id);
      toast({ title: `Delete Appointment`, description: "Appointment deleted successfully", variant: "success", });

      fetchAppointment(false)

    } catch (err: any) {

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message || `Failed to delete appointment`,
        variant: "destructive",
      });
    } finally {
      setIsAppointmentDeleteModalOpenInfo({ open: false, info: {} });
      setIsLoading(false);
    }
  };

  const columns = useMemo(() => [
    {
      key: "created_at",
      label: "Created On",
      align: "center",
      width: "150px",
      render: (val: string) => (
        <Box className="flex flex-col items-center">
          <span className="font-semibold">{formatDate(val)}</span>
          <span className="text-sm text-gray-600">{formatTime(val)}</span>
        </Box>
      ),
    },

    {
      key: "scheduled_at",
      label: "Scheduled At",
      width: "150px",
      render: (val: string) => (
        <div className="flex flex-col">
          <span>{formatDate(val)}</span>
          <span className="text-xs text-gray-500">{formatTime(val)}</span>
        </div>
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
      render: (value: any) => (

        <div className="flex flex-col leading-tight">
          {/* Customer Name */}
          <span
            className="text-blue-600 font-medium cursor-pointer hover:underline"
            onClick={() => {
              sessionStorage.setItem("sidebar_active_parent", "customers");
              navigate(`/customers/view?id=${value.id}`)
            }}
          >
            {value?.name ?? "-"}
          </span>

          {/* Phone Number */}
          {value?.phone && (
            <span className="text-xs text-muted-foreground mt-0.5">
              {value.phone}
            </span>
          )}
        </div>
      ),
    },

    {
      key: "store",
      label: "Store",
      width: "150px",
      render: (val: any) => <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => {
        sessionStorage.removeItem('sidebar_active_parent')
        sessionStorage.setItem('sidebar_active_parent', 'stores')
        navigate(`/master/stores/manage?id=${val?.id}&mode=view`)
      }}>
        {val.name}
      </span>,
    },

    {
      key: "appointment_type",
      label: (
        <ColumnFilter
          label="Type"
          value={filters.type}
          onChange={(val) => {
            setFilters(f => ({ ...f, type: val }));
            setPage(1);
          }}
          options={[{ label: "All", value: "" }, ...appointmentFilterMeta.type]}
        />
      ),
      width: "140px",
      render: (value: string) => appointmentFilterMeta.type.find(i => i.value === value)?.label
      ,
    },
    {
      key: "priority",
      label: (
        <ColumnFilter
          label="Priority"
          value={filters.priority}
          onChange={(val) => {
            setFilters(f => ({ ...f, priority: val }));
            setPage(1);
          }}
          options={[{ label: "All", value: "" }, ...appointmentFilterMeta.priority]}
        />
      ),
      width: "140px",
      render: (value: string) => (
        <Badge
          className={`px-3 py-1 text-xs font-medium rounded-full capitalize
        ${value === "critical"
              ? "bg-red-100 text-red-700"
              : value === "urgent"
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-700"
            }
      `}
        >
          {appointmentFilterMeta.priority.find(i => i.value === value)?.label}
        </Badge>
      ),
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
          options={[{ label: "All", value: "" }, ...appointmentFilterMeta.status]}
        />
      ),
      width: "140px",
      render: (value: string) => (
        <Badge
          className={`px-3 py-1 text-xs font-medium rounded-full capitalize
        ${value === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : value === "confirmed"
                ? "bg-green-100 text-green-700"
                : value === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
            }
      `}
        >
          {appointmentFilterMeta.status.find(i => i.value === value)?.label}
        </Badge>
      ),
    },


    {
      key: "estimated_value",
      label: "Amount",
      width: "10px",
      render: (val: number) => `₹${val?.toLocaleString()}`,
    },
  ], []);


  const fetchAppointment = async (isLoaderHide = false) => {
    try {
      // if (!isLoaderHide)
      //   setIsListLoading(true);
      // const res =
      //   await getAppointment({
      //     per_page: perPage,
      //     page,
      //     search,
      //     status: filters.status
      //   });

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
    // fetchAppointment(false);
  }, [search, page, perPage, filters]);
  function resetFilter() {
    setSearch('')
    setPage(1)
    setFilters({
      type: "",
      priority: "",
      status: "",
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
            isClear={true}
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
              navigate("/new-appointments/manage")
            }}
            actions={(row: any) => (
              <CommonRowMenu
                items={[
                  {
                    key: "view",
                    label: "View ",
                    icon: <EyeIcon size={16} />,
                    onClick: () => navigate(`/new-appointments/view?id=${row.id}`)
                     
                  },
                  {
                    key: "edit",
                    label: "Edit ",
                    icon: <EditIcon size={16} />,
                    onClick: () =>
                       navigate(`/new-appointments/manage?id=${row.id}&mode=edit`),
                    show:
                      Number(row.role_id) !==
                      roles.find((role) => role.slug === "super-admin")?.id,
                  },
                  {
                    key: "delete",
                    label: "Delete",
                    icon: <Trash2 size={16} />,
                    danger: true,
                    onClick: () =>
                      setIsAppointmentDeleteModalOpenInfo({
                        open: true,
                        info: row,
                      }),
                  },
                ]}
              />
            )}
          />
          <CommonDeleteModal
            width="330px"
            maxWidth="330px"
            isOpen={isAppointmentDeleteModalOpenInfo.open}
            title="Delete Appointment"
            description={`Are you sure you want to delete this appointment ? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            isLoading={isLoading}
            onCancel={() =>
              setIsAppointmentDeleteModalOpenInfo({ open: false, info: {} })
            }
            onConfirm={AppointmentDeleteHandler}
          />

        </CardContent>
      </Card>
    </div>

  );
}
