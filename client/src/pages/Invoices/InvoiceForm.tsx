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
import { calculateInvoiceRow, mapInvoiceApiToPrefilledViewModel, normalizeInvoiceToCreateResponse, normalizeInvoiceToEditResponse, } from "@/lib/utils";
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
  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      billing_to: "individual" as "individual" | "company",

      billing_name: "",
      billing_phone: "",
      billing_email: "",

      billing_address: "",
      billing_state_id: "",
    },
  });
  const billingTo = form.watch("billing_to");
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const [isInfoLoading, setIsInfoLoading] = useState(false);


  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const jobCardId = searchParams.get("jobCardId");
  const [invoiceInfo, setInvoiceInfo] = useState<{
    selectedPlanId: string,
  }>({
    selectedPlanId: "",
  });
  useEffect(() => {
    if (!plans.length) return;

    const gstType = billingTo === "company" ? "cgst_sgst" : "igst";

    setPlans(prev =>
      prev.map(plan => calculateInvoiceRow(plan, gstType))
    );
  }, [billingTo]);
  function buildInvoicePayload(values: any) {
    return {
      billing_type: values.billing_to,

      billing_name: values.billing_name,
      billing_phone: values.billing_phone,
      billing_email: values.billing_email,
      billing_address: values.billing_address,
      billing_state_id: Number(values.billing_state_id),
      ...(billingTo === "company" && { billing_gstin: values.billing_gstin }),

      items: plans.map(plan => ({
        service_plan_id: plan.id,
        qty: Number(plan.qty || 1),
      })),
    };
  }
  const planColumns = useMemo(() => {
    const isCompany = billingTo === "company";

    return [
      {
        key: "plan_name",
        label: "Plan Name",
        width: "280px",
      },
      {
        key: "sac",
        label: "SAC",
        width: "90px",
        render: (v: string) => v ?? "-",
      },
      {
        key: "qty",
        label: "QTY",
        width: "90px",
        render: (v: string, row: any) => {
          console.log(v, row, 'rowrow');

          return v ?? row.qty ?? "-"
        },
      },
      {
        key: "price",
        label: "Price (₹)",
        width: "120px",
        render: (v: number) => `₹ ${v}`,
      },
      {
        key: "sub_amount",
        label: "Sub Amount",
        render: (v: number) => `₹ ${v ?? "-"}`,
      },

      ...(isCompany
        ? [
          {
            key: "cgst_amount",
            label: "CGST",
            render: (_: any, row: any) => (
              <span>
                ₹ {row.cgst_amount}
                <span className="text-green-600 text-xs pl-2">
                  ({row.cgst_percent}%)
                </span>
              </span>
            ),
          },
          {
            key: "sgst_amount",
            label: "SGST",
            render: (_: any, row: any) => (
              <span>
                ₹ {row.sgst_amount}
                <span className="text-green-600 text-xs pl-2">
                  ({row.sgst_percent}%)
                </span>
              </span>
            ),
          },
        ]
        : [
          {
            key: "igst_amount",
            label: "IGST",
            render: (_: any, row: any) => (
              <span>
                ₹ {row.igst_amount}
                <span className="text-green-600 text-xs pl-2">
                  ({row.igst_percent}%)
                </span>
              </span>
            ),
          },
        ]),

      {
        key: "total_amount",
        label: "Amount",
        render: (v: number) => `₹ ${v ?? "-"}`,
      },
    ];
  }, [billingTo]);
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
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  useEffect(() => {
    // if (!id) return;

    const loadInvoice = async () => {
      setIsInfoLoading(true);
      try {
        console.log(jobCardId, id, 'jobCardId');

        const res = jobCardId
          ? await getInvoiceInfoByJobCardPrefill({ id: jobCardId })
          : await getInvoiceInfo(mode === "edit" ? `${id}/edit` : id);
        if (mode == 'view')
          setInvoiceNumber(res?.data?.invoice_number)
        else if (mode === 'edit')
          setInvoiceNumber(res?.data?.invoice_data?.invoice_number)
        // 👇 normalize ONLY when jobCardId is NOT present
        const normalizedData = jobCardId
          ? res.data : normalizeInvoiceToCreateResponse(res.data);

        setAvailablePlans(normalizedData?.availableServices ?? [])
        // 👇 existing mapper stays SAME
        const mapped = mode === "edit" ? normalizeInvoiceToEditResponse(normalizedData) : mapInvoiceApiToPrefilledViewModel(normalizedData);

        setInvoiceView(mapped);

        const gstType = mapped.customer.type === "company" ? "cgst_sgst" : "igst";
        const planCalculated = mapped.plans.map((item: any) =>
          calculateInvoiceRow(item, gstType)
        );
        setPlans(planCalculated);

        // 🔑 billing state

        const customer = mapped.billing_prefill;

        const company = mapped.billing_prefillCompany;
        console.log(customer, 'customercustomer');

        // 🔑 decide billing_to
        const billingTo =
          mapped.customer.type === "company" ? "company" : "individual";

        form.setValue("billing_to", billingTo);
        console.log(billingTo, company, 'billingTo');

        if (billingTo === "individual") {
          console.log('came in indidivual billingTo');

          // 🏢 COMPANY
          form.setValue("billing_name", customer.name ?? "");
          form.setValue(
            "billing_phone",
            customer.phone ?? customer.phone ?? ""
          );
          form.setValue("billing_email", customer.email ?? "");
          form.setValue("billing_address", customer.address ?? "");
          form.setValue(
            "billing_state_id",
            String(customer.state_id ?? "")
          );
        } else {
          console.log(company, 'came in company billingTo');
          // 👤 INDIVIDUAL
          form.setValue("billing_name", company.name ?? "");
          form.setValue("billing_phone", company.phone ?? "");
          form.setValue("billing_email", company.email ?? "");
          form.setValue("billing_address", company.address ?? "");
          form.setValue(
            "billing_state_id",
            String(company.state_id ?? "")
          );
          form.setValue("billing_gstin", company.gstin ?? "");
        }



      } catch (e) {
        console.log(e);

      } finally {
        setIsInfoLoading(false);
      }
    };

    loadInvoice();
  }, [id]);
  function removePlan(planId: number) {
    setPlans(prev => prev.filter(p => p.id !== planId));
  }
  useEffect(() => {
    if (!invoiceView?.billing_prefill) return;

    const individual = invoiceView.billing_prefill;
    const company = invoiceView.billing_prefillCompany;

    const source =
      billingTo === "company" ? company : individual;

    if (!source) return;

    const setIfExists = (name: any, value: any) => {
      if (value !== null && value !== undefined && value !== "") {
        form.setValue(name, value, { shouldDirty: true });
        form.clearErrors(name); // ✅ clear only if value exists
      }
    };

    setIfExists("billing_name", source.name);
    setIfExists("billing_phone", source.phone);
    setIfExists("billing_email", source.email);
    setIfExists("billing_address", source.address);
    setIfExists("billing_state_id", source.state_id ? String(source.state_id) : "");
  }, [billingTo, invoiceView, form]);

  const [states, setStates] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      setLoadingState(true);
      const stateList = await fetchStateList(101); // 🇮🇳 India
      setStates(stateList);
      setLoadingState(false);
    };

    loadStates();
  }, []);

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
      const payload = {
        ...buildInvoicePayload(values),
        url: mode !== "edit" && jobCardId ? `job-cards/${jobCardId}/invoice` : `invoices/${id}/update`
      };
      console.log("FINAL PAYLOAD 👉", payload);

      await createInvoice(payload);

      toast({
        title: "Add Invoice",
        description: "Invoice added successfully",
        variant: "success",
      });

      navigate("/invoices");
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;


      // 👇 THIS IS THE KEY PART
      if (apiErrors && err?.response?.status === 422) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          form.setError(field as any, {
            type: "server",
            message: (messages as string[])[0],
          });
        });
        return;
      }
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
  const InfoIfExists = ({ value, ...props }: any) => {
    if (value === null || value === undefined || value === "") return null
    return <Info gap="gap-12" colon={false} justify="justify-between" {...props} value={value} />
  }

  const isView = mode === "view";

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

        <h1 className="text-lg font-semibold flex-1">Invoice {mode == 'create' ? `of Job Card #${jobCardId}` : `#${invoiceNumber}`}</h1>
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
        {invoiceView?.customer && <Card className="p-4">
          <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
            Customer Detail
          </CardTitle>
          <div className="space-y-2">
            <InfoIfExists
              label="Name"
              value={invoiceView?.customer?.name}
            />
            <InfoIfExists
              label="Phone"
              value={invoiceView?.customer?.phone}
            />
            <InfoIfExists
              label="Email"
              value={invoiceView?.customer?.email}
            />
            <InfoIfExists
              label="Address"
              value={invoiceView?.customer?.address}
            />
          </div>
        </Card>}

        {invoiceView?.vehicle && <Card className="p-4">
          <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
            Vehicle Info  </CardTitle>   <div className="space-y-2">
            <InfoIfExists label="Type" value={invoiceView?.vehicle?.type} />
            <InfoIfExists label="Make" value={invoiceView?.vehicle?.make} />
            <InfoIfExists label="Model" value={invoiceView?.vehicle?.model} />
            <InfoIfExists label="Reg No" value={invoiceView?.vehicle?.reg_no} />
            <InfoIfExists label="Year" value={invoiceView?.vehicle?.make_year} />
            <InfoIfExists label="Color" value={invoiceView?.vehicle?.color} />
            <InfoIfExists label="Chassis No" value={invoiceView?.vehicle?.chassisNo} />
            <InfoIfExists label="Remark" value={invoiceView?.vehicle?.remark} />

          </div>
        </Card>
        }
        {invoiceView?.jobcard && <Card className="p-4">
          <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
            Jobcard Info
          </CardTitle>
          <div className="space-y-2">
            <InfoIfExists label="Service Date" value={invoiceView?.jobcard.jobcard_date} />
            <InfoIfExists label="Edited Date" value={invoiceView?.jobcard.edited_date} />
          </div>
        </Card>}
      </div>

      {/* Plans */}
      <Card className="p-4 lg:col-span-3">
        <CardTitle className=" text-sm font-semibold  text-gray-700 flex gap-2 items-center">
          PLAN INFO
        </CardTitle>
        <Form {...form}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

            <FloatingRHFSelect
              name="billing_to"
              label="Billing To"
              control={form.control}
              isDisabled={isView}
              isRequired
              options={[
                { label: "Individual", value: "individual" },
                { label: "Company", value: "company" },
              ]}
            />

            <FloatingField
              name="billing_name"
              label="Name"

              isDisabled={isView}
              control={form.control}
              isRequired
            />

            <FloatingField
              name="billing_phone"
              label="Phone"

              isDisabled={isView}
              control={form.control}
              isRequired
            />

            <FloatingField
              name="billing_email"

              isDisabled={isView}
              label="Email"
              control={form.control}
              isRequired
            />

            <FloatingRHFSelect
              name="billing_state_id"
              label="State"
              control={form.control}

              isDisabled={isView}
              isRequired
              options={states.map(s => ({
                label: s.name,
                value: String(s.id),
              }))}
            />
            {form.getValues("billing_to") === 'company' && <FloatingField
              name="billing_gstin"
              label="GSTIN"
              control={form.control}
              isDisabled={isView}
            />}
          </div>

          <div className="mt-4">
            <FloatingTextarea

              isView={isView}
              name="billing_address"
              rows={2}
              label="Billing Address"
              control={form.control}
              isRequired
            />
          </div>
        </Form>
        {mode !== 'view' && <div className="flex items-end gap-3 mt-3 ">

          <div className="w-72">


            <select
              value={invoiceInfo.selectedPlanId}
              onChange={(e) => setInvoiceInfo((prev) => ({ ...prev, selectedPlanId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select Plan</option>
              {availablePlans.map((plan) => (
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

              const plan = availablePlans.find(
                (p) => String(p.id) === invoiceInfo.selectedPlanId
              );
              if (!plan) return;

              const gstType = billingTo === "company" ? "cgst_sgst" : "igst";

              setPlans(prev => {
                const existing = prev.find(p => p.id === plan.id);

                // ✅ IF PLAN ALREADY EXISTS → INCREMENT QTY
                if (existing) {
                  return prev.map(p =>
                    p.id === plan.id
                      ? calculateInvoiceRow(
                        { ...p, qty: Number(p.qty || 1) + 1 },
                        gstType
                      )
                      : p
                  );
                }

                // ✅ FIRST TIME ADD → QTY = 1
                return [
                  ...prev,
                  calculateInvoiceRow(
                    { ...plan, qty: 1 },
                    gstType
                  ),
                ];
              });

              setInvoiceInfo({ selectedPlanId: "" });
            }}
          >
            Add Plan
          </Button>
        </div>}
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
              <Box className="gap-3">
                <IconButton
                  size="xs"
                  mr={2}
                  colorScheme="red"
                  disabled={plans.length <= 1 || isView}
                  aria-label="Delete"
                  onClick={() => removePlan(row.id)}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Box>
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
                Sub Total Amount:
              </span>
              <span className="font-medium">
                ₹ {costSummary.subTotal}
              </span>
            </div>

            {form.getValues("billing_to") === "company" ? (
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
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Grand Total Amount:</span>
              <span>
                ₹ {costSummary?.grandTotal}
              </span>
            </div>

          </div>
        </div>
      </Card>
      {mode !== 'view' &&
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

        </div>}

    </div>
  );
}
