import { useState, useEffect, useRef, useMemo } from "react";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Customer, type Vehicle, JobServiceOption, JobCard, option, ServiceCard, JobCardFormUnion, storeFormApi, TransferProductFormValues } from "@/lib/types";
import {
    User,
    Phone,
    Mail,
    Car,
    Key,
    MapPin,
    Calculator,
    Search,
    Plus,
    UserPlus,
    CheckCircle,
    ArrowRight,
    DollarSign,
    Percent,
    Receipt,
    Clock,
    Loader2,
    ChevronLeft,
    Check
} from "lucide-react";
import { z } from "zod";
import POSLayout from "@/components/layout/pos-layout";
import InlineCustomerForm from "@/components/forms/inline-customer-form";
import ServiceHistoryPanel from "@/components/customer/service-history-panel";
import { useLocation, useSearchParams } from "wouter";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { SectionCard } from "@/components/common/card";
import { Loader } from "@/components/common/loader";
import { FloatingDateField } from "@/components/common/FloatingDateField";
import { cn, findIdByName } from "@/lib/utils";
import { consumerSave, consumerUpdate, fetchCityList, fetchOrganizationsList, fetchStateList, fetchStoreById, fetchStoreCrispList, fetchStoresList, getJobCardItem, getServiceOptionByTypeVehicle, jobCardMetaInfo, jobCardModelInfo, jobFormSubmission, lookupCustomerByPhone } from "@/lib/api";
import { JobCardOnlySchema, NewJobCardSchema, TransferProductSchema } from "@/lib/schema";
import { useAuth } from "@/lib/auth";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { decryptQuery } from "@/lib/crypto";
import { brandOptions, categoryOptions, mockProducts } from "@/lib/mockData";

export default function TransferProductForm() {
    const [step, setStep] = useState(1);
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
    const selectedStoreId = form.watch("store_id");


    const { toast } = useToast();
    const { countries } = useAuth();
    useEffect(() => {

        setCountryList(countries)
    }, [countries])

    const [services, setServices] = useState<ServiceCard[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [customerFound, setCustomerFound] = useState<boolean | null>(null);
    const disablePhone = customerFound === true;
    const [countryList, setCountryList] = useState<
        { id: number; name: string; slug?: string }[]
    >([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [gstStates, setGstStates] = useState<any[]>([]);
    const [gstCities, setGstCities] = useState<any[]>([]);
    const [loadingGstState, setLoadingGstState] = useState(false);
    const [loadingGstCity, setLoadingGstCity] = useState(false);

    const [meta, setMeta] = useState({
        vehicleCompanies: [] as option[],
        vehicleModels: [] as option[],

        vehicleTypes: [] as option[],
        serviceTypes: [] as option[],
        years: [] as option[],
        srsCondition: [] as option[],

        loadingModels: false,
    });
    const isGstHydratingRef = useRef(false);
    const { user, } = useAuth();
    const toSelectOptions = <T extends { value: any; label: string }>(
        list: T[] = []
    ) =>
        list.map(item => ({
            label: item.label,
            value: String(item.value), // 🔑 force string
        }));
    useEffect(() => {
        const loadMeta = async () => {
            const data = await jobCardMetaInfo();
            if (!data) return;
            const value = {

                vehicleCompanies: toSelectOptions(data.vehicleCompanies),
                vehicleTypes: toSelectOptions(data.vehicleTypes),
                serviceTypes: toSelectOptions(data.serviceTypes),
                years: toSelectOptions(data.years),
                srsCondition: toSelectOptions(data.srsCondition),
            }

            setMeta(prev => (({ ...prev, ...value })));
        };

        loadMeta();
    }, []);

    const [initialValues, setInitialValues] = useState<any | null>(null)
    const fetchJobFormInfo = async () => {
        try {
            setIsInfoLoading(true);
            const res =
                await getJobCardItem({ id: id ?? "" });

            setInitialValues(res)
        } catch (e) {
            console.error(e);

        } finally {
            setIsInfoLoading(false);
        }
    };
    useEffect(() => {
        if (id) {
            fetchJobFormInfo();

        }
    }, [id]);


    const onSubmit = (data: TransferProductFormValues) => {
    };
    const [isJobCardSubmissionDeleteModalInfo, setIsJobCardSubmissionModalOpenInfo] = useState<{ open: boolean, info: any }>({
        open: false,
        info: {}
    });

    const isAdmin =
        user?.role === "admin" || user?.role === "super-admin";


    const isHydratingJobRef = useRef(false);
    async function handleJobCardSubmission(values: TransferProductFormValues) {
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
    const customerMobile = form.watch("phone");
    const store_id = form.watch("store_id");


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
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // src/lib/productUtils.ts

    const getProductsByBrand = (
        products: any[],
        category: string,
        brand: string
    ) => {
        console.log(products, category, brand, 'brandbrand');

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
        console.log('stay outside');

        if ((!mode)) {
            console.log('came inside mode');

            const hydrateLocation = async () => {
                try {
                    const countryId = findIdByName(countryList, '101');
                    console.log(countryId, countryList, 'countryId');

                    if (!countryId) return;

                    const stateList = await fetchStateList(countryId);
                    console.log(stateList, 'stateList');

                    setStates(stateList);

                } catch (e) {
                    console.error(e)
                }
            };
            hydrateLocation()
        }


    }, [mode, initialValues, countryList]);

    const fetchStoreInfo = async (id: string) => {
        try {
            setIsLookingUp(true)
            const res =
                await fetchStoreById(id);

            console.log(res, 'mappedStores');
            const info = res?.data
            if (Object.keys(res?.data).length > 0) {
                form.setValue("name", info?.name);
                form.setValue("phone", info?.phone);

                form.setValue("email", info?.email);
                form.setValue("address", info?.registered_address);

                form.setValue("shipping_address", info?.shipping_address);
                form.setValue("organization", String(info?.organization?.id));
                form.setValue("state_id", String(info?.state));

                form.setValue("transfer_date", new Date()
                    .toISOString()
                    .split("T")[0]);
            }
        } catch (e) {
            console.error(e);

        } finally {
            setIsLookingUp(false)
        }
    };

    const [organization, setOrganizations] = useState<Array<any>>([]);
    const fetchOrganizations = async (isLoaderHide = false) => {
        try {
            const res =
                await fetchOrganizationsList({
                });
            const mappedUsers = res.data
            console.log(mappedUsers, res, 'mappedUsers');

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
                                                <SectionCard title="Item Information" className="pb-3 p-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
                                                        <FloatingRHFSelect
                                                            name="category"
                                                            label="Category"
                                                            isRequired
                                                            control={form.control}
                                                            options={categoryOptions}
                                                            onValueChange={() => {
                                                                form.resetField("brand");
                                                                form.resetField("product_id");
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
                                                                const category = form.getValues("category");
                                                                const products = getProductsByBrand(mockProducts, category, brand as string);
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
                                                                const product = mockProducts.find(p => String(p.id) === id);
                                                                if (!product) return;

                                                                setSelectedProduct(product);
                                                                console.log(product, 'productproduct');

                                                                form.setValue("in_stock", product.available);
                                                                form.setValue("measurement", product.uom);

                                                                form.setValue("qty", '1');
                                                                form.setValue("rate", product.salePrice);
                                                                form.setValue("description", product.description);
                                                                form.clearErrors("qty");
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
                                                            name="qty"
                                                            label="Qty"
                                                            isRequired
                                                            control={form.control}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                if (val > selectedProduct.available) {
                                                                    form.setError("qty", {
                                                                        message: `Max available stock is ${selectedProduct.available}`,
                                                                    });
                                                                } else {
                                                                    form.clearErrors("qty");
                                                                }
                                                            }}
                                                        />
                                                        <FloatingTextarea
                                                            control={form.control}
                                                            isView
                                                            name="description"
                                                            label="Description"
                                                        />

                                                    </div>



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
                                        onClick={() => navigate("/job-cards")}
                                    >
                                        {'Cancel'}
                                    </Button>

                                    {(
                                        <Button type="button"
                                            disabled={isLoading || isInfoLoading}
                                            onClick={form.handleSubmit(handleJobCardSubmission,)}
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