"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import building from '@/lib/images/building.webp'
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { IconButton } from "@chakra-ui/react";

import { Form } from "@/components/ui/form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box } from "@chakra-ui/react";
import { Constant } from "@/lib/constant";
import { availablePlansMock, invoicePlanMockData, invoiceViewMock, warrantyType } from "@/lib/mockData";
import { InvoicePaymentFormProp, InvoicePaymentFormValues, organizationFormType, serviceFormProp, serviceFormType, userFormProp, UserFormType } from "@/lib/types";
import { invoicePaymentSchema, invoiceSchema, organizationSchema, servicePlanSchema, userSchema } from "@/lib/schema";
import RHFSelect from "@/components/RHFSelect";
import { Textarea } from "@/components/ui/textarea";
import { unknown } from "zod";
import { useAuth } from "@/lib/auth";
import { createInvoice, fetchCityList, fetchStateList, getInvoiceInfo, getInvoiceInfoByJobCardPrefill, getJobCardItem } from "@/lib/api";
import { Pencil, Trash2, X } from "lucide-react";
import { calculateInvoiceRow, calculateInvoiceTotals, findIdByName, getGstType, mapInvoiceApiToPrefilledViewModel, mapInvoiceApiToViewModel } from "@/lib/utils";
import { RequiredMark } from "@/components/common/RequiredMark";
import { SectionCard } from "@/components/common/card";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";

// export default function InvoicePaymentForm
// (
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, FileText } from "lucide-react";
import CommonTable from "@/components/common/CommonTable";
import { Info } from "@/components/common/viewInfo";
import { useLocation, useSearchParams } from "wouter";
import { Loader } from "@/components/common/loader";
import { useToast } from "@/hooks/use-toast";


export default function InvoiceForm() {
  const [plans, setPlans] = useState<any[]>([]);
  const [invoiceView, setInvoiceView] = useState<any | null>(null);

  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const [isInfoLoading, setIsInfoLoading] = useState(false);


  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const jobCardId = searchParams.get("jobCardId");
  const [invoiceInfo, setInvoiceInfo] = useState<{
    selectedPlanId: string, billingAddress: string
  }>({
    selectedPlanId: "", billingAddress: ""
  });

  const [billingStateId, setBillingStateId] = useState(null);
  const [extraDiscountPercent, setExtraDiscountPercent] = useState<string>("0");
  function buildInvoicePayload(values: any) {
    return {
      billing_type: "individual",

      billing_name: invoiceView?.customer?.name ?? "",
      billing_phone: invoiceView?.customer?.phone ?? "",
      billing_email: invoiceView?.customer?.email ?? "",

      billing_address: values.billing_address,
      billing_state_id: billingStateId,

      items: plans.map(plan => ({
        service_plan_id: plan.id,
        qty: Number(plan.qty || 1),
      })),
    };
  }
  const planColumns = useMemo(() => [
    {
      key: "plan_name",
      label: "Plan Name",
      width: "280px",
    },

    {
      key: "sac",
      label: "SAC",
      width: "90px",
      render: (v: string) => v ?? `-`,
    },


    {
      key: "price",
      label: "Price (₹)",
      width: "120px",
      render: (v: number) => `₹ ${v}`,
    },

    // {
    //   key: "discount_percent",
    //   label: "Dis.(%)",
    //   render: (_: number, row: any) => (
    //     <input
    //       type="text"
    //       inputMode="numeric"
    //       pattern="[0-9]*"
    //       value={row.discount_percent ?? ""}
    //       onChange={(e) => {
    //         let value = e.target.value.replace(/\D/g, "");

    //         if (value === "") {
    //           updatePlan(row.id, { discount_percent: "" });
    //           return;
    //         }

    //         let num = Math.min(100, Math.max(0, Number(value)));

    //         updatePlan(row.id, {
    //           discount_percent: String(num),
    //           discount_amount: "0", // 🔒 lock other input
    //         });
    //       }}
    //       onBlur={() => {
    //         if (!row.discount_percent) {
    //           updatePlan(row.id, { discount_percent: "0" });
    //         }
    //       }}
    //       className="w-16 border rounded px-1 py-0.5 text-xs text-right"
    //     />
    //   ),
    // }
    // , {
    //   key: "discount_amount",
    //   label: "Discount",
    //   render: (_: number, row: any) => (
    //     <input
    //       type="text"
    //       inputMode="numeric"
    //       pattern="[0-9]*"
    //       value={row.discount_amount ?? ""}
    //       onChange={(e) => {
    //         let value = e.target.value.replace(/\D/g, "");

    //         updatePlan(row.id, {
    //           discount_amount: value,
    //           discount_percent: "0", // 🔒 lock percent
    //         });
    //       }}
    //       onBlur={() => {
    //         if (!row.discount_amount) {
    //           updatePlan(row.id, { discount_amount: "0" });
    //         }
    //       }}
    //       className="w-20 border rounded px-1 py-0.5 text-xs text-right"
    //     />
    //   ),
    // },

    {
      key: "sub_amount",
      label: "Sub Amount",
      render: (v: number) => `₹ ${v ?? "-"}`
    },

    ...(billingStateId == invoiceView?.store.state_id ?
      [{
        key: "cgst_amount",
        label: "CGST",
        render: (_: any, row: any) => (
          <span>
            ₹ {row.cgst_amount}
            <span className="text-green-600 text-xs">
              ({row.cgst_amount}%)
            </span>
          </span>
        )
      },
      {
        key: "sgst_amount",
        label: "SGST",
        render: (_: any, row: any) => (
          <span>
            ₹ {row.igst_amount}
            <span className="text-green-600 text-xs">
              ({row.sgst_amount}%)
            </span>
          </span>
        )
      }] : [{
        key: "igst_amount",
        label: "IGST",
        render: (_: any, row: any) => (
          <span>
            ₹ {row.igst_amount}
            <span className="text-green-600 text-xs pl-2">
              ({row.igst_percent}%)
            </span>
          </span>
        )
      }]),
    {
      key: "total_amount",
      label: "Amount",
      render: (v: number) => `₹ ${v ?? "-"}`
    }


  ], []);
  const costSummary = useMemo(() => {
    const totalItems = plans.reduce(
      (sum, p) => sum + Number(p.qty || 1),
      0
    );

    const subTotal = plans.reduce(
      (sum, p) => sum + Number(p.sub_amount || 0),
      0
    );

    const cgstTotal = plans.reduce(
      (sum, p) => sum + Number(p.cgst_amount || 0),
      0
    );

    const sgstTotal = plans.reduce(
      (sum, p) => sum + Number(p.sgst_amount || 0),
      0
    );

    const igstTotal = plans.reduce(
      (sum, p) => sum + Number(p.igst_amount || 0),
      0
    );

    return {
      totalItems,
      extraDiscount: 0,
      subTotal: Number(subTotal.toFixed(2)),
      cgstTotal: Number(cgstTotal.toFixed(2)),
      sgstTotal: Number(sgstTotal.toFixed(2)),
      igstTotal: Number(igstTotal.toFixed(2)),
      grandTotal: Number((subTotal + cgstTotal + sgstTotal + igstTotal).toFixed(2)),
    };
  }, [plans]);
  useEffect(() => {
    // if (!id) return;

    const loadInvoice = async () => {
      setIsInfoLoading(true);
      try {
        console.log(jobCardId, id, 'jobCardId');

        if (jobCardId) {
          const res =
            await getInvoiceInfoByJobCardPrefill({ id: jobCardId ?? "" });
          const mapped = mapInvoiceApiToPrefilledViewModel(res.data);
          console.log(mapped, 'mappedmapped');

          setInvoiceView(mapped);
          const planCalculated = mapped.plans.map((item: any) =>
            calculateInvoiceRow(item)
          );

          setPlans(planCalculated);
          setBillingStateId(mapped.billing_prefill.state_id);
          form.setValue(
            "billing_address",
            mapped.customer.billingAddress
          );
        } else if (id) {
          const res = await getInvoiceInfo(id); // 🔥 your API
          const mapped = mapInvoiceApiToViewModel(res.data);

          setInvoiceView(mapped);
          setPlans(mapped.plans);
          form.setValue(
            "billing_address",
            mapped.customer.address ?? ""
          );
        }



      } catch (e) {
        console.log(e);

      } finally {
        setIsInfoLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  useEffect(() => {
    if (!invoiceInfo.billingAddress && invoiceView && invoiceView?.customer.address) {
      setInvoiceInfo((prev) => ({
        ...prev,
        billingAddress: invoiceView?.customer.address,
      }));
    }
  }, [invoiceView?.customer?.address]);
  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      billing_address: invoiceView?.customer?.address ?? "",
    },
  });

  const { toast } = useToast();
  const mode = searchParams.get("mode");
  async function handleInvoiceSubmission(values: any) {
    setIsLoading(true);
    if (!plans.length) {
      toast({
        title: "No Plans Added",
        description: "Please add at least one plan",
        variant: "destructive",
      });
      return;
    }
    try {
      if (mode !== "edit") {
        const payload = {
          ...buildInvoicePayload(values),
          id: mode !== "edit" && jobCardId ? jobCardId : id
        };
        console.log("FINAL PAYLOAD 👉", payload);

        await createInvoice(payload);

        toast({
          title: "Add Invoice",
          description: "Invoice added successfully",
          variant: "success",
        });

        navigate("/invoices");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    console.log(invoiceView, 'invoiceView');

  }, [invoiceView])

  function updatePlan(planId: number, patch: Partial<any>) {
    setPlans(prev =>
      prev.map(p => {
        if (p.id !== planId) return p;
        const updated = { ...p, ...patch };
        return calculateInvoiceRow(updated, 'igst');
      })
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          // disabled={loading}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={18} />
        </button>

        <h1 className="text-lg font-semibold flex-1">Invoice {mode == 'create' ? `of Job Card #${jobCardId}` : `#${invoiceView?.invoice_no}`}</h1>
        {invoiceView?.status && <Badge
          className={
            invoiceView?.status
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-red-600 bg-red-50 text-red-700"
          }
        >
          {invoiceView?.status ?? "-"}
        </Badge>}
      </div>

      {/* Top Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
            Customer Detail
          </CardTitle>
          <div className="space-y-2">
            <Info gap="gap-12" colon={false} justify="justify-between" label="Name" value={invoiceView?.customer.name} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Phone" value={invoiceView?.customer.phone} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Email" value={invoiceView?.customer.email} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Address" value={invoiceView?.customer.address} />

          </div>
        </Card>

        <Card className="p-4">
          <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
            Vehicle Info  </CardTitle>   <div className="space-y-2">

            <Info gap="gap-12" colon={false} justify="justify-between" label="Type" value={invoiceView?.vehicle.type} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Make" value={invoiceView?.vehicle.make} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Model" value={invoiceView?.vehicle.model} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Reg No" value={invoiceView?.vehicle.reg_no} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Year" value={invoiceView?.vehicle.make_year} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Color" value={invoiceView?.vehicle.color} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="  Chassis No" value={invoiceView?.vehicle.chassisNo} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Remark" value={invoiceView?.vehicle.remark} />

          </div>
        </Card>

        <Card className="p-4">
          <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
            Jobcard Info
          </CardTitle>
          <div className="space-y-2">
            <Info gap="gap-12" colon={false} justify="justify-between" label="Jobcard Date" value={invoiceView?.jobcard.jobcard_date} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Edited Date" value={invoiceView?.jobcard.edited_date} />
          </div>
        </Card>
      </div>

      {/* Plans */}
      <Card className="p-4 lg:col-span-3">
        <CardTitle className=" text-sm font-semibold  text-gray-700 flex gap-2 items-center">
          PLAN INFO
        </CardTitle>
        <Form {...form}>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-4">
            <FloatingTextarea
              name="billing_address"
              rows={2}
              label="Billing Address"
              control={form.control}
              isRequired
            />
          </div>
        </Form>
        <div className="flex items-end gap-3 mt-3 ">

          <div className="w-72">


            <select
              value={invoiceInfo.selectedPlanId}
              onChange={(e) => setInvoiceInfo((prev) => ({ ...prev, selectedPlanId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select Plan</option>
              {availablePlansMock.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.plan_name}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            onClick={() => {
              if (!invoiceInfo.selectedPlanId) return;

              const plan = availablePlansMock.find(
                (p) => String(p.id) === invoiceInfo.selectedPlanId
              );

              if (!plan) return;

              // ❌ prevent duplicate
              if (plans.some((p: any) => p.id === plan.id)) return;

              setPlans((prev: any) => ([...prev, plan]));
              setInvoiceInfo((prev) => ({ ...prev, selectedPlanId: "" }));
            }}
          >
            Add Plan
          </Button>
        </div>
        <CommonTable
          columns={planColumns}
          data={plans}
          searchable={false}
          isAdd={false}
          perPage={10}
          isLoading={false}
          total={plans.length}
          tabDisplayName="Plans"
          page={1}
          isTotal={false}
          setPage={() => { }}
          lastPage={1}
          hasNext={false}
          actions={(row: any) => {
            return (
              <>

                {(
                  <Box className="gap-3">
                    {
                      <IconButton
                        size="xs"
                        mr={2}
                        colorScheme="red"
                        aria-label="Delete"
                        onClick={() => {
                          // setIsUserDeleteModalOpenInfo({ open: true, info: row });
                        }}
                      >
                        <Trash2 size={16} />
                      </IconButton>}

                  </Box>
                )}
              </>
            );
          }}
        />

        {/* TOTALS */}
        <div className="flex justify-end ">
          <div className="w-[300px] text-sm space-y-2">

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Total Items :
              </span>
              <span className="font-medium">
                {costSummary.totalItems}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Sub Total :
              </span>
              <span className="font-medium">
                ₹ {costSummary.subTotal}
              </span>
            </div>

            {billingStateId == invoiceView?.store.state_id ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    CGST Amount :
                  </span>
                  <span className="font-medium">
                    ₹ {costSummary.cgstTotal ?? "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    SGST Amount :
                  </span>
                  <span className="font-medium">
                    ₹ {costSummary.sgstTotal ?? "-"}
                  </span>
                </div>
              </>
            ) : <div className="flex justify-between">
              <span className="text-muted-foreground">
                IGST Amount :
              </span>
              <span className="font-medium">
                ₹ {costSummary.igstTotal ?? "-"}
              </span>
            </div>}
            {/* <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Extra Discount (%):
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"     // 📱 numeric keyboard on mobile
                  pattern="[0-9]*"
                  value={extraDiscountPercent}
                  onChange={(e) => {
                    let value = e.target.value;

                    // ✅ allow only digits
                    value = value.replace(/\D/g, "");

                    // ✅ empty allowed while typing
                    if (value === "") {
                      setExtraDiscountPercent("");
                      return;
                    }

                    const num = Number(value);

                    // ✅ enforce min/max
                    if (num < 0) value = "0";
                    if (num > 100) value = "100";

                    setExtraDiscountPercent(value);
                  }}
                  onBlur={() => {
                    // ✅ normalize on blur
                    if (extraDiscountPercent === "") {
                      setExtraDiscountPercent("0");
                    }
                  }}
                  className="w-16 border rounded px-2 py-1 text-xs text-right"
                />
                <span className="text-muted-foreground">
                  ₹ {
                  costSummary?.extraDiscount 
                  ?? "-"}
                </span>
              </div>
            </div> */}

            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Grand Total :</span>
              <span>
                ₹ {costSummary?.grandTotal}
              </span>
            </div>

          </div>
        </div>
      </Card>

      <div className="  pb-4 flex justify-end gap-3 mt-4">
        <Button
          variant="outline"
          disabled={isLoading || isInfoLoading}
          className={'hover:bg-[#E3EDF6] hover:text-[#000]'}
          onClick={() => navigate("/invoices")}
        >
          {'Cancel'}
        </Button>

        {(
          <Button type="button"
            disabled={isLoading || isInfoLoading}
            onClick={form.handleSubmit(handleInvoiceSubmission)}
            className="bg-[#FE0000] hover:bg-[rgb(238,6,6)]">
            {isLoading && <Loader color="#fff" isShowLoadingText={false} />}
            {isLoading
              ? id ? "Updating..." : "Adding..."
              : id ? "Update " : "Add "}
          </Button>
        )}

      </div>

    </div>
  );
}
