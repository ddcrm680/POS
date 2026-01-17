
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Info } from "lucide-react";
import { fetchStateList, fetchCityList, fetchStoreById, baseUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, normalizeStatus } from "@/lib/utils";
import { GlobalLoader } from "@/components/common/GlobalLoader";
import { Row } from "./storeRow";
import { InfoCard } from "./infoCard";

export default function StoreDetails() {
    const { user, isLoading: authLoading, countries } = useAuth();
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [storeBeMessage, setStoreBeMessage] = useState<any>('');
    /* ---------------- FETCH STORE ---------------- */
    useEffect(() => {
        if (!user?.store_id) return;
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
                if (e?.response?.status === 404) {
                    setStoreBeMessage(e?.response?.data?.message)
                }
            } finally {
                setLoading(false);
            }
        }
        loadStore();
    }, [user]);

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
        <div className="p-3 sm:p-3 space-y-3 max-w-6xl mx-auto">

            {/* ---------- HEADER ---------- */}
            <div className="flex items-center gap-2">
                <button
                     onClick={() => {
 localStorage.removeItem('sidebar_active_parent')
              window.history.back()
            }}
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
