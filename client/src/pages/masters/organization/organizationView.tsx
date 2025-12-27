"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/emptyState";
import { Info } from "@/components/common/viewInfo";
import { Constant } from "@/lib/constant";
import building from "@/lib/images/building.webp";
import { useAuth } from "@/lib/auth";
import { fetchStateList, fetchCityList } from "@/lib/api";

export default function OrganizationView({
  info,
}: {
  info: any;
}) {
  const { countries } = useAuth();

  const [countryName, setCountryName] = useState("-");
  const [stateName, setStateName] = useState("-");
  const [cityName, setCityName] = useState("-");

  /* ================= RESOLVE LOCATION NAMES ================= */
  useEffect(() => {
    if (!info || !countries?.length) return;

    const country = countries.find(c => String(c.id) === String(info.country));
    setCountryName(country?.name ?? "-");

    async function hydrate() {
      if (country?.id && info.state) {
        const states = await fetchStateList(country.id);
        const state = states.find((s: any) => String(s.id) === String(info.state));
        setStateName(state?.name ?? "-");

        if (state?.id && info.city) {
          const cities = await fetchCityList(state.id);
          const city = cities.find((c: any) => String(c.id) === String(info.city));
          setCityName(city?.name ?? "-");
        }
      }
    }

    hydrate();
  }, [info, countries]);

  if (!info) {
    return <EmptyState message="No organization information found" />;
  }

  const logoUrl = info.org_image
    ? `${Constant.REACT_APP_BASE_URL}/${info.org_image}`
    : building;

  return (
    <Card>
      <CardContent className="p-6 space-y-8 overflow-auto max-h-[500px]">

        {/* ================= HEADER / LOGO ================= */}


        {/* ================= BASIC INFO ================= */}
        <section>
          <h3 className="text-sm font-semibold mb-4 text-gray-700">
            Organization Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">


            <Info label="Company Name" value={info.company_name} />
            <Info label="Email" value={info.email} />
            <Info label="Invoice Prefix" value={info.invoice_prefix} />
            <Info label="Service Prefix" value={info.service_prefix} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
   </div>
        </section>

        {/* ================= BANKING ================= */}
        <section>
          <h3 className="text-sm font-semibold mb-4 text-gray-700">
            Banking Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <Info label="Company Name in Bank" value={info.company_name_in_bank} />
            <Info label="Bank Name" value={info.bank_name} />
            <Info label="Account No." value={info.account_no} mono />
            <Info label="Account Type" value={info.account_type} />
            <Info label="IFSC Code" value={info.ifsc_code} mono />
            <Info label="Branch Name" value={info.branch_name} />
            <Info label="Bank Address" value={info.bank_address} />
          </div>
        </section>

        {/* ================= TAX ================= */}
        <section>
          <h3 className="text-sm font-semibold mb-4 text-gray-700">
            Tax Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <Info label="Company GSTIN" value={info.company_gstin} mono />
            <Info label="Company PAN No." value={info.company_pan_no} mono />
            <Info label="Aadhaar No." value={info.aadhar_no} mono />
          </div>
        </section>

        {/* ================= ADDRESS ================= */}
        <section>
          <h3 className="text-sm font-semibold mb-4 text-gray-700">
            Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <Info label="Country" value={countryName} />
            <Info label="State" value={stateName} />
            <Info label="City" value={cityName} />
            <Info label="District" value={info.district} />
            <Info label="Pincode" value={info.pin_code} />
          </div>

          <div className="grid grid-cols-1 mt-4 gap-4 text-sm">
            <Info label="Company Address" value={info.org_address} />
          </div>
        </section>

      </CardContent>
    </Card>
  );
}
