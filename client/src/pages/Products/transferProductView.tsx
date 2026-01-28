"use client";

import { useEffect, useMemo, useState } from "react";

import { getInvoiceInfo } from "@/lib/api";
import { calculateInvoiceRow, formatStatusLabel, mapInvoiceApiToPrefilledViewModel, normalizeInvoiceToCreateResponse, } from "@/lib/utils";

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
import { mockTransferStockResponse } from "@/lib/mockData";


export default function TranserProductView() {
    const [plans, setPlans] = useState<any[]>([]);
    const [transferStockView, setTransferStockView] = useState<any | null>(null);

    const [isInfoLoading, setIsInfoLoading] = useState(false);


    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");


    const [productFormList, setProductFormList] = useState<{
        id: string
        product: string,
        uom: string
        available: string
        salePrice: string
        qty: string

    }[]>([])

    const totalCounter = useMemo(() => {
        const subTotal = productFormList.reduce(
            (sum, p) => sum + Number(p.salePrice || 0),
            0
        );
        const totalItems = productFormList.reduce(
            (sum, p) => sum + Number(p.qty || 1),
            0
        );


        const grandTotal =
            subTotal

        return {
            subTotal: +subTotal.toFixed(2),
            totalItems,
            grandTotal: +grandTotal.toFixed(2),

        };
    }, [productFormList]);
    const productColumns = useMemo(() => {
        return [
            {
                key: "product",
                label: "Product",
                align: "center",
                width: "180px",
            },
            {
                key: "uom",
                label: "Measurement",
                width: "150px",
                render: (v: string) => v ?? "-",
            },
            {
                key: "available",
                label: "In Stock",
                width: "150px",
                render: (v: string) => v ?? "-",
            },
            {
                key: "salePrice",
                label: "Price (₹)",
                width: "100px",
                render: (v: number) => `₹ ${v}`,
            },
            {
                key: "qty",
                label: "Transfer Qty",
                align: "center",
                width: "150px",

            },

        ];
    }, [
        productFormList.length,
        setProductFormList,
    ]);
    // useEffect(() => {

    //     const loadInvoice = async () => {
    //         setIsInfoLoading(true);
    //         try {

    //             const res = await getInvoiceInfo(id);
    //             const normalizedData = normalizeInvoiceToCreateResponse(res.data);

    //             const { consumer, job_card, store, payments, items, ...rest } = res?.data
    //             const mapped = mapInvoiceApiToPrefilledViewModel(normalizedData);
    //             setTransferStockView({ ...mapped, ...rest, jobCardFullInfo: job_card });

    //             const gstType = mapped.gst_type == "cgst_sgst" ? "cgst_sgst" : "igst";
    //             const planCalculated = mapped.plans.map((item: any) =>
    //                 calculateInvoiceRow(item, gstType)
    //             );

    //             setPlans(planCalculated);

    //         } catch (e) {
    //             console.log(e);

    //         } finally {
    //             setIsInfoLoading(false);
    //         }
    //     };

    //     loadInvoice();
    // }, [id]);
    useEffect(() => {
        setTransferStockView(mockTransferStockResponse)
    }, [mockTransferStockResponse])
    useEffect(() => {
        if (!transferStockView) return;

        const mappedItems = transferStockView.items.map((item: any) => ({
            id: item.product_id,
            product: item.product,
            image: item.image,
            uom: item.uom,
            available: String(item.available),
            salePrice: String(item.salePrice),
            qty: String(item.qty),
        }));

        setProductFormList(mappedItems);
    }, [transferStockView]);


    const { toast } = useToast();


    const InfoIfExists = ({ value, ...props }: any) => {
        if (value === null || value === undefined || value === "") return null
        return <Info gap="gap-12" colon={false} justify="justify-between" {...props} value={value} />
    }


    return (
        <div className=" mx-auto p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">

                    <button
                        onClick={() => {
                            localStorage.removeItem('sidebar_active_parent')
                            window.history.back()
                        }}
                        // disabled={loading}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <h1 className="text-lg font-semibold flex-1">Transfer Stock {`#${id}`}</h1>

                </div>

            </div>
            {
                isInfoLoading && id ?
                    <Card className="mb-6"><div className="min-h-[150px] flex justify-center items-center">
                        <div className="p-4 text-sm "><Loader /></div>
                    </div></Card> : <>
                        {/* Top Info */}
                        <div className={`grid grid-cols-1 md:grid-cols-2   gap-3`}>
                            {transferStockView  && <Card className="p-4">
                                <CardTitle className=" text-sm font-semibold mb-3 text-gray-700 flex gap-2 items-center">
                                   Store Info
                                </CardTitle>
                                <div className="space-y-2 text-sm">
                                    <InfoIfExists label="Name" value={transferStockView?.store?.name} />
                                    <InfoIfExists label="Mobile No" value={transferStockView?.store?.phone} />
                                    <InfoIfExists label="Email" value={transferStockView?.store?.email} />
                                    <InfoIfExists
                                        label="Organization"
                                        value={transferStockView?.organization.name}
                                    />
                                    <InfoIfExists
                                        label="Transfer Date"
                                        value={transferStockView?.transfer_date}
                                    />
                                </div>
                            </Card>}

                            {transferStockView?.store && <Card className="p-4">
                                <CardTitle className=" text-sm font-semibold mb-3 text-gray-700 flex gap-2 items-center">
                                    Location Info
                                </CardTitle>
                                <div className="space-y-2">
                                    <div className="space-y-2 text-sm">
                                        <InfoIfExists
                                            label="State"
                                            value={transferStockView?.store?.state.name}
                                        />
                                        <InfoIfExists
                                            label="Address"
                                            value={transferStockView.store.address}
                                        />
                                        <InfoIfExists
                                            label="Shipping Address"
                                            value={transferStockView.store.shipping_address}
                                        />
                                    </div>
                                </div>
                            </Card>}

                        </div>


                        {/* Plans */}
                        <Card className="p-4">
                            <CardTitle className="text-sm font-semibold text-gray-700 ">
                                Transfer Items
                            </CardTitle>

                            <CommonTable
                                columns={productColumns}
                                data={productFormList}
                                searchable={false}
                                isAdd={false}
                                isTotal={false}
                                isLoading={false}
                                total={productFormList.length}
                            />

                            {productFormList.length > 0 && (
                                <div className="flex justify-end mt-4">
                                    <div className="w-[280px] text-xs space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Items :</span>
                                            <span className="font-medium">{totalCounter.totalItems}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Sub Total Amount :</span>
                                            <span className="font-medium">
                                                ₹ {totalCounter.subTotal.toLocaleString("en-IN")}
                                            </span>
                                        </div>

                                        <div className="flex justify-between font-semibold border-t pt-2">
                                            <span>Grand Total :</span>
                                            <span>
                                                ₹ {totalCounter.grandTotal.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>


                    </>
            }



        </div>
    );
}
