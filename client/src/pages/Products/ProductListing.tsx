// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteTerritory, DeleteUser, EditUser, fetchUserList, getConsumer, SaveUser, UpdateTerritoryStatus } from "@/lib/api";
import { TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Badge, Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon, Trash2 } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { customerMockData, filterMetaInfo, mockProducts, territoryMasterMockData } from "@/lib/mockData";
import CommonRowMenu from "@/components/common/CommonRowMenu";
import { Kpi } from "../Customer/DashboardCards";

export default function ProductsListing() {
    const { toast } = useToast();

    const { roles } = useAuth();
    const [products, setProducts] = useState(mockProducts);
    const [productListingModalInfo, setProductListingModalInfo] = useState<{ open: boolean, info: any, type: string }>({
        open: false,
        info: {},
        type: ""
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
    const columns = useMemo(() => [
        {
            key: "createdAt",
            label: "Created On",
            align: "center",
            width: "120px",
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
            width: "130px",
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
            width: "120px",
            align: "center",
            render: (val: number, row: any) => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        className="px-2 py-0.5 bg-rose-500 text-white rounded"
                        onClick={() =>
                            setProducts(p =>
                                p.map(r =>
                                    r.id === row.id
                                        ? { ...r, onSell: Math.max(0, r.onSell - 1) }
                                        : r
                                )
                            )
                        }
                    >
                        −
                    </button>
                    <span>{val}</span>
                    <button
                        className="px-2 py-0.5 bg-indigo-500 text-white rounded"
                        onClick={() =>
                            setProducts(p =>
                                p.map(r =>
                                    r.id === row.id
                                        ? { ...r, onSell: r.onSell + 1 }
                                        : r
                                )
                            )
                        }
                    >
                        +
                    </button>
                </div>
            ),
        },

        {
            key: "available",
            label: "Available Stock",
            width: "150px",
            align: "center",
            render: (val: number, row: any) => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        className="px-2 py-0.5 bg-rose-500 text-white rounded"
                        onClick={() =>
                            setProducts(p =>
                                p.map(r =>
                                    r.id === row.id
                                        ? { ...r, available: Math.max(0, r.available - 1) }
                                        : r
                                )
                            )
                        }
                    >
                        −
                    </button>
                    <span>{val}</span>
                    <button
                        className="px-2 py-0.5 bg-indigo-500 text-white rounded"
                        onClick={() =>
                            setProducts(p =>
                                p.map(r =>
                                    r.id === row.id
                                        ? { ...r, available: r.available + 1 }
                                        : r
                                )
                            )
                        }
                    >
                        +
                    </button>
                </div>
            ),
        },
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
                    onCheckedChange={() =>
                        setProducts(p =>
                            p.map(r =>
                                r.id === row.id ? { ...r, visibility: r.visibility ? 0 : 1 } : r
                            )
                        )
                    }
                >
                    <Switch.HiddenInput />
                    <Switch.Control bg="#fca5a5" _checked={{ bg: "#22c55e" }} />
                </Switch.Root>
            ),
        },

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
                    onCheckedChange={() =>
                        setProducts(p =>
                            p.map(r =>
                                r.id === row.id ? { ...r, status: r.status ? 0 : 1 } : r
                            )
                        )
                    }
                >
                    <Switch.HiddenInput />
                    <Switch.Control bg="#fca5a5" _checked={{ bg: "#22c55e" }} />
                </Switch.Root>
            ),
        },
    ], [filters, page]);





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
            <div className="mb-6">
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
                        isAdd={true}
                        perPage={perPage}
                        setPerPage={setPerPage}
                        resetFilter={resetFilter}
                        isLoading={isListLoading}
                        total={total}
                        hasNext={has_next}
                        tabType=""
                        tabDisplayName="Products / Stock"
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
                            localStorage.removeItem('sidebar_active_parent')
                            navigate(`/job-cards/manage`)
                        }}
                        actions={(row: any) => (
                            <CommonRowMenu
                                items={[
                                    {
                                        key: "view",
                                        label: "View ",
                                        icon: <EyeIcon size={16} />,
                                        onClick: () => navigate(`/customers/view?id=${row.id}`),
                                    },
                                    {
                                        key: "edit",
                                        label: "Edit ",
                                        icon: <EditIcon size={16} />,
                                        onClick: () =>
                                            navigate(`/customers/manage?id=${row.id}&mode=edit`),
                                    },

                                ]}
                            />
                        )}

                    />
                    <CommonModal
                        width={'80%'}
                        maxWidth={'80%'}
                        isOpen={productListingModalInfo.open}
                        onClose={() => setProductListingModalInfo({ open: false, info: {}, type: "" })}
                        title={`Update ${productListingModalInfo.type === "sell" ? "Sell Qty" : "Stock Qty"}`}
                        isLoading={isLoading}
                        primaryText={"Update"}
                        cancelTextClass='hover:bg-[#E3EDF6] hover:text-[#000]'
                        primaryColor="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
                    >

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
