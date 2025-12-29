"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/common/card";
import { Info } from "@/components/common/viewInfo";
import { EmptyState } from "@/components/common/emptyState";
import { useSearchParams } from "wouter";
import { fetchCityList, fetchStateList, fetchStoreById } from "@/lib/api";
import { baseUrl } from "@/lib/api";
import { storeFormApi } from "@/lib/types";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/utils";

export default function StoreView() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetchStoreById(id)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const { countries } = useAuth();
  useEffect(() => {
    if (!data) return;

    async function hydrateLocationNames() {
      try {
        // 1️⃣ COUNTRY
        const countryList = countries
        const country = countryList.find(
          (c: any) => String(c.id) === String(data.country)
        );

        // 2️⃣ STATE
        let state = {
          id: -1,
          name: ""
        };
        if (country) {
          const states = await fetchStateList(country.id);
          state = states.find(
            (s: any) => String(s.id) === String(data.state)
          );
        }

        // 3️⃣ CITY
        let city = {
          id: -1,
          name: ""
        };
        if (state) {
          const cities = await fetchCityList(state.id);
          city = cities.find(
            (c: any) => String(c.id) === String(data.city)
          );
        }

        // ✅ UPDATE DATA STATE (KEY PART)
        setData((prev: any) => ({
          ...prev,
          country_name: country?.name ?? "-",
          state_name: state?.name ?? "-",
          city_name: city?.name ?? "-",
          opening_date: `${formatDate(data.opening_date)} `

        }));
      } catch (e) {
        console.error("Failed to resolve location names", e);
      }
    }

    hydrateLocationNames();
  }, [data?.country, data?.state, data?.city, countries]);

  if (loading) {
    return <EmptyState message="Loading store..." />;
  }

  if (!data) {
    return <EmptyState message="Store not found" />;
  }

  const docPreview = (path?: string | null) =>
    path ? `${baseUrl}/${path}` : null;

  return (
    <div
      className="min-h-screen bg-gray-100 p-4 md:p-10"
    >
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg">

        {/* HEADER */}
        <div className="border-b px-6 py-4 flex items-center gap-3">
          {/* Back Button */}
          <button
            type="button"
            disabled={loading}
            onClick={() => window.history.back()}
            className="
          flex items-center gap-1 justify-start -ml-2
          text-sm font-medium
          text-muted-black
          hover:text-foreground
          transition
        "
          >
            <ChevronLeft size={20} />
          </button>

          {/* Title */}
          <h1 className="text-xl font-semibold">
            {"View Store"}
          </h1>
        </div>
        <Card className="max-w-6xl mx-auto p-6 space-y-6 rounded-2xl border-0">

          {/* ================= STORE INFO ================= */}
          <SectionCard title="Store Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Info label="Store Name" value={data.name} />
              <Info label="Email" value={data.email} />
              <Info label="Phone" value={data.phone || "-"} />
            </div>
          </SectionCard>

          {/* ================= LOCATION & OPERATIONS ================= */}
          <SectionCard title="Location & Operations">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Info label="Organization" value={data.organization?.company_name} />
              <Info label="Territory" value={data.territory?.name} />
              <Info label="Opening Date" value={data.opening_date} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Info label="Pincode" value={data.pincode} />
              <Info label="Country" value={data.country_name} />
              <Info label="State" value={data.state_name} />
              <Info label="City" value={data.city_name} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Permanent Address" value={data.registered_address} />
              <Info label="Shipping Address" value={data.shipping_address} />
            </div>
          </SectionCard>

          {/* ================= BILLING & TAX ================= */}
          <SectionCard title="Billing & Tax">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Info label="Invoice Prefix" value={data.invoice_prefix} />
              <Info label="GST No" value={data.gst_no} />
              <Info label="PAN No" value={data.pan_no} />
            </div>
          </SectionCard>

          {/* ================= DOCUMENTS ================= */}
          <SectionCard title="Documents">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* PAN */}
              <DocumentPreview
                label="PAN Card"
                src={docPreview(data.pan_card_file)}
              />

              {/* Registration */}
              <DocumentPreview
                label="Registration File"
                src={docPreview(data.registration_file)}
              />

              {/* GST */}
              <DocumentPreview
                label="GSTIN File"
                src={docPreview(data.gstin_file)}
              />

            </div>
          </SectionCard>

          {/* ================= NOTES ================= */}
          <SectionCard title="Additional Notes">
            <Info label="Notes" value={data.notes || "-"} />
          </SectionCard>

        </Card>
      </div>
    </div>
  );
}

/* -------------------- DOCUMENT PREVIEW -------------------- */

function DocumentPreview({
  label,
  src,
}: {
  label: string;
  src: string | null;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>

      <div className="h-32 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden">
        {src ? (
          <img
            src={src}
            alt={label}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <span className="text-xs text-gray-400">No document</span>
        )}
      </div>
    </div>
  );
}
