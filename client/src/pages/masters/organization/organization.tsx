// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { EditOrganization, EditServicePlan, fetchOrganizationsList, fetchServicePlanList, fetchServicePlanMetaInfo, SaveOrganizations, SaveServicePlan, UpdateOrganizationStatus, UpdateServicePlanStatus } from "@/lib/api";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { formatDate, formatTime } from "@/lib/utils";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { categoryType, cityOptions, countryOptions, organizationMockData, planName, servicePlanMockResponse, stateOptions, vehicleType } from "@/lib/mockData";
import ServiceForm from "./organizationForm";
import { organizationFormType, organizationMetaInfoType, serviceFormType, serviceMetaInfoType, UserFormType } from "@/lib/types";
import OrganizationForm from "./organizationForm";

export default function Organization() {
  const { toast } = useToast();

  const { roles } = useAuth();
  const [users, setUsers] = useState<Array<any>>([]);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
  const [isOrganizationModalOpenInfo, setIsOrganizationModalOpenInfo] = useState<{ open: boolean, type: string, info: any }>({
    open: false,
    type: 'create',
    info: {}
  });
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [organizationMetaInfo, setOrganizationMetaInfo] = useState<organizationMetaInfoType>({
    country: [],
    state: [],
    city: [],
  })
  const [isListLoading, setIsListLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const PER_PAGE = 10;
  const [filters, setFilters] = useState({

    status: ""
  });
  async function getOrganizationMetaInfo() {
    const res = {
      country: countryOptions,
      state: stateOptions,
      city: cityOptions,
    }
    setOrganizationMetaInfo(res)
  }
  useEffect(() => {

    getOrganizationMetaInfo()
  }, [])
  const columns = useMemo(() => [
    {
      key: "created_at", label: "Created On", align: "center", width: "100px", render: (_value: any,) => {

        return (
          <Box className="flex flex-col justify-center items-center">
            <span className="text-sm font-medium text-sm  ">
              {formatDate(_value)}
            </span>
            <span className="text-sm font-medium  text-gray-700">
              {formatTime(_value)}
            </span></Box>
        );
      },
    },
    {
      key: "company_name",
      label: "Company Name",
      width: "250px",
      render: (val: string) => (
        <span className="text-primary font-medium cursor-pointer">
          {val}
        </span>
      ),
    },
    {
      key: "email", label: "Email", width: "150px",

    },
    {
      key: "invoice_prefix", label: "Invoice Prefix", width: "150px",
    },
    {
      key: "service_prefix", label: "Service Prefix", width: "150px",
    },
    // {
    //   key: "gstin", label: "Gstin", width: "150px",
    // },
    {
      key: "bank_name", label: "Bank Name", width: "150px",
    },
    // {
    //   key: "bank_address", label: "Address", width: "150px",
    // },
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
            onCheckedChange={() => OrganizationStatusUpdateHandler(_row)}
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

  const OrganizationStatusUpdateHandler = useCallback(async (u: any) => {
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

      await UpdateOrganizationStatus({ id: u.id, status: newStatus });

      toast({
        title: "Status Update",
        description: "Organization status updated successfully",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          "Failed to update organization status",
        variant: "destructive",
      });
    }
  }, []);

  const OrganizationCommonHandler = async (
    value: organizationFormType,
    setError: UseFormSetError<organizationFormType>
  ) => {
    console.log(value, 'value67890-[');

    try {
      setIsLoading(true);

      if (isOrganizationModalOpenInfo.type === "edit") {
        await EditOrganization({
          info: {
            id: isOrganizationModalOpenInfo.info.id,

            // Company details
            company_name: value.company_name,
            company_name_in_bank: value.company_name_in_bank,
            email: value.email,

            gstin: value.gstin,
            pan_no: value.pan_no,
            aadhar_no: value.aadhar_no ?? "",

            company_address: value.company_address,

            // Bank details
            bank_name: value.bank_name,
            account_no: value.account_no,
            account_type: value.account_type ?? "",
            ifsc_code: value.ifsc_code,
            branch_name: value.branch_name ?? "",
            bank_address: value.bank_address,

            // Invoice / Service
            invoice_prefix: value.invoice_prefix,
            service_prefix: value.service_prefix,

            // Location
            country: value.country,
            state: value.state,
            city: value.city,
            district: value.district,
            pincode: value.pincode,
            document:value.pincode
          }

        });

        toast({
          title: "Edit User",
          description: "Organization updated successfully",
          variant: "success",
        });
      } else {
        await SaveOrganizations(value);

        toast({
          title: "Add Organization",
          description: "Organization added successfully",
          variant: "success",
        });
      }

      setIsOrganizationModalOpenInfo({ open: false, type: "create", info: {} });
      fetchOrganizations(false);
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;


      // 👇 THIS IS THE KEY PART
      if (apiErrors && err?.response?.status === 422) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          setError(field as keyof organizationFormType, {
            type: "server",
            message: (messages as string[])[0],
          });
        });
        return;
      }
      if (err?.response?.status === 403) {

        setIsOrganizationModalOpenInfo({ open: false, type: "create", info: {} });
      }
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          `Failed to ${isOrganizationModalOpenInfo.type === "create" ? "add" : "update"
          } user`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizations = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res = organizationMockData
      // await fetchOrganizationsList({
      //   per_page: perPage,
      //   page,
      //   search,
      //   status: filters.status,
      // });

      const mappedUsers = res.data
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
    fetchOrganizations(false);
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
          tabDisplayName="Organization"
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
            setIsOrganizationModalOpenInfo({ open: value, type: "create", info: {} })
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
                        setIsOrganizationModalOpenInfo({
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
                        setIsOrganizationModalOpenInfo({
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
          isOpen={isOrganizationModalOpenInfo.open}
          onClose={() => setIsOrganizationModalOpenInfo({ open: false, type: 'create', info: {} })}
          title={isOrganizationModalOpenInfo.type === 'view' ? "View Organization" : isOrganizationModalOpenInfo.type === 'create' ? "Add Organization" : "Edit Organization"}
          isLoading={isLoading}
          primaryText={isOrganizationModalOpenInfo.type === 'create' ? "Add" : "Edit"}
          cancelTextClass='hover:bg-[#E3EDF6] hover:text-[#000]'
          primaryColor="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
        >
          <OrganizationForm
            id="organization-form"
            organizationMetaInfo={organizationMetaInfo}
            initialValues={
              isOrganizationModalOpenInfo.type === "edit" || isOrganizationModalOpenInfo.type === "view"
                ? isOrganizationModalOpenInfo.info
                : {}
            }
            isLoading={isLoading}
            mode={isOrganizationModalOpenInfo.type === 'view' ? "view" : isOrganizationModalOpenInfo.type === "create" ? "create" : "edit"}
            onClose={() =>
              setIsOrganizationModalOpenInfo({ open: false, type: "create", info: {} })
            }
            roles={roles}
            onSubmit={(values, setError) => {
              OrganizationCommonHandler(values, setError);
            }}
          />

        </CommonModal>
      </CardContent>
    </Card>
  );
}
