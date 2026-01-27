import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { option, ServiceCard, TransferProductFormValues } from "@/lib/types";
import {
    Loader2,
    ChevronLeft,
    Info,
    Trash2
} from "lucide-react";
import { useLocation, useSearchParams } from "wouter";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { SectionCard } from "@/components/common/card";
import { Loader } from "@/components/common/loader";
import { FloatingDateField } from "@/components/common/FloatingDateField";
import { findIdByName } from "@/lib/utils";
import { fetchOrganizationsList, fetchStateList, fetchStoreById, fetchStoreCrispList, getJobCardItem, jobCardMetaInfo } from "@/lib/api";
import { TransferProductSchema } from "@/lib/schema";
import { useAuth } from "@/lib/auth";
import { decryptQuery } from "@/lib/crypto";
import { brandOptions, categoryOptions, mockProducts } from "@/lib/mockData";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton } from "@chakra-ui/react";

export default function TransferProductForm() {
    const [, navigate] = useLocation();
    const lastFetchedStoreIdRef = useRef<string | null>(null);

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const encryptedStoreId = searchParams.get("store_id");

    const paramStoreId = encryptedStoreId
        ? decryptQuery(decodeURIComponent(encryptedStoreId))
        : null;
    const paramPhone = searchParams.get("phone");
    const mode = searchParams.get("mode");
    const isView = mode === "view";

    const [isInfoLoading, setIsInfoLoading] = useState(false);

    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);


    const form = useForm<TransferProductFormValues>({
        resolver: zodResolver(TransferProductSchema),
        defaultValues: {
            store_id: "",
            name: "",
            phone: "",
            email: "",
            address: "",
            shipping_address: "",
            organization: "",
            transfer_date: "",

            category: "",
            brand: "",
            product_id: "",
            measurement: "",
            in_stock: 0,
            rate: 0,
            qty: "",
            description: "",
        },
    });


    const { toast } = useToast();
    const { countries } = useAuth();
    useEffect(() => {

        setCountryList(countries)
    }, [countries])

    const [isLookingUp, setIsLookingUp] = useState(false);
    const [countryList, setCountryList] = useState<
        { id: number; name: string; slug?: string }[]
    >([]);
    const [states, setStates] = useState<any[]>([]);

    const [meta, setMeta] = useState({
        vehicleCompanies: [] as option[],
        vehicleModels: [] as option[],

        vehicleTypes: [] as option[],
        serviceTypes: [] as option[],
        years: [] as option[],
        srsCondition: [] as option[],

        loadingModels: false,
    });
    const { user, } = useAuth();

    function addProductHandler() {
        const v = form.getValues();

        if (!v.category) {
            form.setError("category", { message: "Select category first" });
            return;
        }
        if (!v.brand) {
            form.setError("brand", { message: "Select brand first" });
            return;
        }
        if (!v.product_id) {
            form.setError("product_id", { message: "Select product first" });
            return;
        }
        if (!v.measurement) {
            form.setError("measurement", { message: "Measurement missing" });
            return;
        }

        const qty = Number(v.qty);
        if (!qty || qty < 1) {
            form.setError("qty", { message: "Qty must be greater than 0" });
            return;
        }
        if (qty > selectedProduct.available) {
            form.setError("qty", {
                message: `Max available stock is ${selectedProduct.available}`,
            });
            return;
        }

        // duplicate check
        if (productFormList.some(p => p.id === selectedProduct.id)) {
            toast({
                title: "Already added",
                description: "This product is already in the list",
                variant: "destructive",
            });
            return;
        }

        setProductFormList(prev => [
            ...prev,
            {
                id: selectedProduct.id,
                product: selectedProduct.product,
                uom: selectedProduct.uom,
                available: selectedProduct.available,
                salePrice: selectedProduct.salePrice,
                qty: String(qty),
            },
        ]);

        form.resetField("category");
        form.resetField("brand");
        form.resetField("product_id");
        form.resetField("measurement");
        form.resetField("qty");
        form.resetField("rate");
        form.resetField("description");
        form.resetField("in_stock");
    }

    const onSubmit = () => {
    };

    const isAdmin =
        user?.role === "admin" || user?.role === "super-admin";


    async function handleTransferProductSubmission(values: TransferProductFormValues) {


        setIsLoading(true);

        try {

            toast({
                title: !mode ? "Transfer Stock Created" : "Transfer Stock Updated",
                description: !mode ? "Transfer stock created successfully" : "Transfer stock updated successfully",
                variant: "success",
            });


        } catch (err: any) {
            const apiErrors = err?.response?.data?.errors;


            // 👇 THIS IS THE KEY PART
            if (apiErrors && err?.response?.status === 422) {
                Object.entries(apiErrors).forEach(([field, messages]) => {
                    form.setError(field as any, {
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
    }
    const paramsHydratedRef = useRef(false);

    useEffect(() => {
        // prevent re-run
        if (paramsHydratedRef.current) return;

        // nothing to hydrate
        if (!paramPhone && !paramStoreId) return;

        // 1️⃣ set store first (important for admin lookup)
        if (paramStoreId) {
            form.setValue("store_id", String(paramStoreId), {
                shouldDirty: true,
                shouldValidate: true,
            });
        }

        paramsHydratedRef.current = true;
    }, [paramPhone, paramStoreId, form]);


    const [storeList, setStoreList] = useState<
        { value: string; label: string; isDisabled?: boolean }[]
    >([]);
    const fetchStoreList = async () => {
        try {
            const res = await fetchStoreCrispList();

            let options = res.data.map((store: any) => ({
                value: String(store.id),
                label: store.name,
            }));


            setStoreList(options);
        } catch (e) {
            console.error(e);
        }
    };
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // src/lib/productUtils.ts

    const getProductsByBrand = (
        products: any[],
        category: string,
        brand: string
    ) => {

        return products.filter(
            p => p.category === category && p.brand === brand && p.visibility === 1
        );
    }

    useEffect(() => {
        if (isAdmin) {
            fetchStoreList();
        }
    }, [isAdmin]);
    useEffect(() => {

        if ((!mode)) {

            const hydrateLocation = async () => {
                try {
                    const countryId = findIdByName(countryList, '101');

                    if (!countryId) return;

                    const stateList = await fetchStateList(countryId);

                    setStates(stateList);

                } catch (e) {
                    console.error(e)
                }
            };
            hydrateLocation()
        }


    }, [mode, countryList]);

    const fetchStoreInfo = async (id: string) => {
        try {
            setIsLookingUp(true);

            const res = await fetchStoreById(id);
            const info = res?.data;

            if (info && Object.keys(info).length > 0) {
                form.setValue("name", info.name, { shouldValidate: true });
                form.setValue("phone", info.phone, { shouldValidate: true });
                form.setValue("email", info.email, { shouldValidate: true });
                form.setValue("address", info.registered_address, { shouldValidate: true });
                form.setValue("shipping_address", info.shipping_address, { shouldValidate: true });
                form.setValue("organization", String(info.organization?.id), { shouldValidate: true });
                form.setValue("state_id", String(info.state), { shouldValidate: true });
                form.setValue(
                    "transfer_date",
                    new Date().toISOString().split("T")[0],
                    { shouldValidate: true }
                );

                // 🔑 CLEAR ERRORS FOR THESE FIELDS
                form.clearErrors([
                    "name",
                    "phone",
                    "email",
                    "address",
                    "shipping_address",
                    "organization",
                    "state_id",
                    "transfer_date",
                ]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLookingUp(false);
        }
    };

    const [organization, setOrganizations] = useState<Array<any>>([]);
    const fetchOrganizations = async (isLoaderHide = false) => {
        try {
            const res =
                await fetchOrganizationsList({
                });
            const mappedUsers = res.data

            setOrganizations(mappedUsers);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchOrganizations(false);
    }, []);
    useEffect(() => {
        if (!form.watch("store_id")) {
            lastFetchedStoreIdRef.current = null;
        }
    }, [form.watch("store_id")]);
    const [productFormList, setProductFormList] = useState<{
        id: string
        product: string,
        uom: string
        available: string
        salePrice: string
        qty: string

    }[]>([])
    function removeProduct(planId: number) {
        setProductFormList((prev: any) => prev.filter((p: any) => p.id !== planId));
    }

    const [planErrors, setPlanErrors] = useState<Record<string, string>>({});

    const getPlanCellError = (rowIndex: number, field: string) => {
        return planErrors[`items.${rowIndex}.${field}`];
    };
    const CellError = ({ message }: { message?: string }) => {
        if (!message) return null;

        return (
            <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 group " title={message}>
                <Info className="w-3 h-3 text-red-500 cursor-pointer" />

            </div>
        );
    };
    const clearPlanCellError = (rowIndex: number, field: string) => {
        setPlanErrors(prev => {
            const next = { ...prev };
            delete next[`items.${rowIndex}.${field}`];
            return next;
        });
    };
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
                render: (_: any, row: any, rowIndex: number) => {
                    const error = getPlanCellError(rowIndex, "qty");

                    return (
                        <div className="relative flex justify-center">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={row.qty}
                                className={`
            w-16 border rounded px-1 py-0.5 text-xs text-center
            ${error ? "border-red-500" : ""}
          `}
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, "");

                                    // allow empty while typing
                                    if (value === "") {
                                        setProductFormList(prev =>
                                            prev.map(p =>
                                                p.id === row.id ? { ...p, qty: "" } : p
                                            )
                                        );
                                        return;
                                    }

                                    let qty = Number(value);
                                    const available = Number(row.available);

                                    // ❌ qty < 1 → keep error
                                    if (qty < 1) {

                                        qty = 1;
                                    }

                                    // ❌ qty > available → keep error
                                    else if (qty > available) {

                                        qty = available; // 🔒 cap
                                    }

                                    // ✅ qty valid → NOW remove error
                                    else {
                                        clearPlanCellError(rowIndex, "qty");
                                    }

                                    setProductFormList(prev =>
                                        prev.map(p =>
                                            p.id === row.id
                                                ? { ...p, qty: String(qty) }
                                                : p
                                        )
                                    );
                                }}

                                onBlur={() => {
                                    let qty = Number(row.qty);
                                    const available = Number(row.available);

                                    if (!qty || qty < 1) qty = 1;
                                    if (qty > available) qty = available;

                                    setProductFormList(prev =>
                                        prev.map(p =>
                                            p.id === row.id
                                                ? { ...p, qty: String(qty) }
                                                : p
                                        )
                                    );
                                }}
                            />

                            <CellError message={error} />
                        </div>
                    );
                },
            },
            {
                key: "action",
                label: "Action",
                width: "150px",
                render: (_: any, row: any) => (
                    <Box className="gap-3">
                        <IconButton
                            size="xs"
                            mr={2}
                            colorScheme="red"
                            // disabled={plans.length <= 1}
                            title="Delete"
                            aria-label="Delete"
                            onClick={() => removeProduct(row.id)}
                        >
                            <Trash2 size={16} />
                        </IconButton>
                    </Box>
                ),
            },


        ];
    }, [
        isView,
        productFormList.length,
        setProductFormList,
        removeProduct,
    ]);
    useEffect(() => {
        form.setValue(
            "items",
            productFormList.map(p => ({
                product_id: String(p.id),
                qty: Number(p.qty),
            })),
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        );
    }, [productFormList, form]);

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
    return (
        <>
            <div className=" mx-auto px-3 sm:px-3 py-3 space-y-3">
                {/* HEADER */}
                <div className="grid grid-cols-1">
                    <div className="inline-flex items-center gap-4">
                        <button
                            onClick={() => {
                                localStorage.removeItem('sidebar_active_parent')
                                window.history.back()
                            }}
                            disabled={isLoading || isInfoLoading}
                            className="text-muted-foreground hover:text-foreground "
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold">
                                {isView ? "View Transfer Stock" : id ? "Edit Transfer Stock" : "Create Transfer Stock"}
                            </h1>

                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 rounded-xl ">



                    {/* Main Job Creation Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="">
                            {
                                isInfoLoading && id ?
                                    <Card className="mb-4">
                                        <div className="min-h-[150px] flex justify-center items-center">
                                            <div className="p-4 text-sm "><Loader /></div>
                                        </div>
                                    </Card>
                                    : <div className="flex flex-col gap-4">
                                        {(mode !== "view" && mode !== 'edit') && <>

                                            <>
                                                {<Card>

                                                    {/* Customer Lookup Section */}
                                                    <SectionCard title="Store Information" className="pb-4">

                                                        {/* STORE SELECT — ALWAYS VISIBLE */}
                                                        {isAdmin && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="flex flex-col gap-2">
                                                                <FloatingRHFSelect
                                                                    name="store_id"
                                                                    label="Select Store"
                                                                    control={form.control}
                                                                    isRequired
                                                                    options={storeList}
                                                                    onValueChange={(storeId) => {
                                                                        const id = String(storeId);

                                                                        // 🛑 prevent duplicate API call
                                                                        if (lastFetchedStoreIdRef.current === id) {
                                                                            return;
                                                                        }

                                                                        lastFetchedStoreIdRef.current = id;
                                                                        fetchStoreInfo(id);
                                                                    }}
                                                                />
                                                                {isLookingUp && (
                                                                    <span className="text-muted-foreground text-xs flex items-center gap-2">
                                                                        <Loader2 className="animate-spin h-4 w-4" />
                                                                        Loading…
                                                                    </span>
                                                                )}
                                                            </div>

                                                        </div>}
                                                        {isAdmin && form.watch("store_id") && !isLookingUp && (
                                                            <Separator className="my-6" />
                                                        )}
                                                        {/* STORE DETAILS — ONLY AFTER STORE IS SELECTED */}
                                                        {form.watch("store_id") && !isLookingUp && (
                                                            <>
                                                                {/* BASIC INFO */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                                    <FloatingField
                                                                        name="name"
                                                                        label="Name"
                                                                        isDisabled
                                                                        isRequired
                                                                        control={form.control}
                                                                    />

                                                                    <FloatingField
                                                                        name="phone"
                                                                        label="Mobile No"
                                                                        isDisabled
                                                                        isRequired
                                                                        control={form.control}
                                                                    />

                                                                    <FloatingField
                                                                        name="email"
                                                                        label="Email"
                                                                        isDisabled
                                                                        isRequired
                                                                        control={form.control}
                                                                    />
                                                                </div>

                                                                {/* META INFO */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                                    <FloatingRHFSelect
                                                                        name="organization"
                                                                        label="Select Organization"
                                                                        isRequired
                                                                        control={form.control}
                                                                        options={organization.map(s => ({
                                                                            value: String(s.id),
                                                                            label: s.company_name,
                                                                        }))}
                                                                    />

                                                                    <FloatingDateField
                                                                        name="transfer_date"
                                                                        label="Transfer Date"
                                                                        isRequired
                                                                        control={form.control}
                                                                    />

                                                                    <FloatingRHFSelect
                                                                        name="state_id"
                                                                        label="State"
                                                                        isDisabled
                                                                        isRequired
                                                                        control={form.control}
                                                                        options={states.map(s => ({
                                                                            value: String(s.id),
                                                                            label: s.name,
                                                                        }))}
                                                                    />
                                                                </div>

                                                                {/* ADDRESSES */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                                    <FloatingTextarea
                                                                        name="address"
                                                                        label="Address"
                                                                        isView
                                                                        isRequired
                                                                        control={form.control}
                                                                    />

                                                                    <FloatingTextarea
                                                                        name="shipping_address"
                                                                        label="Shipping Address"
                                                                        isView
                                                                        isRequired
                                                                        control={form.control}
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </SectionCard>
                                                </Card>}
                                            </>
                                        </>}
                                        {form.watch("store_id") && !isLookingUp && <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">


                                            {/* Vehicle Information */}
                                            <Card>
                                                <SectionCard
                                                    title={
                                                        <div className="flex items-center gap-2">
                                                            <span>Item Details</span>

                                                        </div>
                                                    }
                                                >

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
                                                        <FloatingRHFSelect
                                                            name="category"
                                                            label="Category"
                                                            isRequired
                                                            control={form.control}
                                                            options={categoryOptions}
                                                            onValueChange={() => {
                                                                form.clearErrors("category"); // 🔑
                                                                form.resetField("product_id");
                                                                form.resetField("measurement");
                                                                form.resetField("qty");
                                                                form.resetField("rate");
                                                                form.resetField("description");
                                                                form.resetField("in_stock");
                                                                setFilteredProducts([]);
                                                                setSelectedProduct(null);
                                                            }}
                                                        />
                                                        <FloatingRHFSelect
                                                            name="brand"
                                                            label="Brand Name"
                                                            isRequired
                                                            isDisabled={!form.watch("category")}
                                                            control={form.control}
                                                            options={brandOptions}
                                                            onValueChange={(brand) => {
                                                                form.clearErrors("brand"); // 🔑
                                                                form.resetField("product_id");
                                                                form.resetField("measurement");
                                                                form.resetField("qty");
                                                                form.resetField("rate");
                                                                form.resetField("description");
                                                                form.resetField("in_stock");
                                                                const category = form.getValues("category");
                                                                const products = getProductsByBrand(
                                                                    mockProducts,
                                                                    category ?? "",
                                                                    brand as string
                                                                );
                                                                setFilteredProducts(products);
                                                            }}
                                                        />
                                                        <FloatingRHFSelect
                                                            name="product_id"
                                                            label="Product Name"
                                                            isRequired
                                                            isDisabled={!form.watch("brand")}
                                                            control={form.control}
                                                            options={filteredProducts.map(p => ({
                                                                label: p.product,
                                                                value: String(p.id),
                                                            }))}
                                                            onValueChange={(id) => {
                                                                form.clearErrors("product_id"); // 🔑
                                                                form.resetField("measurement");
                                                                form.resetField("qty");
                                                                form.resetField("rate");
                                                                form.resetField("description");
                                                                form.resetField("in_stock");

                                                                const product = mockProducts.find(p => String(p.id) === id);
                                                                if (!product) return;

                                                                setSelectedProduct(product);

                                                                form.setValue("in_stock", product.available);
                                                                form.setValue("measurement", product.uom);
                                                                form.setValue("qty", "1");
                                                                form.setValue("rate", product.salePrice);
                                                                form.setValue("description", product.description);
                                                            }}
                                                        />
                                                        <FloatingRHFSelect
                                                            name="measurement"
                                                            label="Measurement"
                                                            isDisabled={!form.watch("category")}
                                                            control={form.control}
                                                            options={[{
                                                                label: '100 ML', value: "ml"
                                                            }]}

                                                        />
                                                        {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

                                                     
                                                    </div> */}
                                                        <FloatingField
                                                            name="rate"
                                                            control={form.control}
                                                            label="Rate"
                                                            isDisabled
                                                        />

                                                        <FloatingField
                                                            name="in_stock"
                                                            control={form.control}
                                                            label="In Stock"
                                                            isDisabled
                                                        />

                                                        <FloatingField

                                                            isDisabled={!form.watch("product_id")}
                                                            name="qty"
                                                            label="Qty"
                                                            isRequired
                                                            control={form.control}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);

                                                                if (selectedProduct && val > selectedProduct.available) {
                                                                    form.setError("qty", {
                                                                        message: `Max available stock is ${selectedProduct.available}`,
                                                                    });
                                                                } else {
                                                                    form.clearErrors("qty"); // 🔑
                                                                }
                                                            }}
                                                        />

                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pb-4">
                                                        <FloatingTextarea
                                                            control={form.control}
                                                            isView
                                                            minH='36px'
                                                            name="description"
                                                            label="Description"
                                                        />

                                                        <Button type="button" size="sm" onClick={addProductHandler} className="w-fit">
                                                            Add Item
                                                        </Button>
                                                    </div>
                                                    {productFormList.length > 0 && (
                                                        <div className="flex flex-col ">
                                                            <div className="">
                                                                <div className="flex items-center justify-between ">
                                                                    <h4 className="text-sm font-semibold text-gray-700">
                                                                        Transfer Items
                                                                    </h4>

                                                                </div>

                                                                <CommonTable
                                                                    columns={productColumns}
                                                                    data={productFormList}
                                                                    searchable={false}
                                                                    isAdd={false}
                                                                    isTotal={false}
                                                                    isLoading={false}
                                                                    total={productFormList.length}
                                                                />
                                                            </div>

                                                            {productFormList.length > 0 && (
                                                                <div className="flex md:justify-end my-4">
                                                                    <div className="w-[300px] text-xs space-y-2">

                                                                        <div className="flex justify-between">
                                                                            <span className="text-muted-foreground">
                                                                                Total Items :
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                {totalCounter.totalItems}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex justify-between">
                                                                            <span className="text-muted-foreground">
                                                                                Sub Total Amount:
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                ₹ {totalCounter.subTotal}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex justify-between font-semibold border-t pt-2">
                                                                            <span>Grand Total :</span>
                                                                            <span>
                                                                                ₹ {totalCounter?.grandTotal}
                                                                            </span>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            )}

                                                        </div>
                                                    )}



                                                </SectionCard>

                                            </Card>


                                        </div>}
                                    </div>}
                            {mode !== 'view' &&
                                <div className="  pb-3 flex justify-end gap-4 mt-3">
                                    <Button
                                        variant="outline"
                                        disabled={isLoading || isInfoLoading}
                                        className={'hover:bg-[#E3EDF6] hover:text-[#000] h-8 text-xs'}
                                        onClick={() => navigate("/products")}
                                    >
                                        {'Cancel'}
                                    </Button>

                                    {(
                                        <Button type="button"
                                            disabled={isLoading || isInfoLoading}
                                            onClick={form.handleSubmit(
                                                handleTransferProductSubmission,
                                                (errors) => {
                                                    // 🔥 items error → show toast
                                                    if (errors.items && form.watch("store_id")) {
                                                        toast({
                                                            title: "Product Item Required",
                                                            description: "Please add at least one product before submitting",
                                                            variant: "info",
                                                        });
                                                    }
                                                }
                                            )}
                                            className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] h-8 text-xs">
                                            {isLoading && <Loader color="#fff" isShowLoadingText={false} />}
                                            {isLoading
                                                ? id ? "Updating..." : "Adding..."
                                                : id ? "Update " : "Add "}
                                        </Button>
                                    )}

                                </div>}
                        </form>
                    </Form>
                </div>

            </div>
        </>
    );
}