
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Eye, EyeIcon, Info, RefreshCcw, ServerOff } from "lucide-react";
import { fetchStateList, fetchCityList, fetchStoreById, baseUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, getFileNameFromLabel, isPdfUrl, normalizeStatus } from "@/lib/utils";
import { GlobalLoader } from "@/components/common/GlobalLoader";
import { FileLightbox } from "@/components/common/FileLightbox";
import { Button } from "@chakra-ui/react";

export default function StoreDetails() {
    const { user, isLoading: authLoading, countries } = useAuth();
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [storeBeMessage, setStoreBeMessage] = useState<any>('');
    /* ---------------- FETCH STORE ---------------- */
    useEffect(() => {
        if (!user?.id) return;
        async function loadStore() {
            if (user?.role === 'store-manager' && !user.store_id) {
                setStoreBeMessage('Store not assigned to your account');
                setLoading(false);
                return;
            }
            try {

                const res = await fetchStoreById(user?.store_id ?? "");
                setStore(res?.data);
            } catch (e: any) {
                console.log(e?.response?.status, 'err?.response?.status');
                if (e?.response?.status === 404) {
                    setStoreBeMessage(e?.response?.data?.message)
                }
            } finally {
                setLoading(false);
            }
        }
        loadStore();
    }, [user?.id]);

    /* ---------------- RESOLVE LOCATION ---------------- */
    useEffect(() => {
        if (!store || !countries?.length) return;

        (async () => {
            const country = countries.find(c => String(c.id) === String(store.country));

            let state: any = {};
            if (country) {
                const states = await fetchStateList(country.id);
                state = states.find((s: any) => String(s.id) === String(store.state));
            }

            let city: any = {};
            if (state?.id) {
                const cities = await fetchCityList(state.id);
                city = cities.find((c: any) => String(c.id) === String(store.city));
            }

            setStore((prev: any) => ({
                ...prev,
                country_name: country?.name ?? "-",
                state_name: state?.name ?? "-",
                city_name: city?.name ?? "-",
            }));
        })();
    }, [store?.country, store?.state, store?.city, countries]);

    /* ---------------- LOADING ---------------- */
    if (authLoading || loading) return <GlobalLoader />;

    if (!store) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                     <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardContent className="pt-8 pb-6 text-center">
          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
  <Info className="h-7 w-7 text-blue-500" />
</div>

          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900">
            Store Info
          </h1>

          {/* Description */}
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            {storeBeMessage}
          </p>

        </CardContent>
      </Card>
            </div>
        );
    }
    const storeStatus = normalizeStatus(store.is_active);
    return (
        <div className="p-4 sm:p-4 space-y-4 max-w-7xl mx-auto">

            {/* ---------- HEADER ---------- */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => window.history.back()}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft size={18} />
                </button>

                <h1 className="text-lg font-semibold">Store Details</h1>

                <span className="text-sm text-muted-foreground truncate">
                    ({store.name})
                </span>
            </div>

            {/* ---------- CONTENT ---------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* STORE INFO */}
                <InfoCard title="Store Information">
                    <Row label="Name" value={store.name} />
                    <Row label="Email" value={store.email} />
                    <Row label="Phone" value={store.phone || "-"} />
                    <Row label="Location" value={store.territory?.name || "-"} />
                    <Row
                        label="Status"
                        value={
                            <Badge
                                className={`h-5 px-2 text-[11px] ${storeStatus === "active"
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-red-100 text-red-700 border border-red-200"
                                    }`}
                            >
                                {storeStatus === "active" ? "Active" : "Inactive"}
                            </Badge>
                        }
                    />
                </InfoCard>

                {/* LOCATION & OPERATIONS */}
                <InfoCard title="Location & Operations">
                    <Row label="Organization" value={store.organization?.company_name} />
                    <Row label="Opening Date" value={formatDate(store.opening_date)} />
                    <Row label="Pincode" value={store.pincode} />
                    <Row label="Country" value={store.country_name} />
                    <Row label="State" value={store.state_name} />
                    <Row label="City" value={store.city_name} />
                    <Row label="Permanent Address" value={store.registered_address} />
                    <Row label="Shipping Address" value={store.shipping_address} />
                </InfoCard>

                {/* BANKING / TAX */}
                <InfoCard title="Banking & Tax Details">
                    <Row label="Invoice Prefix" value={store.invoice_prefix} />
                    <Row label="GST Number" value={store.gst_no} mono />
                    <Row label="PAN Number" value={store.pan_no} mono />
                </InfoCard>
                <InfoCard title="Documents">
                    <Row
                        label="PAN Card"
                        filePath={
                            store.pan_card_file
                                ? `${baseUrl}/${store.pan_card_file}`
                                : null
                        }
                    />

                    <Row
                        label="Registration File"
                        filePath={
                            store.registration_file
                                ? `${baseUrl}/${store.registration_file}`
                                : null
                        }
                    />

                    <Row
                        label="GSTIN File"
                        filePath={
                            store.gstin_file
                                ? `${baseUrl}/${store.gstin_file}`
                                : null
                        }
                    />
                </InfoCard>
            </div>
        </div>
    );
}


/* ------------------------------------------------------------------ */
/* REUSABLE UI PARTS */
/* ------------------------------------------------------------------ */

function InfoCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="rounded-xl">
            <CardHeader className="pb-2">
                <h3 className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">
                    {title}
                </h3>
            </CardHeader>
            <CardContent className="space-y-2">
                {children}
            </CardContent>
        </Card>
    );
}

function Row({
    label,
    value,
    mono = false,
    filePath,
}: {
    label: string;
    value?: React.ReactNode;
    mono?: boolean;
    filePath?: string | null;
}) {
    const [open, setOpen] = useState(false);

    const isFile = Boolean(filePath);
    const fileName = filePath ? getFileNameFromLabel(label, filePath) : "-";
    const isPdf = filePath ? isPdfUrl(filePath) : false;

    return (
        <>
            <div className="grid grid-cols-12 gap-2 items-center">
                {/* LABEL */}
                <span className="col-span-4 text-[11px] text-muted-foreground">
                    {label}
                </span>

                {/* VALUE */}
                <div
                    className={`col-span-8 flex items-center gap-2 text-[13px] font-medium break-words ${mono ? "font-mono text-[12px]" : ""
                        }`}
                >
                    <span className="truncate max-w-[220px]">
                        {isFile ? fileName : value ?? "-"}
                    </span>

                    {isFile && (
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="text-[#0000ff] hover:text-[#0000ff]/80"
                            title="View document"
                        >
                            <EyeIcon size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* LIGHTBOX */}
            {isFile && filePath && (
                <FileLightbox
                    open={open}
                    src={filePath}
                    isPdf={isPdf}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}