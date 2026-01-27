"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { SectionCard } from "@/components/common/card";
import { Loader } from "@/components/common/loader";
import { ProductSchema } from "@/lib/schema";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import { brandOptions, categoryOptions, measurementTypeOptions, productTagOptions, productTypeOptions, storeOptions } from "@/lib/mockData";
import { RichTextEditor } from "@/components/common/RichTextEditor";

export default function ProductForm() {

    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode");
    const isView = mode === "view";
    const [, navigate] = useLocation();
    const id = searchParams.get("id");
    const [isInfoLoading, setIsInfoLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            category_id: "",
            brand_id: "",
            product_name: "",
            hsn: "",
            gst: "",
            video_url: "",
            tag: "",
            store: "",
            type: "",

            measurement_type: "",
            measurement_value: "",
            purchase_price: "",
            sale_price: "",
            stock_qty: "",
            composite_items: "",
            variant_description: "",

            description: "",
            dimensions: "",
            features: "",
            images: [],
        },
    });
  const [imagePreview, setImagePreview] = useState<string[]>([]);
 const handleImages = (files: FileList | null) => {
    if (!files) return;

    const previews = Array.from(files).map(file =>
      URL.createObjectURL(file)
    );

    setImagePreview(previews);
    form.setValue("images", files as any);
  };
    return (
        <div className="mx-auto px-3 py-3 space-y-3">
            {/* HEADER */}
            <div className="inline-flex items-center gap-4">
                <button
                    onClick={() => {
                        localStorage.removeItem('sidebar_active_parent')
                        window.history.back()
                    }}

                    disabled={isLoading || isInfoLoading}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft size={18} />
                </button>
                <h1 className="text-lg font-semibold">
                    {isView ? "View Product" : id ? "Edit Product" : "Create New Product"}
                </h1>
            </div>
            <Form {...form}>
                <form className="space-y-4">

                    {/* BASIC INFO */}
                    <Card>
                        <SectionCard title="Product Information" className="pb-4">
                            <div className="grid md:grid-cols-4 gap-4">
                                <FloatingRHFSelect options={[]} name="category_id" label="Select Category" isRequired control={form.control} />
                                <FloatingRHFSelect name="category_id" label="Select Category" isRequired control={form.control} options={categoryOptions} />
                                <FloatingRHFSelect name="brand_id" label="Brand" isRequired control={form.control} options={brandOptions} />
                                <FloatingField name="hsn" label="HSN Code" control={form.control} />

                                <FloatingField name="gst" label="GST" control={form.control} />
                                <FloatingField name="video_url" label="Video URL" control={form.control} />
                                <FloatingRHFSelect name="tag" label="Product Tag" isRequired control={form.control} options={productTagOptions} />
                                <FloatingRHFSelect name="store" label="Product For / Store" isRequired control={form.control} options={storeOptions} />
                                <FloatingRHFSelect name="type" label="Product Type" isRequired control={form.control} options={productTypeOptions} />
                            </div>
                        </SectionCard>
                    </Card>

                    {/* VARIANT */}
                    <Card>
                        <SectionCard className="pb-4" title="Variant / Measurement">
                            <div className="grid md:grid-cols-4 gap-3">
                                <FloatingRHFSelect name="measurement_type" label="Measurement Type" isRequired control={form.control} options={measurementTypeOptions} />
                                <FloatingField name="measurement_value" label="Measurement Value" isRequired control={form.control} />
                                <FloatingField name="purchase_price" label="Purchase Price" isRequired control={form.control} />
                                <FloatingField name="sale_price" label="Sales Price" isRequired control={form.control} />
                                <FloatingField name="stock_qty" label="Stock Qty" isRequired control={form.control} />
                                <FloatingTextarea name="composite_items" label="Composite Items" control={form.control} />
                                <FloatingTextarea name="variant_description" label="Description" isRequired control={form.control} />
                            </div>
                        </SectionCard>
                    </Card>

                    {/* DESCRIPTION */}
                    <Card>
                        <SectionCard className="pb-4" title="Product Description">
                            <RichTextEditor name="description" label="Product Description" isRequired control={form.control} />

                        </SectionCard>
                    </Card>

                    {/* DIMENSIONS & FEATURES */}
                    <Card>
                        <SectionCard className="pb-4" title="More Details">
                            <div className="grid md:grid-cols-2 gap-4">
                                <RichTextEditor name="dimensions" label="Product Dimensions" control={form.control} />
                                <RichTextEditor name="features" label="Product Features" control={form.control} />
                            </div>
                        </SectionCard>
                    </Card>

                    {/* IMAGES */}
                      <Card>
            <SectionCard className="pb-4" title="Product Images">
              <input type="file" multiple onChange={(e) => handleImages(e.target.files)} />
              <div className="grid grid-cols-6 gap-3 mt-3">
                {imagePreview.map((src, i) => (
                  <img key={i} src={src} className="h-24 w-full object-contain border rounded" />
                ))}
              </div>
            </SectionCard>
          </Card>

                    {/* ACTIONS */}
                    {/* ACTIONS */}
                    {mode !== 'view' && <div className="">
                        <div className="  flex justify-end gap-3">
                            <Button
                                variant="outline"
                                disabled={isLoading || isInfoLoading}
                                className={'hover:bg-[#E3EDF6] hover:text-[#000] h-8 text-xs'}
                                onClick={() => navigate("/master")}
                            >
                                {'Cancel'}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || isInfoLoading}
                                className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] h-8 text-xs"
                            >
                                {isLoading && <Loader isShowLoadingText={false} color="#fff" />}
                                {isLoading
                                    ? id ? "Updating..." : "Adding..."
                                    : id ? "Update " : "Add "}
                            </Button>
                        </div></div>}

                </form>
            </Form>
        </div>
    );
}
