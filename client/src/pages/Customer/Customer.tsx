  // src/components/profile/profile.tsx
  "use client";
  import { useCallback, useEffect, useMemo, useState } from "react";
  import { UseFormSetError } from "react-hook-form";
  import { useQueryClient } from "@tanstack/react-query";
  import { Card, CardContent } from "@/components/ui/card";
  import { useToast } from "@/hooks/use-toast";
  import { useAuth } from "@/lib/auth";
  import { useLocation } from "wouter";
  import { DeleteTerritory, DeleteUser, EditUser, fetchUserList, getConsumer, SaveUser, UpdateTerritoryStatus } from "@/lib/api";
  import { TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
  import CommonTable from "@/components/common/CommonTable";
  import { Box, IconButton, Switch } from "@chakra-ui/react";
  import { EditIcon, EyeIcon, Trash2 } from "lucide-react";
  import CommonModal from "@/components/common/CommonModal";
  import { formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
  import CommonDeleteModal from "@/components/common/CommonDeleteModal";
  import { ColumnFilter } from "@/components/common/ColumnFilter";
  import { customerMockData, territoryMasterMockData } from "@/lib/mockData";

  export default function Customer() {
    const { toast } = useToast();
    const { roles } = useAuth();
    const [customers, setCustomers] = useState<Array<any>>([]);
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
        width: "100px",
      },

      /* ================= MOBILE ================= */
      {
        key: "phone",
        label: "Mobile No.",
        width: "150px",

      },
      {
        key: "email",
        label: "Email",
        width: "160px",

      },

      /* ================= VEHICLE TYPE ================= */
      {
        key: "address",
        label: " Address",
        width: "160px",
      
      },

      /* ================= INTERESTED IN ================= */





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

        const mappedTerritory = res.data
        setHasNext(res.meta.has_next)
        setTotal(res.meta.total)
        setCustomers(mappedTerritory);
        setLastPage(res.meta.last_page);
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
        status: ""
      })
    }
    return (
      <div className="p-3">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">Customer Management</h1>
              <p className="text-muted-foreground text-sm">
                Comprehensive customer analytics and management dashboard
              </p>
            </div>
          </div>
        </div>
        <Card className="w-full">
          <CardContent>
            <CommonTable
              columns={columns}
              isClear={false}
              data={customers}
              isAdd={true}
              perPage={perPage}
              setPerPage={setPerPage}
              resetFilter={resetFilter}
              isLoading={isListLoading}
              total={total}
              hasNext={has_next}
              tabType=""
              tabDisplayName="Customer"
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
                  localStorage.removeItem('sidebar_active_parent')
                navigate(`/job-cards/manage`)
              }}
              actions={(row: any) => {
                return (
                  <>

                    {(
                        <Box className="   grid grid-cols-2       
    sm:flex sm:gap-1 
    justify-center">     <IconButton
                          size="xs"
                          // mr={2}
                           title="View"
                      aria-label="View"
                          onClick={() => {
                            navigate(`/customers/view?id=${row.id}`)

                          }
                          }
                        >
                          <EyeIcon />
                        </IconButton>
                        {<IconButton
                          size="xs"
                          // mr={2}
                           title="Edit"
                      aria-label="Edit"
                          onClick={() => {
                            navigate(`/customers/manage?id=${row.id}&mode=edit`)

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
