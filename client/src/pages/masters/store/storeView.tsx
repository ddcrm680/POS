"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Landmark,
  FileText,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { fetchCityList, fetchStateList, fetchStoreById } from "@/lib/api";
import { baseUrl } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Loader } from "@/components/common/loader";
import { FilePreviewCard } from "@/components/common/FilePreviewCard";

export default function StoreView() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { countries } = useAuth();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH STORE ================= */
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetchStoreById(id)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= HYDRATE LOCATION ================= */
  const countryId = data?.country;
  const stateId = data?.state;
  const cityId = data?.city;

  useEffect(() => {
    if (!countryId || !stateId || !cityId || !countries?.length) return;

    async function hydrate() {
      try {
        const country = countries.find(
          (c: any) => String(c.id) === String(countryId)
        );

        let state: any = null;
        if (country) {
          const states = await fetchStateList(country.id);
          state = states.find(
            (s: any) => String(s.id) === String(stateId)
          );
        }

        let city: any = null;
        if (state) {
          const cities = await fetchCityList(state.id);
          city = cities.find(
            (c: any) => String(c.id) === String(cityId)
          );
        }

        setData((prev: any) => ({
          ...prev,
          country_name: country?.name ?? "-",
          state_name: state?.name ?? "-",
          city_name: city?.name ?? "-",
          opening_date: prev.opening_date
            ? formatDate(prev.opening_date)
            : "-",
        }));
      } catch (e) {
        console.error("Location hydration failed", e);
      }
    }

    hydrate();
  }, [countryId, stateId, cityId, countries]);

  const docUrl = (path?: string | null) =>
    path ? `${baseUrl}/${path}` : null;

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
           <button
              onClick={() => window.history.back()}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={18} />
            </button>

        <div className="flex-1">
          <h1 className="text-lg font-semibold">{data.name}</h1>
          
        </div>

        <Badge
  className={
    data.is_active
      ? "border-green-600 bg-green-50 text-green-700"
      : "border-red-600 bg-red-50 text-red-700"
  }
>
  {data.is_active ? "Active" : "Inactive"}
</Badge>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4">
          {/* Store Info */}
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
                <Building2 className="h-4 w-4" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <Info label=" Name" value={data.name} />
              <Info label="Email" value={data.email}  />
              <Info label="Phone" value={data.phone || "-"} />
              <Info
                label="Organization"
                value={data.organization?.company_name || "-"}
              />
              <Info
                label="Location"
                value={data.territory?.name || "-"}
              />
              <Info
                label="Opening Date"
                value={data.opening_date}
              />
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
                <MapPin className="h-4 w-4" />
                Location & Address
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <Info label="Country" value={data.country_name} />
              <Info label="State" value={data.state_name} />
              <Info label="City" value={data.city_name} />
              <Info label="Pincode" value={data.pincode || "-"} />

              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Address</p>
                <p className="leading-relaxed">
                  {data.registered_address || "-"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">
                  Shipping Address
                </p>
                <p className="leading-relaxed">
                  {data.shipping_address || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Banking */}
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
                <Landmark className="h-4 w-4" />
                Banking & Tax
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <Info label="Invoice Prefix" value={data.invoice_prefix || "-"} />
              <Info label="GST No" value={data.gst_no || "-"} />
              <Info label="PAN No" value={data.pan_no || "-"} />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
                <FileText className="h-4 w-4" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FilePreviewCard
                label="PAN Card"
                src={docUrl(data.pan_card_file)}
              />
              <FilePreviewCard
                label="Registration File"
                src={docUrl(data.registration_file)}
              />
              <FilePreviewCard
                label="GSTIN File"
                src={docUrl(data.gstin_file)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">Additional  Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {data.notes || "—"}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
function Info({ label, value, icon: Icon }: any) {
  return (
    <div className="flex gap-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium break-all">{value}</p>
      </div>
    </div>
  );
}
