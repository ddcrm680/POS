import { Info } from "@/components/common/viewInfo";
import { Card, CardTitle } from "@/components/ui/card";
import { getCustomerView } from "@/lib/api";
import { useEffect, useState } from "react";

export function Overview({ id,customer }: { id: string,customer:any }) {
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
        <>
            {/* CUSTOMER BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <Card className="p-4">
                    <CardTitle className="text-sm font-semibold mb-4 text-gray-700">
                        Contact Information
                    </CardTitle>

                    <div className="space-y-2">
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
                    <Card className="p-4">
                        <CardTitle className="text-sm font-semibold mb-4 text-gray-700">
                            Billing Profile
                        </CardTitle>

                        <div className="space-y-2">
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


