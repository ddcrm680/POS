// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { cancelInvoice, DeleteTerritory, DeleteUser, EditUser, fetchUserList, getInvoiceList, SaveUser, UpdateTerritoryStatus } from "@/lib/api";
import { InvoicePaymentFormValues, organizationFormType, TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon, PrinterIcon, Trash2, Wallet, Wallet2, XCircle } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { customerMockData, invoiceMockData, jobCardMockData, territoryMasterMockData } from "@/lib/mockData";
import InvoicePaymentForm from "./InvoicePaymentForm";

export default function Invoice() {
    const { toast } = useToast();
    const { roles } = useAuth();
    const [invoices, setInvoices] = useState<Array<any>>([]);
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [has_next, setHasNext] = useState(false)
    const [filterMetaInfo, setFilterMetaInfo] = useState<{ status:{ value: string, label: string }[] }>({
        status: []
    });
    const [, navigate] = useLocation();
    const [filters, setFilters] = useState({
        status: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [isListLoading, setIsListLoading] = useState(true);
    const [invoiceDeleteModalOpenInfo, setIsInvoiceDeleteModalOpenInfo] = useState<{ open: boolean, info: any }>({
        open: false,
        info: {}
    });
    const [invoicePaymentModalOpenInfo, setIsInvoicePaymentModalOpenInfo] = useState<{ open: boolean, info: any }>({
        open: false,
        info: {}
    });
    const PER_PAGE = 10;
    const InvoiceDeleteHandler = async () => {
        try {
            setIsLoading(true);

            await cancelInvoice({ id: invoiceDeleteModalOpenInfo?.info?.id });
            toast({ title: `Delete Invoice`, description: "Invoice deleted successfully", variant: "success", });

            fetchInvoices(false)

        } catch (err: any) {

            toast({
                title: "Error",
                description:
                    err?.response?.data?.message ||
                    err.message || `Failed to delete territory`,
                variant: "destructive",
            });
        } finally {
            setIsInvoiceDeleteModalOpenInfo({ open: false, info: {} });
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
            key: "invoice_number",
            label: "Invoice No.",
            width: "130px",
            render: (value: string, row: any) => (
                <span className="text-[blue] font-medium cursor-pointer" onClick={() => navigate(`/invoice/manage?id=${row.id}&mode=view`)
                }>
                    #{value}
                </span>
            ),
        },

        /* ================= CONSUMER ================= */
        {
            key: "consumer",
            label: "Customer",
            width: "180px",
            render: (value: { name: string },row:any) => (
                <span className="text-[blue] font-medium cursor-pointer"  onClick={() => {
            localStorage.setItem("sidebar_active_parent", "customers")

            navigate(`/customers/manage?id=${row.consumer_id}&mode=view`)
          }
          }>
                    {value?.name}
                </span>
            ),
        },

        /* ================= INVOICE NO ================= */

        /* ================= AMOUNT ================= */
        {
            key: "grand_total",
            label: "Amount",
            width: "120px",
            render: (value: number) => (
                <span>₹ {value}</span>
            ),
        },

        /* ================= BALANCE DUE ================= */
        {
            key: "total_due",
            label: "Balance Due",
            width: "130px",
            render: (value: number) => (
                <span>₹ {value ?? 0}</span>
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
                    options={[{ label: 'All', value: '' },...filterMetaInfo.status]}
                />
            ),
            width: "120px",
            render: (value: string) => {
                const styles: Record<string, string> = {
                    issued: "bg-yellow-100 text-yellow-700",
                    paid: "bg-emerald-100 text-emerald-700",
                    cancelled: "bg-red-100 text-red-700",
                    "Partially-Paid": "bg-blue-100 text-blue-700",
                };

                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[value]}`}
                    >
                        {filterMetaInfo.status.find((item:any) => item.value === value)?.label}
                    </span>
                );
            },
        },

    ];
    const fetchInvoices = async (isLoaderHide = false) => {
        try {
            if (!isLoaderHide)
                setIsListLoading(true);
            console.log( filters.status,' filters.status');
            
            const res =
                await getInvoiceList({
                    per_page: perPage,
                    page,
                    search,
                    status: filters.status
                });

            const mappedData = res.data
            setHasNext(res.meta.has_next)
            setTotal(res.meta.total)
            setInvoices(mappedData);
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
        console.log(invoices, 'invoicesinvoices');

    }, [invoices])
    useEffect(() => {
        fetchInvoices(false);
    }, [search, page, perPage, filters]);
    function resetFilter() {
        setSearch('')
        setPage(1)
        setFilters({
            status: ""
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
            fetchInvoices(false);
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
                        <h1 className="text-xl font-semibold">Invoice Management</h1>
                        <p className="text-muted-foreground">
                            Create, manage, and track customer invoices
                        </p>
                    </div>
                </div>
            </div>
            <Card className="w-full">
                <CardContent>
                    <CommonTable
                        columns={columns}
                        isClear={true}
                        data={invoices}
                        isAdd={false}
                        perPage={perPage}
                        setPerPage={setPerPage}
                        resetFilter={resetFilter}
                        isLoading={isListLoading}
                        total={total}
                        hasNext={has_next}
                        tabType=""
                        tabDisplayName="Invoice"
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
                                        <Box className="gap-3">     <IconButton
                                            size="xs"
                                            mr={2}
                                            aria-label="Print"
                                            disabled
                                            onClick={() => { }
                                            }
                                        >
                                            <PrinterIcon />
                                        </IconButton>
                                            <IconButton
                                                size="xs"
                                                mr={2}
                                                aria-label="View"
                                                onClick={() => {
                                                    navigate(`/invoice/manage?id=${row.id}&mode=view`)

                                                }
                                                }
                                            >
                                                <EyeIcon />
                                            </IconButton>
                                            {Number(row.role_id) !== roles.find((role) => role.slug === "super-admin").id && <IconButton
                                                size="xs"
                                                mr={2}
                                                aria-label="Edit"
                                                onClick={() => {
                                                    navigate(`/invoice/manage?id=${row.id}&mode=edit`)

                                                }
                                                }
                                            >
                                                <EditIcon />
                                            </IconButton>}




                                            {
                                                Number(row.role_id) !== roles.find((role) => role.slug === "super-admin").id&&
                                                <IconButton
                                                    size="xs"
                                                    mr={2}
                                                    colorScheme="red"
                                                    aria-label="Delete"
                                                    onClick={() => {
                                                        setIsInvoicePaymentModalOpenInfo({ open: true, info: row });
                                                    }}
                                                >
                                                    <Wallet size={16} />
                                                </IconButton>}
                                            {

                                                row.status !== 'cancelled' && <IconButton
                                                    size="xs"
                                                    mr={2}
                                                    title="Cancel"
                                                    colorScheme="red"
                                                    aria-label="Cancel"
                                                    onClick={() => {
                                                        setIsInvoiceDeleteModalOpenInfo({ open: true, info: row });
                                                    }}
                                                >
                                                    <XCircle size={16} />
                                                </IconButton>}

                                        </Box>
                                    )}
                                </>
                            );
                        }}

                    />
                    <CommonModal
                        width={'50%'}
                        maxWidth={'50%'}
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
                                    invoicePaymentModalOpenInfo.info.id
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
                        isOpen={invoiceDeleteModalOpenInfo.open}
                        title="Cancel Invoice"
                        description={`Are you sure you want to cancel this invoice? This action cannot be undone.`}
                        confirmText="Yes, Cancel"
                        cancelText="No"
                        loadingText="Cancelling..."
                        isLoading={isLoading}
                        onCancel={() =>
                            setIsInvoiceDeleteModalOpenInfo({ open: false, info: {} })
                        }
                        onConfirm={InvoiceDeleteHandler}
                    />

                </CardContent>
            </Card>
        </div>

    );
}
