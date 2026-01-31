"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconButton } from "@chakra-ui/react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Box } from "@chakra-ui/react";
import { invoiceSchema } from "@/lib/schema";
import { createInvoice, fetchStateList, getCommon, getInvoiceInfo, getInvoiceInfoByJobCardPrefill, getInvoicePayments } from "@/lib/api";
import { EditIcon, PrinterIcon, Trash2 } from "lucide-react";
import { calculateInvoiceRow, formatDate, formatDate2, formatStatusLabel, formatTime, mapInvoiceApiToPrefilledViewModel, normalizeInvoiceToCreateResponse, normalizeInvoiceToEditResponse, } from "@/lib/utils";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";

// export default function InvoicePaymentForm
// (
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import CommonTable from "@/components/common/CommonTable";
import { Info } from "@/components/common/viewInfo";
import { useLocation, useSearchParams } from "wouter";
import { Loader } from "@/components/common/loader";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import {  openHtmlInNewTabAndPrint } from "@/lib/helper";
import { InvoiceHtmlTemplate } from "./template";


export default function InvoiceView() {
    const [plans, setPlans] = useState<any[]>([]);
    const [invoiceView, setInvoiceView] = useState<any | null>(null);

    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [has_next, setHasNext] = useState(false)

    const [filters, setFilters] = useState({
        status: "",
        mode: ""
    });
    const isSameState = useMemo(() => {

        return invoiceView?.gst_type === "cgst_sgst" ? true : false
    }, [invoiceView, invoiceView]);
    const [extraDiscountPercent, setExtraDiscountPercent] = useState('')

    const costSummary = useMemo(() => {
        const subTotal = plans.reduce(
            (sum, p) => sum + Number(p.sub_amount || 0),
            0
        );
        const totalItems = plans.reduce(
            (sum, p) => sum + Number(p.qty || 1),
            0
        );
        const discountTotal = plans.reduce(
            (sum, p) => sum + Number(p.discount_amount || 0),
            0
        );

        const cgstTotal = plans.reduce(
            (sum, p) => sum + Number(p.cgst_amount || 0),
            0
        );

        const sgstTotal = plans.reduce(
            (sum, p) => sum + Number(p.sgst_amount || 0),
            0
        );

        const igstTotal = plans.reduce(
            (sum, p) => sum + Number(p.igst_amount || 0),
            0
        );

        const grandTotal =
            subTotal + cgstTotal + sgstTotal + igstTotal;

        return {
            subTotal: +subTotal.toFixed(2),
            discountTotal: +discountTotal.toFixed(2),
            cgstTotal: +cgstTotal.toFixed(2),
            sgstTotal: +sgstTotal.toFixed(2),
            igstTotal: +igstTotal.toFixed(2),
            totalItems,
            grandTotal: +grandTotal.toFixed(2),


        };
    }, [plans]);
    const extraDiscountAmount =
        (costSummary.grandTotal * Number(extraDiscountPercent || 0)) / 100;

    const finalGrandTotal =
        costSummary.grandTotal - extraDiscountAmount;
    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [, navigate] = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    const [isInfoLoading, setIsInfoLoading] = useState(false);


    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    const jobCardId = searchParams.get("jobCardId");
    const [invoiceInfo, setInvoiceInfo] = useState<{
        selectedPlanId: string,
    }>({
        selectedPlanId: "",
    });

    const planColumns = useMemo(() => {

        return [
            {
                key: "plan_name",
                label: " Name",
                width: "150px",
            },
            {
                key: "sac",
                label: "SAC",
                width: "90px",
                render: (v: string) => v ?? "-",
            },
            {
                key: "qty",
                label: "QTY",
                width: "90px",

            },
            {
                key: "price",
                label: "Price (₹)",
                width: "120px",
                render: (v: number) => `₹ ${v}`,
            },

            {
                key: "discount_percent",
                label: "Dis.(%)",
                width: "90px",
                render: (_: any, row: any) => (
                    <span>{_}% </span>
                ),
            },
            {
                key: "discount_amount",
                label: "Discount",
                width: "120px",
                render: (value: any) => {
                    return <span> ₹ {value}</span>
                }
            },
            {
                key: "sub_amount",
                label: "Sub Amount",

                width: "120px",
                render: (v: number) => `₹ ${v ?? "-"}`,
            },

            ...(isSameState
                ? [
                    {
                        key: "cgst_amount",
                        label: "CGST",
                        width: "120px",
                        render: (_: any, row: any) => (
                            <span>
                                ₹ {row.cgst_amount}
                                <span className="text-green-600 text-xs pl-2">
                                    ({row.cgst_percent}%)
                                </span>
                            </span>
                        ),
                    },
                    {
                        key: "sgst_amount",
                        label: "SGST",
                        width: "120px",
                        render: (_: any, row: any) => (
                            <span>
                                ₹ {row.sgst_amount}
                                <span className="text-green-600 text-xs pl-2">
                                    ({row.sgst_percent}%)
                                </span>
                            </span>
                        ),
                    },
                ]
                : [
                    {
                        key: "igst_amount",
                        label: "IGST",
                        width: "120px",
                        render: (_: any, row: any) => (
                            <span>
                                ₹ {row.igst_amount}
                                <span className="text-green-600 text-xs pl-2">
                                    ({row.igst_percent}%)
                                </span>
                            </span>
                        ),
                    },
                ]),

            {
                key: "total_amount",
                label: "Amount",

                width: "120px",
                render: (v: number) => `₹ ${v ?? "-"}`,
            },
        ];
    }, [invoiceView, isSameState]);

    const [invoiceNumber, setInvoiceNumber] = useState('');
    useEffect(() => {
        // if (!id) return;

        const loadInvoice = async () => {
            setIsInfoLoading(true);
            try {

                const res = await getInvoiceInfo(id);
                setInvoiceNumber(res?.data?.invoice_number)
                setPayments(res?.data?.payments)
                // 👇 normalize ONLY when jobCardId is NOT present
                const normalizedData = normalizeInvoiceToCreateResponse(res.data);

                const { consumer, job_card, store, payments, items, ...rest } = res?.data
                // 👇 existing mapper stays SAME
                const mapped = mapInvoiceApiToPrefilledViewModel(normalizedData);
                setInvoiceView({ ...mapped, ...rest,...({ updated_at: formatDate2(res?.data?.updated_at) }) , jobCardFullInfo: job_card });

                const gstType = mapped.gst_type == "cgst_sgst" ? "cgst_sgst" : "igst";
                const planCalculated = mapped.plans.map((item: any) =>
                    calculateInvoiceRow(item, gstType)
                );

                setPlans(planCalculated);

            } catch (e) {
                console.log(e);

            } finally {
                setIsInfoLoading(false);
            }
        };

        loadInvoice();
    }, [id]);



    // const [stateName, setStateName] = useState<string>('');


    const { toast } = useToast();
    const mode = searchParams.get("mode");


    const InfoIfExists = ({ value, ...props }: any) => {
        if (value === null || value === undefined || value === "") return null
        return <Info gap="gap-12" colon={false} justify="justify-between" {...props} value={value} />
    }

    const isView = mode === "view";
    const paymentColumn = [
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
                    
                </Box>
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
            width: "180px",
            render: (value: number) => (
                <span>{value ?? "-"}</span>
            ),
        },
        {
            key: "payment_mode",
            label: "Mode",
            width: "120px",

        },
        /* ================= PAYMENT STATUS ================= */
        {
            key: "status",
            label: "Status",
            width: "120px",
            render: (value: string) => {
                const styles: Record<string, string> = {
                    issued: "bg-yellow-100 text-yellow-700",
                    recieved: "bg-emerald-100 text-emerald-700",
                    cancelled: "bg-red-100 text-red-700",
                    "Partially-Paid": "bg-blue-100 text-blue-700",
                };
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[value]}`}

                    >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                );
            },
        },

    ];

    const [isListLoading, setIsListLoading] = useState(true);

    const [payments, setPayments] = useState<Array<any>>([]);

    function resetFilter() {
        setSearch('')
        setPage(1)
        setFilters({
            status: "",
            mode: ""
        })
    }
    const styles: Record<string, string> = {
        issued: "bg-yellow-100 text-yellow-700 border-yellow-700",
        paid: "bg-emerald-100 text-emerald-700  border-emerald-700",
        cancelled: "bg-red-100 text-red-700  border-red-700",
        "partially_paid": "bg-blue-100 text-blue-700  border-blue-700",
    };
    const { user, } = useAuth();
  const [printLoading, setPrintLoading] = useState<boolean>(false);
    const isStoreManager =
        user?.role === 'store-manager'
       
         async function commonPreviewHandler(type: "print" | "download", row: any) {
       
           setPrintLoading(true);
       
           try {
             await getCommon(row, type, 'invoices');
           } catch (e) {
             console.error(e);
           } finally {
             console.log('comes here');
       
             setPrintLoading(false);
           }
         }
    return (
        <div className=" mx-auto p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">

                    <button
                        onClick={() => {
                            sessionStorage.removeItem('sidebar_active_parent')
                            window.history.back()
                        }}
                        // disabled={loading}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <h1 className="text-lg font-semibold flex-1">Invoice {`#${invoiceNumber}`}</h1>
                    {invoiceView?.status && (
                        <Badge
                            className={`px-3 py-1 text-xs font-medium rounded-full  ${styles[invoiceView?.status]}
                                        `}
                        >
                            {formatStatusLabel(invoiceView.status)}

                        </Badge>

                    )}

                </div>
                <div className="flex gap-2">
                    {
                        invoiceView?.status == 'issued' &&
                        <IconButton
                            size="xs"
                            // mr={2}
                            title="Edit"
                            aria-label="Edit"
                            onClick={() => {
                                navigate(`/invoices/manage?id=${invoiceView.id}&mode=edit`)
                            }
                            }
                        >
                            <EditIcon />
                        </IconButton>}
                        {printLoading ?  <Loader isShowLoadingText={false} loaderSize={3} /> :  <IconButton
                        size="xs"
                        // mr={2}
                        aria-label="Print"
                        onClick={() => {
                            commonPreviewHandler('print',{id: invoiceView.id})
                        }
                        }
                    >
                        <PrinterIcon />
                    </IconButton>}
                  
                </div>

            </div>
            {
                isInfoLoading && id ?
                    <Card className="mb-6"><div className="min-h-[150px] flex justify-center items-center">
                        <div className="p-4 text-sm "><Loader /></div>
                    </div></Card> : <>
                        {/* Top Info */}
                        <div className={`grid grid-cols-1  ${isStoreManager ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'} gap-3`}>
                            {invoiceView?.customer && <Card className="p-4">
                                <CardTitle className=" text-sm font-semibold mb-3 text-gray-700 flex gap-2 items-center">
                                    Customer Detail
                                </CardTitle>
                                <div className="space-y-2">
                                    <InfoIfExists
                                        label="Name"
                                        value={invoiceView?.customer?.name}
                                    />
                                    <InfoIfExists
                                        label="Phone"
                                        value={invoiceView?.customer?.phone}
                                    />
                                    <InfoIfExists
                                        label="Email"
                                        value={invoiceView?.customer?.email}
                                    />
                                    <InfoIfExists
                                        label="Address"
                                        value={invoiceView?.customer?.address}
                                    />
                                </div>
                            </Card>}

                            {invoiceView?.jobcard && <Card className="p-4">
                                <CardTitle className=" text-sm font-semibold mb-3 text-gray-700 flex gap-2 items-center">
                                    Jobcard Info
                                </CardTitle>
                                <div className="space-y-2">
                                    <InfoIfExists label="Service Date" value={invoiceView?.jobcard.jobcard_date} />
                                    <InfoIfExists label="Edited Date" value={invoiceView?.updated_at} />
                                </div>
                            </Card>}
                            {invoiceView?.vehicle && <Card className="p-4">
                                <CardTitle className=" text-sm font-semibold mb-3 text-gray-700 flex gap-2 items-center">
                                    Vehicle Info  </CardTitle>   <div className="space-y-2">
                                    <InfoIfExists label="Type" value={invoiceView?.vehicle?.type} />
                                    <InfoIfExists label="Make" value={invoiceView?.vehicle?.make} />
                                    <InfoIfExists label="Model" value={invoiceView?.vehicle?.model} />
                                    <InfoIfExists label="Reg No" value={invoiceView?.vehicle?.reg_no} />
                                    <InfoIfExists label="Year" value={invoiceView?.vehicle?.make_year} />
                                    <InfoIfExists label="Color" value={invoiceView?.vehicle?.color} />
                                    <InfoIfExists label="Chassis No" value={invoiceView?.vehicle?.chassisNo} />
                                    <InfoIfExists label="Remark" value={invoiceView?.vehicle?.remark} />

                                </div>
                            </Card>
                            }

                            <Card className="p-4">
                                <CardTitle className=" text-sm font-semibold mb-3 text-gray-700 flex gap-2 items-center">
                                    Billing Info
                                </CardTitle>
                                <div className="space-y-2">
                                    <InfoIfExists label="Bill To" value={invoiceView?.billing_name
                                    } />
                                    <InfoIfExists label="Phone" value={invoiceView?.billing_phone} />
                                    <InfoIfExists label="Email" value={invoiceView?.billing_email} />
                                    <InfoIfExists label="State" value={invoiceView?.billing_state?.name} />
                                    {invoiceView?.billing_gstin && (
                                        <InfoIfExists label="GSTIN" value={invoiceView?.billing_gstin} />
                                    )}
                                    {invoiceView?.billing_address && <InfoIfExists label="Address" value={invoiceView?.billing_address} />}
                                </div>
                            </Card>

                        </div>


                        {/* Plans */}
                        <Card className="p-4 lg:col-span-3">

                            <CardTitle className="text-sm font-semibold text-gray-700">
                                Service Info
                            </CardTitle>


                            <CommonTable
                                columns={planColumns}
                                data={plans}
                                searchable={false}
                                isAdd={false}
                                isLoading={false}
                                total={plans.length}
                                tabDisplayName="Plans"
                                page={1}
                                isTotal={false}
                                setPage={() => { }}
                                lastPage={1}
                                hasNext={false}

                            />
                            {/* <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">
                                            Extra Discount (%):
                                        </span>

                                        <div className="flex items-center gap-2">

                                            <span className="text-muted-foreground">
                                                {
                                                    extraDiscountAmount
                                                    ?? "-"} %
                                            </span>
                                            <span className="text-muted-foreground">
                                                ₹ {
                                                    costSummary?.extraDiscount
                                                    ?? "-"}
                                            </span>
                                        </div>
                                    </div> */}
                            {/* TOTALS */}
                            <div className="flex md:justify-end ">
                                <div className="w-[300px] text-xs space-y-2">

                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Total Items :
                                        </span>
                                        <span className="font-medium">
                                            {costSummary.totalItems}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Sub Total Amount:
                                        </span>
                                        <span className="font-medium">
                                            ₹ {costSummary.subTotal}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Total Discount Amount:
                                        </span>
                                        <span className="font-medium">
                                            ₹ {costSummary.discountTotal}
                                        </span>
                                    </div>
                                    {isSameState ? (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    CGST Amount :
                                                </span>
                                                <span className="font-medium">
                                                    ₹ {costSummary.cgstTotal ?? "-"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    SGST Amount :
                                                </span>
                                                <span className="font-medium">
                                                    ₹ {costSummary.sgstTotal ?? "-"}
                                                </span>
                                            </div>
                                        </>
                                    ) : <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            IGST Amount :
                                        </span>
                                        <span className="font-medium">
                                            ₹ {costSummary.igstTotal ?? "-"}
                                        </span>
                                    </div>}

                                    <div className="flex justify-between font-semibold border-t pt-2">
                                        <span>Grand Total Amount:</span>
                                        <span>
                                            ₹ {costSummary?.grandTotal}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Received Amount:
                                        </span>
                                        <span className="font-medium text-green-600">
                                            ₹ {invoiceView?.paid_amount ?? "0"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Balance Amount:
                                        </span>
                                        <span
                                            className={`font-semibold ${!invoiceView?.total_due ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            ₹ {invoiceView?.total_due ?? "0"}
                                        </span>
                                    </div>


                                </div>
                            </div>
                        </Card>
                        {/* Payments info */}
                        {<Card className="p-4 lg:col-span-3">
                            <CardTitle className=" text-sm font-semibold  text-gray-700 flex gap-2 items-center">
                                Payments Info
                            </CardTitle>
                            <CommonTable
                                columns={paymentColumn}
                                isClear={false}
                                data={payments}
                                isAdd={false}
                                isTotal={false}
                                searchable={false}
                                perPage={perPage}
                                setPerPage={setPerPage}
                                resetFilter={resetFilter}
                                isLoading={isInfoLoading}
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

                            />
                        </Card>}
                    </>
            }



        </div>
    );
}
