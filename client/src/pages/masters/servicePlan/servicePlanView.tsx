import { EmptyState } from "@/components/common/emptyState";
import { Loader } from "@/components/common/loader";
import { Info } from "@/components/common/viewInfo";
import { Card, CardContent } from "@/components/ui/card";
import { Constant } from "@/lib/constant";

export default function ServicePlanView({
  info,
  isLoading = false,
}: {
  info: any;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="min-h-[150px] flex justify-center items-center">
        <div className="p-4 text-sm">
          <Loader />
        </div>
      </div>
    );
  }

  if (!info) {
    return <EmptyState message="No service plan information found" />;
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4 overflow-auto max-h-[500px]">

        {/* ================= BASIC INFO ================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <Info
            label={Constant.master.servicePlan.planName}
            value={info.plan_name}
          />
          <Info
            label={Constant.master.servicePlan.vehicleType.replace(
              "Vehicle",
              "Category"
            )}
            value={info.category_type}
          />
          <Info
            label={Constant.master.servicePlan.vehicleType}
            value={info.vehicle_type}
          />
          <Info label="Invoice Name" value={info.invoice_name} />
        </div>

        {/* ================= PRICING & TAX ================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <Info label="Price (₹)" value={String(info.price)} />
          <Info label="SAC" value={info.sac} />
          <Info label="GST (%)" value={String(info.gst)} />
          <Info
            label="Number of Visits"
            value={String(info.number_of_visits)}
          />
        </div>

        {/* ================= WARRANTY ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Info
            label="Warranty Period"
            value={String(info.warranty_period)}
          />
          <Info
            label="Warranty Type"
            value={info.warranty_in}
          />
        </div>

        {/* ================= RAW MATERIALS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Info
            label="Raw Material Consumption"
            value={
              Array.isArray(info.raw_materials) && info.raw_materials.length
                ? info.raw_materials.join(", ")
                : "-"
            }
          />
            <Info
            label="Description"
            value={info.description}
          />
        </div>

       

      </CardContent>
    </Card>
  );
}
