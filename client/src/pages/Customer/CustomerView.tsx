
import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Info } from "@/components/common/viewInfo";
import { useLocation, useSearchParams } from "wouter";
import { Loader } from "@/components/common/loader";
import { getCustomerView } from "@/lib/api";

export default function JobCardView() {
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<any | null>(null);

  const fetchCustomer = async () => {
    try {
      setIsLoading(true);
      const res = await getCustomerView(id ?? "");
      setCustomer(res?.data ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomer();
  }, [id]);

  const InfoIfExists = ({ value, ...props }: any) => {
    if (value === null || value === undefined || value === "") return null;
    return (
      <Info
        gap="gap-12"
        colon={false}
        justify="justify-between"
        {...props}
        value={value}
      />
    );
  };

  const isCompany = customer?.type === "company";

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            localStorage.removeItem("sidebar_active_parent");
            window.history.back();
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={18} />
        </button>

        <h1 className="text-lg font-semibold flex-1">
          View Customer
        </h1>
      </div>

      {/* LOADER */}
      {isLoading ? (
        <Card>
          <div className="min-h-[150px] flex justify-center items-center">
            <Loader />
          </div>
        </Card>
      ) : (
        <>
          {/* CUSTOMER BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <CardTitle className="text-sm font-semibold mb-4 text-gray-700">
                Basic Details
              </CardTitle>

              <div className="space-y-2">
                <InfoIfExists label="Name" value={customer?.name} />
                <InfoIfExists label="Phone" value={customer?.phone} />
                <InfoIfExists label="Email" value={customer?.email} />
                <InfoIfExists label="Type" value={customer?.type=="individual"? "Individual": customer?.type==="company"?"Company":""} />
              </div>
            </Card>

            {/* INDIVIDUAL ADDRESS */}
            { (
              <Card className="p-4">
                <CardTitle className="text-sm font-semibold mb-4 text-gray-700">
                  Address
                </CardTitle>

                <div className="space-y-2">
                  <InfoIfExists
                    label="Address"
                    value={customer?.address}
                  />
                  <InfoIfExists
                    label="State"
                    value={customer?.state?.name}
                  />
                  <InfoIfExists
                    label="Country"
                    value={customer?.country?.name}
                  />
                </div>
              </Card>
            )}
          </div>

          {/* COMPANY SECTION */}
          {isCompany && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* COMPANY DETAILS */}
              <Card className="p-4 flex-1">
                <CardTitle className="text-sm font-semibold mb-4 text-gray-700">
                  Company Details
                </CardTitle>

                <div className="space-y-2">
                  <InfoIfExists
                    label="Company Contact No"
                    value={customer?.company_contact_no}
                  />
                  <InfoIfExists
                    label="GSTIN"
                    value={customer?.company_gstin}
                  />
                </div>
              </Card>

              {/* COMPANY ADDRESS */}
              <Card className="p-4 flex-1">
                <CardTitle className="text-sm font-semibold mb-4 text-gray-700">
                  Company Address
                </CardTitle>

                <div className="space-y-2">
                  <InfoIfExists
                    label="Address"
                    value={customer?.address}
                  />
                  <InfoIfExists
                    label="State"
                    value={customer?.company_state?.name}
                  />
                  <InfoIfExists
                    label="Country"
                    value={customer?.company_country?.name}
                  />
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}