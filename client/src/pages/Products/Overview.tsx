"use client";

import { Card } from "@/components/ui/card";
import { Info } from "@/components/common/viewInfo";

export function Overview({ product }: { product: any }) {
    const InfoIfExists = ({ value, ...props }: any) => {
        if (value === null || value === undefined || value === "") return null;

        return (
            <Info
                gap="gap-6"
                colon={false}
                justify="justify-between"
                labelClassName="text-xs text-muted-foreground"
                valueClassName="text-xs font-medium text-gray-800"
                {...props}
                value={value}
            />
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
            {/* LEFT CARD — PRODUCT IDENTITY */}
            <Card className="p-3">
               <h3 className="text-sm font-semibold text-slate-700 mb-3">
                             Product Identity
                </h3>

                {/* BASIC INFO */}
                <div className="space-y-1">
                    <InfoIfExists label="Category" value={product?.category?.name} />
                    <InfoIfExists label="Brand" value={product?.brand?.name} />
                    <InfoIfExists label="Product Name" value={product?.product?.name} />
                </div>


            </Card>
            <Card className="p-3">

               <h3 className="text-sm font-semibold text-slate-700 mb-3">
                             Technical Details
                </h3>
                <div className="space-y-1">
                    <InfoIfExists label="HSN Code" value={product?.hsn} />
                    <InfoIfExists label="GST (%)" value={`${product?.gst}%`} />
                    <InfoIfExists
                        label="Product Type"
                        value={
                            product?.type === "product"
                                ? "Product"
                                : product?.type === "composite"
                                    ? "Composite"
                                    : ""
                        }
                    />
                    <InfoIfExists label="Measurement" value={product?.measurement} />
                    <InfoIfExists label="Store" value={product?.store} />
                    <InfoIfExists label="Product Tag" value={product?.tag} />
                </div>
            </Card>
            {/* RIGHT CARD — PRICING & INVENTORY */}
            <Card className="p-3">
               <h3 className="text-sm font-semibold text-slate-700 mb-3">
                             Stock Summary
                </h3>
                <div className="space-y-1">
                    <InfoIfExists
                        label="In Stock"
                        value={product?.stock_summary?.in_stock?.toLocaleString("en-IN")}
                    />
                    <InfoIfExists
                        label="On Sale"
                        value={product?.stock_summary?.on_sale}
                    />
                    <InfoIfExists
                        label="Total In Stock"
                        value={product?.stock_summary?.total_in_stock?.toLocaleString(
                            "en-IN"
                        )}
                    />
                    <InfoIfExists
                        label="Total Sold"
                        value={product?.stock_summary?.total_sold}
                    /></div>
            </Card>
            <Card className="p-3">
               <h3 className="text-sm font-semibold text-slate-700 mb-3">
                             Pricing & Inventory
                </h3>

                {/* PRICING */}
                <div className="space-y-1">
                    <InfoIfExists
                        label="Sale Price"
                        value={`₹ ${product?.salePrice?.toLocaleString("en-IN")}`}
                    />
                    <InfoIfExists
                        label="Purchase Price"
                        value={`₹ ${product?.purchasePrice?.toLocaleString("en-IN")}`}
                    />
                </div>

                {/* STOCK */}


            </Card>

        </div>
    );
}