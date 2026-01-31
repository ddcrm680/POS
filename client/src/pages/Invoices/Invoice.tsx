// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { cancelInvoice, DeleteTerritory, DeleteUser, EditUser, fetchUserList, getCommon, getCustomerView, getInvoiceInfo, getInvoiceList, getJobCardItem, invoiceSend, saveInvoicePayment, SaveUser, UpdateTerritoryStatus } from "@/lib/api";
import { InvoicePaymentFormValues, organizationFormType, reusableComponentType, TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Badge, Box, IconButton, Image, Switch } from "@chakra-ui/react";
import { DownloadIcon, EditIcon, EllipsisVertical, EyeIcon, Mail, PrinterIcon, Send, Trash2, Wallet, Wallet2, XCircle } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { calculateInvoiceRow, canShowAction, formatAndTruncate, formatDate, formatTime, mapInvoiceApiToPrefilledViewModel, normalizeInvoiceToCreateResponse } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import whatsap from "@/lib/images/whatsap.webp"
import { customerMockData, invoiceMockData, jobCardMockData, territoryMasterMockData } from "@/lib/mockData";
import InvoicePaymentForm from "./InvoicePaymentForm";
import { downloadHtmlAsPdf, mapColumnsForCustomerView, openHtmlInNewTabAndPrint } from "@/lib/helper";

import CommonRowMenu from "@/components/common/CommonRowMenu";
import { Loader } from "@/components/common/loader";
export default function Invoice({ noTitle = false, noPadding = false, apiLink = "", hideColumnListInCustomer = { list: [], actionShowedList: [] } }: reusableComponentType) {
    const { toast } = useToast();
    const { roles } = useAuth();
    const [invoices, setInvoices] = useState<Array<any>>([]);
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [has_next, setHasNext] = useState(false)
    const [filterMetaInfo, setFilterMetaInfo] = useState<{ status: { value: string, label: string }[] }>({
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

    const [sendModal, setSendModal] = useState<any>({ open: false, invoice: {} })
    const [roleView, setRoleView] = useState<{
        store: boolean,
        admin: boolean,
        default: boolean
    }>({
        store: false,
        admin: false,
        default: false
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
    const InvoiceSendHandler = async () => {
        try {

            setIsLoading(true);

            await invoiceSend(sendModal);
            toast({ title: `Send Invoice`, description: "Invoice send successfully", variant: "success", });

        } catch (err: any) {

            toast({
                title: "Error",
                description:
                    err?.response?.data?.message ||
                    err.message || `Failed to send invoice`,
                variant: "destructive",
            });
        } finally {
            setSendModal({ open: false, invoice: {} });
            setIsLoading(false);
        }
    };
    const { user, Logout, } = useAuth();
    useEffect(() => {
        const supremeUserRoleList = ['admin', "super-admin"]
        const managerList = ['store-manager']
        const roleList = {
            store: false,
            admin: false,
            default: false
        }

        managerList.find((manager) => manager === user?.role) ? roleList.store = true :
            supremeUserRoleList.find((supremeUser) => supremeUser === user?.role) ? roleList.admin = true : roleList.default = true
        setRoleView(roleList)
    }, [user, roles])
    const columns = [
        /* ================= CREATED DATE ================= */
        {
            key: "created_at",
            label: "Created Date",
            align: "center",
            width: "150px",
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
            width: "150px",
            render: (value: string, row: any) => (
                <span className="text-[blue] font-medium cursor-pointer" onClick={() =>
                    navigate(`/invoices/view?id=${row.id}`)
                }>
                    {value}
                </span>
            ),
        },

        /* ================= CONSUMER ================= */
        {
            key: "consumer",
            label: "Customer",
            width: "150px",
            render: (value: { name: string, phone: string }, row: any) => (

                <div className="flex flex-col leading-tight">
                    {/* Customer Name */}
                    <span
                        className="text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={() => {
                            sessionStorage.setItem("sidebar_active_parent", "customers");
                            navigate(`/customers/view?id=${row.consumer_id}`)
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

        /* ================= INVOICE NO ================= */

        /* ================= AMOUNT ================= */
        {
            key: "grand_total",
            label: "Amount",
            width: "150px",
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
                    options={[{ label: 'All', value: '' }, ...filterMetaInfo.status]}
                />
            ),
            width: "120px",

            render: (value: string) => {
                const styles: Record<string, string> = {
                    issued: "bg-yellow-100 text-yellow-700",
                    paid: "bg-emerald-100 text-emerald-700",
                    cancelled: "bg-red-100 text-red-700",
                    "partially_paid": "bg-blue-100 text-blue-700",
                };

                return (
                    <Badge
                        className={`px-3 py-1 text-xs font-medium rounded-full  ${styles[value]}
                    `}
                    >
                        {filterMetaInfo.status.find((item: any) => item.value === value)?.label}

                    </Badge>

                );
            },
        },

    ];

    const resolvedColumns = useMemo(() => {
        const list = hideColumnListInCustomer?.list;

        // 🔓 No config → show all columns
        if (!Array.isArray(list) || list.length === 0) {
            return columns;
        }

        return mapColumnsForCustomerView(columns, list);
    }, [columns, hideColumnListInCustomer]);

    const fetchInvoices = async (isLoaderHide = false) => {
        try {
            if (!isLoaderHide)
                setIsListLoading(true);

            const res =
                await getInvoiceList({
                    apiLink,
                    param: {
                        per_page: perPage,
                        page,
                        search,
                        status: filters.status
                    }

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
        fetchInvoices(false);
    }, [search, page, perPage, filters]);
    function resetFilter() {
        setSearch('')
        setPage(1)
        setFilters({
            status: ""
        })
    }
    const InvoiceCommonHandler = async (
        value: InvoicePaymentFormValues,
        setError: UseFormSetError<InvoicePaymentFormValues>
    ) => {
        try {
            setIsLoading(true);
            const payload = {
                "payment_date": value.payment_date,
                "payment_mode": value.payment_mode,
                "amount": value.received_amount,
                "txn_id": value.txn_id,
                "remarks": value.remarks
            }

            await saveInvoicePayment(invoicePaymentModalOpenInfo.info.id, payload);
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

    const [printDownLoadLoading, setPrintDownLoadLoading] = useState<any>({
        type: '',
        isLoad: false
    })
    const allowedActions = hideColumnListInCustomer?.actionShowedList;

    const [rowLoading, setRowLoading] = useState<{
        [key: string]: boolean;
    }>({});

    async function commonPreviewHandler(type: "print" | "download", row: any) {
        const key = `${type}-${row.id}`;

        setRowLoading(prev => ({ ...prev, [key]: true }));

        try {
            await getCommon(row, type, 'invoices');
        } catch (e) {
            console.error(e);
        } finally {
            console.log('comes here');

            setRowLoading(prev => ({ ...prev, [key]: false }));
        }
    }


    return (
        <div className={`${noPadding ? "" : "p-3"}`}>
            {!noTitle && <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Invoice Management</h1>
                        <p className="text-muted-foreground text-sm">
                            Create, manage, and track customer invoices
                        </p>
                    </div>
                </div>
            </div>}
            <Card className="w-full">
                <CardContent>
                    <CommonTable
                        columns={resolvedColumns}
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
                        actions={(row: any) => (
                            <CommonRowMenu
                                isAsyncLoading={
                                    !!rowLoading[`print-${row.id}`] ||
                                    !!rowLoading[`download-${row.id}`]
                                }
                                closeKey={`${row.id}-${!!rowLoading[`print-${row.id}`] || !!rowLoading[`download-${row.id}`]}`}

                                items={[

                                    {
                                        key: "view",
                                        label: "View ",
                                        icon: <EyeIcon size={16} />,
                                        onClick: () => navigate(`/invoices/view?id=${row.id}`),
                                        show: canShowAction("view", allowedActions),
                                    },
                                    {
                                        key: "edit",
                                        label: "Edit ",
                                        icon: <EditIcon size={16} />,
                                        onClick: () =>
                                            navigate(`/invoices/manage?id=${row.id}&mode=edit`),
                                        show: canShowAction("edit", allowedActions) && row.status === "issued",
                                    },
                                    {
                                        key: "print",
                                        actionType: "print",
                                        label: "Print",
                                        icon: rowLoading[`print-${row.id}`] ? (
                                            <Loader isShowLoadingText={false} loaderSize={3} />
                                        ) : (
                                            <PrinterIcon size={16} />
                                        ),
                                        onClick: () => commonPreviewHandler("print", row),
                                        show: canShowAction("print", allowedActions),
                                        disabled: rowLoading[`print-${row.id}`],
                                    }
                                    ,
                                    {
                                        key: "download",

                                        actionType: "download",
                                        label: "Download",
                                        icon: rowLoading[`download-${row.id}`] ? (
                                            <Loader isShowLoadingText={false} loaderSize={3} />
                                        ) : (
                                            <DownloadIcon size={16} />
                                        ),
                                        onClick: () => commonPreviewHandler("download", row),
                                        show: canShowAction("download", allowedActions),
                                        disabled: rowLoading[`download-${row.id}`],
                                    },
                                    {
                                        key: "whatsapp",
                                        label: "Send via WhatsApp",
                                        icon: <Image src={whatsap} className="w-4 h-4" />,
                                        onClick: () =>
                                            setSendModal({ open: true, invoice: { ...row, sendType: "whatsap" } }),
                                        show: roleView.admin || roleView.store,
                                    },
                                    {
                                        key: "mail",
                                        label: "Send via Mail",
                                        icon: <Mail size={16} />,
                                        onClick: () =>
                                            setSendModal({ open: true, invoice: { ...row, sendType: "mail" } }),
                                        show: roleView.admin || roleView.store,
                                    },
                                    {
                                        key: "payment",
                                        label: "Add Payment",
                                        icon: <Wallet size={16} />,
                                        onClick: () =>
                                            setIsInvoicePaymentModalOpenInfo({ open: true, info: row }),
                                        show:
                                            canShowAction("Wallet", allowedActions) &&
                                            (row.status === "issued" || row.status === "partially_paid"),
                                    },
                                    {
                                        key: "cancel",
                                        label: "Cancel Invoice",
                                        icon: <XCircle size={16} />,
                                        danger: true,
                                        onClick: () =>
                                            setIsInvoiceDeleteModalOpenInfo({ open: true, info: row }),
                                        show: canShowAction("delete", allowedActions) && row.status === "issued",
                                    },
                                ]}
                            />
                        )}


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
                                    InvoiceCommonHandler(values, setError);
                                }}
                            />

                        }
                    </CommonModal>
                    <CommonDeleteModal
                        width="330px"
                        maxWidth="330px"
                        isOpen={sendModal.open || invoiceDeleteModalOpenInfo.open}
                        title={`${sendModal.open ? "Send Invoice " : "Cancel Invoice"}`}
                        description={`Are you sure you want to ${sendModal.open ? 'send' : 'cancel'} this invoice 
                        ${sendModal.open ? sendModal?.invoice?.sendType === "whatsap" ? 'via Whatsapp' : "via Mail" : ""}? ${sendModal.open ? '' : 'This action cannot be undone.'}`}
                        confirmText={`Yes, ${sendModal.open ? 'Send' : 'Cancel'}`}
                        cancelText="No"
                        loadingText={`${sendModal.open ? 'Sending' : 'Cancelling'}...`}
                        isLoading={isLoading}
                        onCancel={() => {
                            setSendModal({ open: false, invoice: {} })

                            setIsInvoiceDeleteModalOpenInfo({ open: false, info: {} })
                        }
                        }
                        onConfirm={() => {

                            if (sendModal.open) {
                                InvoiceSendHandler()
                            } else {
                                InvoiceDeleteHandler()
                            }
                        }}
                    />

                </CardContent>
            </Card>
        </div>

    );
}
