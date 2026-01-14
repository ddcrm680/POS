// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { cancelInvoice, cancelPayment, DeleteTerritory, DeleteUser, EditUser, fetchUserList, getInvoiceList, getPaymentsList, SaveUser, UpdateTerritoryStatus } from "@/lib/api";
import { InvoicePaymentFormValues, organizationFormType, TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon, PrinterIcon, Trash2, Wallet, Wallet2, XCircle } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { customerMockData, invoiceMockData, jobCardMockData, territoryMasterMockData } from "@/lib/mockData";
import InvoicePaymentForm from "../Invoices/InvoicePaymentForm";

export default function PaymentsPage() {
  const { toast } = useToast();
  const { roles } = useAuth();
  const [payments, setPayments] = useState<Array<any>>([]);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
  const [filterMetaInfo, setFilterMetaInfo] = useState<{ status: { value: string, label: string }[] ,payment_mode:{ value: string, label: string }[] }>({
    status: [],
    payment_mode:[]
  });
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState({
    status: "",
    payment_mode:""
  });
  const [isLoading, setIsLoading] = useState(false);

  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(true);
  const [paymentDeleteModalOpenInfo, setIsPaymentDeleteModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });
  const [invoicePaymentModalOpenInfo, setIsInvoicePaymentModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });
  const PER_PAGE = 10;
  const PaymentsDeleteHandler = async () => {
    try {
      setIsLoading(true);

      await cancelPayment(paymentDeleteModalOpenInfo?.info?.id);
      toast({ title: `Delete Payment`, description: "Payment deleted successfully", variant: "success", });

      fetchPayments(false)

    } catch (err: any) {

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message || `Failed to delete territory`,
        variant: "destructive",
      });
    } finally {
      setIsPaymentDeleteModalOpenInfo({ open: false, info: {} });
      setIsLoading(false);
    }
  };
  const columns = [
    /* ================= CREATED DATE ================= */
    {
      key: "created_at",
      label: "Created Date",
      align: "center",
      width: "120px",
      render: (value: string) => (
        <Box className="flex flex-col">
          <span className="font-medium">{formatDate(value)}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(value)}
          </span>
        </Box>
      ),
    },
    {
      key: "payment_date",
      label: "Payment Date",
      align: "center",
      width: "120px",
      render: (value: string) => (
        <Box className="flex flex-col">
          <span className="font-medium">{formatDate(value)}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(value)}
          </span>
        </Box>
      ),
    },
    {
      key: "invoice_number",
      label: "Invoice No.",
      width: "130px",
      render: (value: string, row: any) => (
        <span className="text-[blue] font-medium cursor-pointer" onClick={() => navigate(`/invoice/manage?id=${row?.invoice?.id}&mode=view`)
        }>
          {value}
        </span>
      ),
    },

    /* ================= CONSUMER ================= */
    {
      key: "amount",
      label: "Recieved amount",
      width: "180px",
       render: (value: number) => (
        <span>₹ {value ?? 0}</span>
      ),
    },


    /* ================= BALANCE DUE ================= */
    {
      key: "remarks",
      label: "Notes",
      width: "130px",
     
    },
 {
      key: "payment_mode",
        label: (
        <ColumnFilter
          label="Mode"
          value={filters.payment_mode}
          onChange={(val) => {
            setFilters(f => ({ ...f, payment_mode: val }));
            setPage(1);
          }}
          options={[{ label: 'All', value: '' }, ...filterMetaInfo.payment_mode]}
        />
      ),
      width: "120px",
      render: (value:string) => (
        <span> {filterMetaInfo.payment_mode.find((item: any) => item.value === value)?.label}
       </span>
      ),
    },
    /* ================= PAYMENT STATUS ================= */
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
          options={[{ label: 'All', value: '' }, ...filterMetaInfo.status]}
        />
      ),
      width: "120px",
      render: (value: string) => {
        const styles: Record<string, string> = {
          issued: "bg-yellow-100 text-yellow-700",
          received : "bg-emerald-100 text-emerald-700",
          cancelled: "bg-red-100 text-red-700",
          "Partially-Paid": "bg-blue-100 text-blue-700",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[value]}`}
          >
            {filterMetaInfo.status.find((item: any) => item.value === value)?.label}
          </span>
        );
      },
    },

  ];
  const fetchPayments = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      console.log(filters.status, ' filters.status');

      const res =
        await getPaymentsList({
          per_page: perPage,
          page,
          search,
          status: filters.status
        });

      const mappedData = res.data.map((item:any)=>({
        ...item,
        invoice_number: item.invoice?.invoice_number
      }))
      
      setHasNext(res.meta.has_next)
      setTotal(res.meta.total)
      setPayments(mappedData);
      setLastPage(res.meta.last_page);
      setFilterMetaInfo(res.meta.filters)
    } catch (e) {
      console.error('error coming', e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };
  useEffect(() => {
    fetchPayments(false);
  }, [search, page, perPage, filters]);
  function resetFilter() {
    setSearch('')
    setPage(1)
    setFilters({
      status: "",
      payment_mode:""
    })
  }
  const OrganizationCommonHandler = async (
    value: InvoicePaymentFormValues,
    setError: UseFormSetError<InvoicePaymentFormValues>
  ) => {
    try {
      setIsLoading(true);

      //   const formData = buildOrganizationFormData(
      //     value,
      //     isOrganizationModalOpenInfo.info.id
      //   );

      //   await EditOrganization(formData);

      toast({
        title: "Payment Info",
        description: "Payment Info updated successfully",
        variant: "success",
      });
      setIsInvoicePaymentModalOpenInfo({ open: false, info: {} });
      fetchPayments(false);
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;

      if (apiErrors && err?.response?.status === 422) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          setError(field as keyof InvoicePaymentFormValues, {
            type: "server",
            message: (messages as string[])[0],
          });
        });
        return;
      }

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Payment Management</h1>
            <p className="text-muted-foreground">
              Create, manage, and track payments
            </p>
          </div>
        </div>
      </div>
      <Card className="w-full">
        <CardContent>
          <CommonTable
            columns={columns}
            isClear={true}
            data={payments}
            isAdd={false}
            perPage={perPage}
            setPerPage={setPerPage}
            resetFilter={resetFilter}
            isLoading={isListLoading}
            total={total}
            hasNext={has_next}
            tabType=""
            tabDisplayName="Payments"
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
            actions={(row: any) => {
              return (
                <>

                  {(
                    <Box className="gap-0">    
                      {

                        row.status !== 'cancelled' ? <IconButton
                          size="xs"
                          mr={2}
                          title="Cancel"
                          colorScheme="red"
                          aria-label="Cancel"
                          onClick={() => {
                            setIsPaymentDeleteModalOpenInfo({ open: true, info: row });
                          }}
                        >
                          <XCircle size={16} />
                        </IconButton> :"-"}

                    </Box>
                  )}
                </>
              );
            }}

          />
          <CommonModal
            width={'80%'}
            maxWidth={'80%'}
             isOpen={invoicePaymentModalOpenInfo.open}
            onClose={() => setIsInvoicePaymentModalOpenInfo({ open: false, info: {} })}
            title={"Payments"}
            isLoading={isLoading}
            primaryText={"Save"}
            cancelTextClass='hover:bg-[#E3EDF6] hover:text-[#000]'
            primaryColor="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
          >
            {
              <InvoicePaymentForm
                id="invoice-form"
                // organizationMetaInfo={}
                initialValues={
                  invoicePaymentModalOpenInfo.info
                }
                isLoading={isLoading}
                mode={"edit"}
                onClose={() =>
                  setIsInvoicePaymentModalOpenInfo({ open: false, info: {} })
                }
                roles={roles}
                onSubmit={(values, setError) => {
                  OrganizationCommonHandler(values, setError);
                }}
              />

            }
          </CommonModal>
          <CommonDeleteModal
            width="420px"
            maxWidth="420px"
            isOpen={paymentDeleteModalOpenInfo.open}
            title="Cancel Payment"
            description={`Are you sure you want to cancel this payment? This action cannot be undone.`}
            confirmText="Yes, Cancel"
            cancelText="No"
            loadingText="Cancelling..."
            isLoading={isLoading}
            onCancel={() =>
              setIsPaymentDeleteModalOpenInfo({ open: false, info: {} })
            }
            onConfirm={PaymentsDeleteHandler}
          />

        </CardContent>
      </Card>
    </div>

  );
}
