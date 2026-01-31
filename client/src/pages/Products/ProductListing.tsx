// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteTerritory, DeleteUser, EditUser, fetchUserList, getConsumer, ProductCountHelper, SaveUser, UpdateProductStatus, UpdateTerritoryStatus, UpdateUserStatus } from "@/lib/api";
import { ProductFormType, ProductModalInfo, TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Badge, Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon, Trash2 } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { brandOptions, categoryOptions, customerMockData, filterMetaInfo, mockProducts, productTypeOptions, storeOptions, territoryMasterMockData } from "@/lib/mockData";
import CommonRowMenu from "@/components/common/CommonRowMenu";
import { Kpi } from "../Customer/DashboardCards";
import ProductSellStockCountHandlerModal from "./ProductSellStockCountHandlerModal";

export default function ProductsListing() {
    const { toast } = useToast();

    const { roles } = useAuth();
    const [products, setProducts] = useState(mockProducts);
    const [productListingModalInfo, setProductListingModalInfo] = useState<ProductModalInfo>({
        open: false,
        info: {},
        type: "",
        subOpnType: ""
    });
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [has_next, setHasNext] = useState(false)
    const [, navigate] = useLocation();
    const [filters, setFilters] = useState({
        brand: "",
        category: "",
        type: "",
        store: "",
        tag: "",
        status: "",
        visibility: "",
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
    const qtyBtnBase =
        "h-5 w-5 flex items-center justify-center rounded-full border text-xs font-semibold transition";
    const ProductStatusUpdateHandler = useCallback(
        async (row: any) => {
            const newValue = row.status === 1 ? 0 : 1;

            try {
                // optimistic UI update
                setProducts(prev =>
                    prev.map(p =>
                        p.id === row.id ? { ...p, status: newValue } : p
                    )
                );

                // await UpdateProductStatus({
                //     id: row.id,
                //     status: newValue,
                //     type: "status", // 👈 KEY
                // });

                toast({
                    title: "Status Updated",
                    description: "Product status updated successfully",
                    variant: "success",
                });
            } catch (err: any) {
                // rollback
                setProducts(prev =>
                    prev.map(p =>
                        p.id === row.id ? { ...p, status: row.status } : p
                    )
                );

                toast({
                    title: "Error",
                    description:
                        err?.response?.data?.message ||
                        err.message ||
                        "Failed to update status",
                    variant: "destructive",
                });
            }
        },
        []
    );

    const ProductVisibilityUpdateHandler = useCallback(
        async (row: any) => {
            const newValue = row.visibility === 1 ? 0 : 1;

            try {
                // optimistic UI update
                setProducts(prev =>
                    prev.map(p =>
                        p.id === row.id ? { ...p, visibility: newValue } : p
                    )
                );

                // await UpdateProductStatus({
                //     id: row.id,
                //     status: newValue,
                //     type: "visibility", // 👈 KEY
                // });

                toast({
                    title: "Visibility Updated",
                    description: "Product visibility updated successfully",
                    variant: "success",
                });
            } catch (err: any) {
                // rollback on failure
                setProducts(prev =>
                    prev.map(p =>
                        p.id === row.id ? { ...p, visibility: row.visibility } : p
                    )
                );

                toast({
                    title: "Error",
                    description:
                        err?.response?.data?.message ||
                        err.message ||
                        "Failed to update visibility",
                    variant: "destructive",
                });
            }
        },
        []
    );
    const canSellIncr = (row: any) =>
        row.totalQty - row.onSell > 0;

    const canSellDecr = (row: any) =>
        row.onSell > 0;

    const canStockIncr = (_row: any) =>
        true;

    const canStockDecr = (row: any) =>
        row.available > 0;
    const qtyBtnDisabled =
        "opacity-40 cursor-not-allowed hover:bg-transparent";

    const columns = useMemo(() => [
        {
            key: "createdAt",
            label: "Created On",
            align: "center",
            width: "160px",
            render: (_value: any) => (
                <Box className="flex flex-col justify-center items-center">
                    <span className="font-bold">{formatDate(_value)}</span>
                    <span className="text-sm text-gray-700">{formatTime(_value)}</span>
                </Box>
            ),
        },

        { key: "product", label: " Name", width: "200px" },

        {
            key: "brand",
            label: (
                <ColumnFilter
                    label="Brand"
                    value={filters.brand}
                    onChange={(val) => {
                        setFilters(f => ({ ...f, brand: val }));
                        setPage(1);
                    }}
                    options={[{ label: "All", value: "" }, ...filterMetaInfo.brand]}
                />
            ),
            width: "150px",
             render: (value: string) => (
                <span >
                    {brandOptions?.find(item => item.value === value)?.label}

                </span>
            ),
        },

        {
            key: "category",
            label: (
                <ColumnFilter
                    label="Category"
                    value={filters.category}
                    onChange={(val) => {
                        setFilters(f => ({ ...f, category: val }));
                        setPage(1);
                    }}
                    options={[{ label: "All", value: "" }, ...filterMetaInfo.category]}
                />
            ),
            width: "170px",
             render: (value: string) => (
                <span >
                    {categoryOptions?.find(item => item.value === value)?.label}

                </span>
            ),
        },

        {
            key: "type",
            label: (
                <ColumnFilter
                    label="Type"
                    value={filters.type}
                    onChange={(val) => {
                        setFilters(f => ({ ...f, type: val }));
                        setPage(1);
                    }}
                    options={[{ label: "All", value: "" }, ...filterMetaInfo.type]}
                />
            ),
            width: "130px",
  render: (value: string) => (
                <span >
                    {productTypeOptions?.find(item => item.value === value)?.label}

                </span>
            ),
        },

        {
            key: "store",
            label: (
                <ColumnFilter
                    label="Store"
                    value={filters.store}
                    onChange={(val) => {
                        setFilters(f => ({ ...f, store: val }));
                        setPage(1);
                    }}
                    options={[{ label: "All", value: "ALL" }, ...filterMetaInfo.store]}
                />
            ),
            width: "130px",
  render: (value: string) => (
                <span >
                    {storeOptions?.find(item => item.value === value)?.label}

                </span>
            ),
        },

        {
            key: "tag",
            label: (
                <ColumnFilter
                    label="P.Tag"
                    value={filters.tag}
                    onChange={(val) => {
                        setFilters(f => ({ ...f, tag: val }));
                        setPage(1);
                    }}
                    options={[{ label: "All", value: "" }, ...filterMetaInfo.tag]}
                />
            ),
            width: "120px",
            render: (value: string) => (
                <Badge
                    className={`px-3 py-1 text-xs font-medium rounded-full
    ${value === "best-seller"
                            ? "bg-[#1170e4 ]-100 text-[#1170e4 ]-700"
                            : value === "regular"
                                ? "bg-green-100 text-green-700"
                                : value === "upcoming"
                                    ? "bg-[#4ecc48]-100 text-[#4ecc48]-700"
                                    : value === "new"
                                        ? "bg-red-100 text-red-700"
                                        : value === "red-carpet"
                                            ? "bg-[#fd4a68]-100 text-[#fd4a68]-700"
                                            : "bg-emerald-100 text-emerald-700"
                        }
  `}


                >
                    {filterMetaInfo?.tag?.find(item => item.value === value)?.label}

                </Badge>
            ),

        },
        {
            key: "totalQty",
            label: "Total Qty",
            width: "120px",
            align: "center",
        },
        {
            key: "onSell",
            label: "On Sell",
            width: "100px",
            align: "center",
            render: (val: number, row: any) => {
                const disableDecr = !canSellDecr(row);
                const disableIncr = !canSellIncr(row);

                return (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            disabled={disableDecr}
                            className={`
            ${qtyBtnBase}
            border-rose-200 text-rose-600
            ${disableDecr ? qtyBtnDisabled : "hover:bg-rose-50"}
          `}
                            onClick={() =>
                                !disableDecr &&
                                setProductListingModalInfo({
                                    open: true,
                                    info: row,
                                    type: "sell",
                                    subOpnType: "Decr",
                                })
                            }
                        >
                            −
                        </button>

                        <span className="min-w-[24px] text-center text-sm font-medium text-slate-700">
                            {val}
                        </span>

                        <button
                            disabled={disableIncr}
                            className={`
            ${qtyBtnBase}
            border-emerald-200 text-emerald-600
            ${disableIncr ? qtyBtnDisabled : "hover:bg-emerald-50"}
          `}
                            onClick={() =>
                                !disableIncr &&
                                setProductListingModalInfo({
                                    open: true,
                                    info: row,
                                    type: "sell",
                                    subOpnType: "Incr",
                                })
                            }
                        >
                            +
                        </button>
                    </div>
                );
            },
        }
        ,

        {
            key: "available",
            label: "Available Stock",
            width: "100px",
            align: "center",
            render: (val: number, row: any) => {
                const disableDecr = !canStockDecr(row);
                const disableIncr = !canStockIncr(row);

                return (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            disabled={disableDecr}
                            className={`
            ${qtyBtnBase}
            border-rose-200 text-rose-600
            ${disableDecr ? qtyBtnDisabled : "hover:bg-rose-50"}
          `}
                            onClick={() =>
                                !disableDecr &&
                                setProductListingModalInfo({
                                    open: true,
                                    info: row,
                                    type: "stock",
                                    subOpnType: "Decr",
                                })
                            }
                        >
                            −
                        </button>

                        <span className="min-w-[24px] text-center text-sm font-medium text-slate-700">
                            {val}
                        </span>

                        <button
                            disabled={disableIncr}
                            className={`
            ${qtyBtnBase}
            border-emerald-200 text-emerald-600
            ${disableIncr ? qtyBtnDisabled : "hover:bg-emerald-50"}
          `}
                            onClick={() =>
                                !disableIncr &&
                                setProductListingModalInfo({
                                    open: true,
                                    info: row,
                                    type: "stock",
                                    subOpnType: "Incr",
                                })
                            }
                        >
                            +
                        </button>
                    </div>
                );
            },
        }
        ,
        {
            key: "visibility",
            label: (
                <ColumnFilter
                    label="Visibility"
                    value={filters.visibility}
                    onChange={(val) => {
                        setFilters(f => ({ ...f, visibility: val }));
                        setPage(1);
                    }}
                    options={[{ label: "All", value: "" }, ...filterMetaInfo.visibility]}
                />
            ),
            width: "120px",
            render: (val: number, row: any) => (
                <Switch.Root
                    checked={val === 1}
                    onCheckedChange={() => ProductVisibilityUpdateHandler(row)}
                >
                    <Switch.HiddenInput />
                    <Switch.Control
                        bg="#fca5a5"
                        _checked={{ bg: "#22c55e" }}
                    />
                </Switch.Root>
            ),
        }
        ,

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
                    options={[{ label: "All", value: "" }, ...filterMetaInfo.status]}
                />
            ),
            width: "110px",
            render: (val: number, row: any) => (
                <Switch.Root
                    checked={val === 1}
                    onCheckedChange={() => ProductStatusUpdateHandler(row)}
                >
                    <Switch.HiddenInput />
                    <Switch.Control
                        bg="#fca5a5"
                        _checked={{ bg: "#22c55e" }}
                    />
                </Switch.Root>
            ),
        }
        ,
    ], [filters, page]);


    const ProductCommonCountHandler = async (
        value: ProductFormType,
        setError: UseFormSetError<ProductFormType>
    ) => {
        try {
            setIsLoading(true);
            // await ProductCountHelper({
            //     id: productListingModalInfo.info.id,
            //     type: productListingModalInfo.type,
            //     info: {
            //         remarks: value.remarks,
            //         count: value.count
            //     },
            // });
            const count = Number(value.count);
            const { info, type, subOpnType } = productListingModalInfo;

            setProducts(prev =>
                prev.map(p => {
                    if (p.id !== info.id) return p;

                    let updated = { ...p };

                    // ---- SELL LOGIC ----
                    if (type === "sell") {
                        if (subOpnType === "Incr") {
                            updated.onSell = p.onSell + count;
                        } else {
                            updated.onSell = p.onSell - count;
                        }
                    }

                    // ---- STOCK LOGIC ----
                    if (type === "stock") {
                        if (subOpnType === "Incr") {
                            updated.available = p.available + count;
                        } else {
                            updated.available = p.available - count;
                        }
                    }

                    // ---- KEEP TOTAL CONSISTENT ----
                    updated.totalQty = updated.onSell + updated.available;

                    return updated;
                })
            );

            toast({
                title: `Update ${type === "sell" ? "Sell" : "Stock"}`,
                description: `${type === "sell" ? "Sell" : "Stock"} quantity updated successfully`,
                variant: "success",
            });

            setProductListingModalInfo({
                open: false,
                info: {},
                type: "",
                subOpnType: "",
            });
        } catch (err: any) {
            const apiErrors = err?.response?.data?.errors;


            // 👇 THIS IS THE KEY PART
            if (apiErrors && err?.response?.status === 422) {
                Object.entries(apiErrors).forEach(([field, messages]) => {
                    setError(field as keyof ProductFormType, {
                        type: "server",
                        message: (messages as string[])[0],
                    });
                });
                return;
            }
            if (err?.response?.status === 403) {
                setProductListingModalInfo({ open: false, info: {}, type: "", subOpnType: "" })


            }
            toast({
                title: "Error",
                description:
                    err?.message ||
                    `Failed to ${productListingModalInfo.subOpnType === "Incr" ? "increase" : "decrease"} ${productListingModalInfo.type === "sell" ? "sell" : "stock"
                    } quantity`,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


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

            // const mappedTerritory = res.data
            // setHasNext(res.meta.has_next)
            // setTotal(res.meta.total)
            // setProducts(mappedTerritory);
            // setLastPage(res.meta.last_page);
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
            brand: "",
            category: "",
            type: "",
            store: "",
            tag: "",
            status: "",
            visibility: "",
        })
    }
    return (
        <div className="">
            <div className="mb-3    ">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <>
                        <Kpi
                            label="Products"
                            value={298}
                            tone="info"
                        />

                        <Kpi
                            label="In Stock ( including all variants )"
                            value={91870}
                            tone="info"
                        />

                        <Kpi
                            label="Sold ( including all variants )"
                            value={223}
                            tone="success"
                        />

                        <Kpi
                            label="Total ( including all variants )
"
                            value={92093}
                            tone="info"
                        />
                    </>
                </div>
            </div>
            <Card className="w-full">
                <CardContent>
                    <CommonTable
                        columns={columns}
                        isClear={false}
                        data={products}
                        isAdd={false}
                        perPage={perPage}
                        setPerPage={setPerPage}
                        resetFilter={resetFilter}
                        isLoading={isListLoading}
                        total={total}
                        hasNext={has_next}
                        tabType=""
                        tabDisplayName="Products "
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
                            sessionStorage.removeItem('sidebar_active_parent')
                            navigate("/products/product-listing/manage")
                        }}
                        actions={(row: any) => (
                            <Box className="gap-0">
                                {row.status !== "cancelled" ? (
                                    <IconButton
                                        size="xs"
                                        // mr={2}
                                        title="View "

                                        aria-label="View"
                                        onClick={() => {
                                             sessionStorage.removeItem('sidebar_active_parent')
                            navigate(`/products/product-listing/view?id=${22}`)
                                        }}
                                    >
                                        <EyeIcon size={16} />
                                    </IconButton>
                                ) : (
                                    "-"
                                )}
                            </Box>

                        )}

                    />
                    <CommonModal
                        width={'35%'}
                        maxWidth={'35%'}
                        isOpen={productListingModalInfo.open}
                        onClose={() => setProductListingModalInfo({ open: false, info: {}, type: "", subOpnType: "" })}
                        title={`Update ${productListingModalInfo.type === "sell" ? "Sell Qty" : "Stock Qty"}`}
                        isLoading={isLoading}
                        primaryText={"Update"}
                        cancelTextClass='hover:bg-[#E3EDF6] hover:text-[#000]'
                        primaryColor="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
                    >
                        <ProductSellStockCountHandlerModal
                            id="product-form"
                            initialValues={
                                productListingModalInfo
                            }
                            isLoading={isLoading}
                            onClose={() =>
                                setProductListingModalInfo({ open: false, info: {}, type: "", subOpnType: "" })
                            }
                            roles={roles}
                            onSubmit={(values, setError) => {
                                ProductCommonCountHandler(values, setError);
                            }}
                        />
                    </CommonModal>
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
