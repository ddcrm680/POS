
import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Check, ChevronLeft, Cross, X } from "lucide-react";
import { Info } from "@/components/common/viewInfo";
import { useLocation, useSearchParams } from "wouter";
import { Loader } from "@/components/common/loader";
import { getJobCardItem, jobCardMetaInfo, jobCardModelInfo } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function JobCardView() {
    const [, navigate] = useLocation();
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    const [isLoading, setIsLoading] = useState(false);
    const [jobcard, setJobCard] = useState<any | null>(null);

    const fetchJobCard = async () => {
        try {
            setIsLoading(true);
            const res = await getJobCardItem({ id: id ?? "" });
            setJobCard(res ?? null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchJobCard();
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


    const [vehicleNames, setVehicleNames] = useState<{
        company?: string;
        model?: string;
    }>({});
    useEffect(() => {
        if (!jobcard?.job_card) return;

        const resolveVehicleNames = async () => {
            try {
                // 1️⃣ Vehicle companies
                const metaInfo = await jobCardMetaInfo();

                const company =
                    metaInfo.vehicleCompanies.find(
                        (c: any) =>
                            String(c.value) ===
                            String(jobcard.job_card.vehicle_company_id)
                    )?.label;

                // 2️⃣ Vehicle models (dependent on company)
                const models = await jobCardModelInfo(
                    String(jobcard.job_card.vehicle_company_id)
                );

                const model =
                    models.find(
                        (m: any) =>
                            String(m.value) ===
                            String(jobcard.job_card.vehicle_model_id)
                    )?.label;

                setVehicleNames({
                    company,
                    model,
                });
            } catch (err) {
                console.error("Failed to resolve vehicle names", err);
            }
        };

        resolveVehicleNames();
    }, [jobcard]);
    const card = jobcard?.job_card;
    const services = jobcard?.opted_services ?? [];
    return (
        <div className="max-w-7xl mx-auto p-3 space-y-3">
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
                    View Job Card
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
                    {/* ================= VEHICLE INFO ================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <Card className="p-5">
                            <CardTitle className="text-sm font-semibold mb-3 text-gray-700">
                                Vehicle Information
                            </CardTitle>

                            <div className="space-y-1">
                                <InfoIfExists label="Vehicle Make" value={vehicleNames.company} />
                                <InfoIfExists label="Vehicle Model" value={vehicleNames.model} />
                                <InfoIfExists label="Vehicle Color" value={card?.color} />
                                <InfoIfExists label="Make Year" value={card?.year} />
                                <InfoIfExists label="Registration No" value={card?.reg_no} />
                                <InfoIfExists label="Chassis No" value={card?.chasis_no} />
                                <InfoIfExists label="SRS Condition" value={card?.vehicle_condition} />

                                <InfoIfExists label="Remark" value={card?.remarks} />
                            </div>
                        </Card>

                        <Card className="p-5">
                            <CardTitle className="text-sm font-semibold mb-3 text-gray-700">
                                Vehicle Paint Condition
                            </CardTitle>

                            <div className="space-y-1">
                                <InfoIfExists
                                    label="Repainted Vehicle"
                                    value={card?.isRepainted ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <X className="h-4 w-4 text-red-600" />
                                    )}
                                />
                                <InfoIfExists
                                    label="Single Stage Paint"
                                    value={card?.isSingleStagePaint ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <X className="h-4 w-4 text-red-600" />
                                    )}
                                />
                                <InfoIfExists
                                    label="Paint Thickness below 2 MIL"
                                    value={card?.isPaintThickness ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <X className="h-4 w-4 text-red-600" />
                                    )}
                                />
                                <InfoIfExists
                                    label="Vehicle older than 5 years"
                                    value={card?.isVehicleOlder ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <X className="h-4 w-4 text-red-600" />
                                    )}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* ================= SERVICE INFO ================= */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                        {/* -------- SERVICE META INFO -------- */}
                        <Card className="p-5">
                            <CardTitle className="text-sm font-semibold mb-3 text-gray-700">
                                Service Information
                            </CardTitle>

                            <div className="space-y-1">
                                <InfoIfExists label="Vehicle Type" value={card?.vehicle_type} />
                                <InfoIfExists
                                    label="Service Type"
                                    value={(jobcard?.opted_services || [])
                                        .map((s: any) => s.category_type)
                                        .join(", ")}
                                />
                                <InfoIfExists
                                    label="Service Date"
                                    value={formatDate(card?.jobcard_date)}
                                />
                            </div>
                        </Card>

                        {/* -------- SELECTED SERVICES -------- */}
                        <Card className="p-5">
                            <CardTitle className="text-sm font-semibold mb-3 text-gray-700">
                                Selected Services
                            </CardTitle>

                            {services.length ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {services.map((s: any) => (
                                        <div
                                            key={s.id}
                                            className="
              flex items-start justify-between
              border rounded-md p-3
              min-h-[30px]
            "
                                        >
                                            <div className="pr-3">
                                                <p className="font-[600]  leading-tight text-[12px]">
                                                    {s.plan_name}
                                                </p>

                                                {s.description && (
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        {s.description}
                                                    </p>
                                                )}
                                            </div>

                                            <p className="font-bold text-[12px] text-green-600 whitespace-nowrap">
                                                ₹{s.price}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[12px] text-muted-foreground">
                                    No services selected
                                </p>
                            )}
                        </Card>

                    </div>

                </>
            )}
        </div>
    );
}
