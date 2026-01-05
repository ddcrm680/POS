import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { fetchStateList, fetchCityList } from "@/lib/api";
import { Constant } from "@/lib/constant";
import { Info } from "@/components/common/viewInfo";


export default function OrganizationView({ info }: { info: any }) {
  const { countries } = useAuth();

  const [countryName, setCountryName] = useState("-");
  const [stateName, setStateName] = useState("-");
  const [cityName, setCityName] = useState("-");

  useEffect(() => {
    if (!info || !countries?.length) return;

    const country = countries.find(
      (c) => String(c.id) === String(info.country)
    );
    setCountryName(country?.name ?? "-");

    async function hydrate() {
      if (country?.id && info.state) {
        const states = await fetchStateList(country.id);
        const state = states.find(
          (s: any) => String(s.id) === String(info.state)
        );
        setStateName(state?.name ?? "-");

        if (state?.id && info.city) {
          const cities = await fetchCityList(state.id);
          const city = cities.find(
            (c: any) => String(c.id) === String(info.city)
          );
          setCityName(city?.name ?? "-");
        }
      }
    }

    hydrate();
  }, [info, countries]);



  return (
    <div className="space-y-6 p-4">
      {/* ================= HEADER ================= */}


      {/* ================= GRID ================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Company */}
        <Card className="p-4">
            <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
              Company Information
            </CardTitle>
          <div className="space-y-2">
            <Info gap="gap-12" colon={false} justify="justify-between" label="Company Name" value={info.company_name} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Email" value={info.email} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Invoice Prefix" value={info.invoice_prefix} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Service Prefix" value={info.service_prefix} />
          </div>
        </Card>

        {/* Banking */}
        <Card className="p-4">
            <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
              Banking Details
            </CardTitle>
          {/* <h3 className="mb-3 text-sm font-semibold">Banking Details</h3> */}
          <div className="space-y-2">
            
            <Info gap="gap-12" colon={false} justify="justify-between" label="Company Name In Bank" value={info.company_name_in_bank} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Bank Name" value={info.bank_name} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Account Type" value={info.account_type} />
            <Info gap="gap-12" colon={false} justify="justify-between"
              label="Account No."
              value={info.account_no}
              mono
            />
            <Info gap="gap-12" colon={false} justify="justify-between" label="IFSC" value={info.ifsc_code} mono />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Branch" value={info.branch_name} />
            
            <Info gap="gap-12" colon={false} justify="justify-between" label="Bank Address " value={info.bank_address} />
          </div>
        </Card>

        {/* Tax */}
        <Card className="p-4">
            <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
              Tax Information
            </CardTitle>
          <div className="space-y-2">
            <Info gap="gap-12" colon={false} justify="justify-between" label="GSTIN" value={info.company_gstin} mono />
            <Info gap="gap-12" colon={false} justify="justify-between" label="PAN" value={info.company_pan_no} mono />
            <Info gap="gap-12" colon={false} justify="justify-between"
              label="Aadhaar"
              value={info.aadhar_no}
              mono
            />
          </div>
        </Card>

        {/* Address */}
        <Card className="p-4 lg:col-span-3">
            <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
              Address
            </CardTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Info gap="gap-12" colon={false} justify="justify-between" label="Country" value={countryName} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="State" value={stateName} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="City" value={cityName} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="District" value={info.district} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Pincode" value={info.pin_code} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Full Address" value={info.org_address} />
       
          </div>

         
        </Card>
      </div>
    </div>
  );
}