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
import { formatDate, formatTime, isPdfUrl } from "@/lib/utils";
import { Loader } from "@/components/common/loader";
import { Button } from "@/components/ui/button";
import { FilePreviewCard } from "@/components/common/FilePreviewCard";

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



  const docPreview = (path?: string | null) =>
    path ? `${baseUrl}/${path}` : null;

  return (
     <div className="p-4 sm:p-4 space-y-4 max-w-7xl mx-auto">
    
          {/* ---------- HEADER ---------- */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.history.back()}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={18} />
            </button>
    
            <h1 className="text-lg font-semibold">  {"View Store"}
            </h1>
    
          </div>
    
          {/* ---------- CONTENT ---------- */}
          <div className="grid grid-cols-1 rounded-xl bg-white lg:grid-cols-1 gap-4">
    
           {
          loading ? <div className="min-h-[150px] flex justify-center items-center">
            <div className="p-4 text-sm "><Loader /></div>
          </div> : <Card className=" p-4 space-y-4 rounded-2xl border-0">
            <section>
              <h3 className="text-sm font-semibold mb-4 text-gray-700">
                Store Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4  text-sm">
                <Info label="Store Name" value={data.name} />
                <Info label="Email" value={data.email} />
                <Info label="Phone" value={data.phone || "-"} />
              </div>
            </section>


            {/* ================= LOCATION & OPERATIONS ================= */}
            <section>
              <h3 className="text-sm font-semibold mb-4 text-gray-700">
                Location & Operations
              </h3>
              <div className="gap-4  grid">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm ">
                  <Info label="Organization" value={data.organization?.company_name} />
                  <Info label="Location" value={data.territory?.name} />
                  <Info label="Opening Date" value={data.opening_date} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm ">
                  <Info label="Pincode" value={data.pincode} />
                  <Info label="Country" value={data.country_name} />
                  <Info label="State" value={data.state_name} />
                  <Info label="City" value={data.city_name} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Info label="Permanent Address" value={data.registered_address} />
                  <Info label="Shipping Address" value={data.shipping_address} />
                </div>
              </div>
            </section>


            {/* ================= BILLING & TAX ================= */}
            <section>
              <h3 className="text-sm font-semibold mb-4 text-gray-700">
                Banking Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <Info label="Invoice Prefix" value={data.invoice_prefix} />
                <Info label="GST No" value={data.gst_no} />
                <Info label="PAN No" value={data.pan_no} />
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-4 text-gray-700">
                Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">

                {/* PAN */}
                <FilePreviewCard
                  label="PAN Card"
                  src={docPreview(data.pan_card_file)}
                />

                <FilePreviewCard
                  label="Registration File"
                  src={docPreview(data.registration_file)}
                />

                <FilePreviewCard
                  label="GSTIN File"
                  src={docPreview(data.gstin_file)}
                />

              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-4 text-gray-700  ">
                Additional Notes
              </h3>
              <div className="text-sm">
                <Info label="Notes" value={data.notes || "-"} />

              </div>

            </section>


          </Card>}
          </div>
        </div>
   
  );
}


