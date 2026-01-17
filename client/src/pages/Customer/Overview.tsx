// import { Info } from "@/components/common/viewInfo";
import { Card,  } from "@/components/ui/card";
import { getCustomerView } from "@/lib/api";
import { useEffect, useState } from "react";
function Info({ label,value,  }:any) {
  return (
    <div  className="flex justify-between text-sm">
            <span className="text-slate-500 text-[12px]">{label}</span>
            <span className="font-[600] text-slate-800 text-[12px]">{value}</span>
          </div>
  );
}
export function Overview({ id,customer }: { id: string,customer:any }) {
   const InfoIfExists = ({ value, ...props }: any) => {
  if (value === null || value === undefined || value === "") return null;

  return (
    <Info
      gap="gap-3"                  // ⬅️ was gap-12
      colon={false}
      justify="justify-between"
      labelClassName="text-xs text-muted-foreground font-medium"
      valueClassName="text-sx text-gray-800"
      {...props}
      value={value}
    />
  );
}
 

    const isCompany = customer?.type === "company";

    return (
        <>
            {/* CUSTOMER BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                <Card className="p-3">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Contact Information
                    </h3>

                    <div className="space-y-1">
                        <InfoIfExists label="Name" value={customer?.name} />
                        <InfoIfExists label="Phone" value={customer?.phone} />
                        <InfoIfExists label="Email" value={customer?.email} />
                          <InfoIfExists
                                label="Address"
                                value={customer?.address}
                            />
                         </div>
                </Card>

                {/* INDIVIDUAL ADDRESS */}
                {(
                    <Card className="p-3">
                        {/* <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3> */}
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">
                            Billing Profile
                        </h3>

                        <div className="space-y-1">
                             <InfoIfExists label="Type" value={customer?.type == "individual" ? "Individual" : customer?.type === "company" ? "Company" : ""} />
                  
                           <InfoIfExists label="Phone" value={customer?.type == "individual" ? customer?.phone : customer?.company_contact_no} />
                            <InfoIfExists
                                label="State"
                                value={ customer?.type == "individual"? customer?.state?.name : customer?.company_state?.name}
                            />
                            {
                                isCompany &&  <InfoIfExists
                                label="GSTIN"
                                value={ customer?.company_gstin ??"-"}
                            />
                            }
                         
                        </div>
                    </Card>
                )}
               
                  {/* {isCompany && (
               
            )} */}
            </div>

            {/* COMPANY SECTION */}
          
        </>
    );
}

