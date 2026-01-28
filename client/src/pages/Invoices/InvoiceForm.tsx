"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconButton } from "@chakra-ui/react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Box } from "@chakra-ui/react";
import { invoiceSchema } from "@/lib/schema";
import { createInvoice, fetchStateList, getInvoiceInfo, getInvoiceInfoByJobCardPrefill, getInvoicePayments } from "@/lib/api";
import { Trash2, Info } from "lucide-react";
import { calculateInvoiceRow, formatDate, formatTime, mapInvoiceApiToPrefilledViewModel, normalizeInvoiceToCreateResponse, normalizeInvoiceToEditResponse, } from "@/lib/utils";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";

// export default function InvoicePaymentForm
// (
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import CommonTable from "@/components/common/CommonTable";
import { Info as InfoComp } from "@/components/common/viewInfo";
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

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const billingStateId = Number(
    useWatch({
      control: form.control,
      name: "billing_state_id",
    })
  );
  const isSameState = useMemo(() => {
    const storeStateId = invoiceView?.store?.state_id

    return billingStateId && storeStateId &&
      billingStateId === storeStateId
  }, [billingStateId, invoiceView]);

  const mode = searchParams.get("mode");
  const isView = mode === "view";
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
  const [filterMetaInfo, setFilterMetaInfo] = useState<{ status: { value: string, label: string }[] }>({
    status: []
  });
  const [filters, setFilters] = useState({
    status: "",
    mode: ""
  });

  // const [extraDiscountPercent, setExtraDiscountPercent] = useState('')

  const costSummary = useMemo(() => {
    const subTotal = plans.reduce(
      (sum, p) => sum + Number(p.sub_amount || 0),
      0
    );
    const totalItems = plans.reduce(
      (sum, p) => sum + Number(p.qty || 1),
      0
    );
    const discountTotal = plans.reduce(
      (sum, p) => sum + Number(p.discount_amount || 0),
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

    const grandTotal =
      subTotal + cgstTotal + sgstTotal + igstTotal;

    return {
      subTotal: +subTotal.toFixed(2),
      discountTotal: +discountTotal.toFixed(2),
      cgstTotal: +cgstTotal.toFixed(2),
      sgstTotal: +sgstTotal.toFixed(2),
      igstTotal: +igstTotal.toFixed(2),
      totalItems,
      grandTotal: +grandTotal.toFixed(2),

    };
  }, [plans]);

  //  const extraDiscountAmount =
  //   (costSummary.grandTotal * Number(extraDiscountPercent || 0)) / 100;

  const finalGrandTotal =
    costSummary.grandTotal;
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const billingTo = form.watch("billing_to");
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const [isInfoLoading, setIsInfoLoading] = useState(false);

  const [planErrors, setPlanErrors] = useState<Record<string, string>>({});

  const jobCardId = searchParams.get("jobCardId");
  const [invoiceInfo, setInvoiceInfo] = useState<{
    selectedPlanId: string,
  }>({
    selectedPlanId: "",
  });
  useEffect(() => {
    if (!plans.length) return;

    const gstType = isSameState ? "cgst_sgst" : "igst"

    setPlans(prev =>
      prev.map(plan => calculateInvoiceRow(plan, gstType))
    );
  }, [isSameState, billingStateId]);
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
        discount_percent: plan.discount_percent,
        discount_amount: plan.discount_amount
      })),
    };
  }
  const CellError = ({ message }: { message?: string }) => {
    if (!message) return null;

    return (
      <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 group " title={message}>
        <Info className="w-3 h-3 text-red-500 cursor-pointer" />

      </div>
    );
  };

  const planColumns = useMemo(() => {
    return [
      {
        key: "plan_name",
        label: "Name",
        width: "150px",
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
        align: "center",
        width: "90px",
        render: (_: any, row: any, rowIndex: number) => {
          const error = getPlanCellError(rowIndex, "qty");

          return (
            <div className="relative flex justify-center">
              <input
                type="text"
                inputMode="numeric"
                value={row.qty}
                className={`
            w-16 border rounded px-1 py-0.5 text-xs text-center
            ${error ? "border-red-500" : ""}
          `}
                onChange={(e) => {
                  clearPlanCellError(rowIndex, "qty");
                  let value = e.target.value.replace(/\D/g, "");

                  // allow empty while typing
                  if (value === "") {
                    setPlans(prev =>
                      prev.map(p =>
                        p.id === row.id
                          ? { ...p, qty: "" }
                          : p
                      )
                    );
                    return;
                  }
                  let qty = Number(value);

                  // 🔒 enforce limits: 1 → 1000
                  if (qty < 1) qty = 1;
                  if (qty > 1000) qty = 1000;

                  const gstType = isSameState ? "cgst_sgst" : "igst"

                  setPlans(prev =>
                    prev.map(p =>
                      p.id === row.id
                        ? calculateInvoiceRow({ ...p, qty }, gstType)
                        : p
                    )
                  );
                }}
                onBlur={() => {
                  // normalize on blur
                  if (!row.qty || Number(row.qty) < 1) {
                    const gstType = isSameState ? "cgst_sgst" : "igst"
                    setPlans(prev =>
                      prev.map(p =>
                        p.id === row.id
                          ? calculateInvoiceRow({ ...p, qty: 1 }, gstType)
                          : p
                      )
                    );
                  }
                }}
              />

              <CellError message={error} />
            </div>
          );
        },
      },
      {
        key: "price",
        label: "Price (₹)",
        width: "120px",
        render: (v: number) => `₹ ${v}`,
      },
      {
        key: "discount_percent",
        label: "Dis.(%)",
        width: "90px",
        render: (_: any, row: any, rowIndex: number) => {
          const error = getPlanCellError(rowIndex, "discount_percent");

          return (
            <div className="relative flex justify-center">
              <input
                type="text"
                value={row.discount_percent}
                className={`
            w-16 border rounded px-1 py-0.5 text-xs text-center
            ${error ? "border-red-500" : ""}
          `}
                onChange={(e) => {
                  clearPlanCellError(rowIndex, "discount_percent");

                  const value = e.target.value;
                  if (value === "") {
                    setPlans(prev =>
                      prev.map(p =>
                        p.id === row.id
                          ? { ...p, discount_percent: "", _discountSource: "percent" }
                          : p
                      )
                    );
                    return;
                  }
                  // allow decimal typing
                  // ❌ block 00, 000 etc
                  if (!/^(?:0|[1-9]\d*)(?:\.\d{0,4})?$/.test(value)) return;

                  if (!/^\d*(\.\d{0,4})?$/.test(value)) return;
                  if (Number(value) > 100) return;

                  setPlans(prev =>
                    prev.map(p =>
                      p.id === row.id
                        ? calculateInvoiceRow(
                          { ...p, discount_percent: value, _discountSource: "percent" },
                          isSameState ? "cgst_sgst" : "igst"
                        )
                        : p
                    )
                  );
                }}
                onBlur={() => {
                  if (!row.discount_percent) {
                    setPlans(prev =>
                      prev.map(p =>
                        p.id === row.id
                          ? calculateInvoiceRow(
                            { ...p, discount_percent: 0 },
                            isSameState ? "cgst_sgst" : "igst"
                          )
                          : p
                      )
                    );
                  }
                }}
              />

              <CellError message={error} />
            </div>
          );
        },
      },
      {
        key: "discount_amount",
        label: "Discount (₹)",
        width: "120px",
        render: (_: any, row: any, rowIndex: number) => {
          const error = getPlanCellError(rowIndex, "discount_amount");

          return (
            <div className="relative flex justify-center">
              <input
                type="text"
                value={row.discount_amount}
                className={`
            w-16 border rounded px-1 py-0.5 text-xs text-center
            ${error ? "border-red-500" : ""}
          `}
                onChange={(e) => {
                  clearPlanCellError(rowIndex, "discount_amount");

                  const value = e.target.value;

                  if (value === "") {
                    setPlans(prev =>
                      prev.map(p =>
                        p.id === row.id
                          ? { ...p, discount_amount: "", _discountSource: "amount" }
                          : p
                      )
                    );
                    return;
                  }
                  // ❌ block 00, 000 etc
                  if (!/^(?:0|[1-9]\d*)(?:\.\d{0,2})?$/.test(value)) return;

                  // allow decimals
                  if (!/^\d*(\.\d{0,2})?$/.test(value)) {


                    return
                  }

                  setPlans(prev =>
                    prev.map(p =>
                      p.id === row.id
                        ? calculateInvoiceRow(
                          { ...p, discount_amount: value, _discountSource: "amount" },
                          isSameState ? "cgst_sgst" : "igst"
                        )
                        : p
                    )
                  );
                }}
                onBlur={() => {
                  if (!row.discount_amount) {
                    setPlans(prev =>
                      prev.map(p =>
                        p.id === row.id
                          ? calculateInvoiceRow({ ...p, discount_amount: 0 }, isSameState ? "cgst_sgst" : "igst")
                          : p
                      )
                    );
                  }
                }}
              />

              <CellError message={error} />
            </div>
          );
        },
      },
      {
        key: "sub_amount",
        label: "Sub Total",

        width: "120px",
        render: (v: number) => `₹ ${v ?? "-"}`,
      },

      ...(isSameState
        ? [
          {
            key: "cgst_amount",
            label: "CGST",
            width: "120px",
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
            width: "120px",
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
            
            width: "120px",
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
        label: "Total",
        width: "120px",
        render: (v: number) => `₹ ${v ?? "-"}`,
      },

      ...(!isView
        ? [
          {
            key: "amount",
            label: "Action",
            width: "120px",
            render: (_: any, row: any) => (
              <Box className="gap-3">
                <IconButton
                  size="xs"
                  mr={2}
                  colorScheme="red"
                  // disabled={plans.length <= 1}
                  title="Delete"
                  aria-label="Delete"
                  onClick={() => removePlan(row.id)}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            ),
          },
        ]
        : []),
    ];
  }, [
    isSameState,
    isView,
    plans.length,
    setPlans,
    removePlan,
    calculateInvoiceRow,
  ]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  useEffect(() => {
    // if (!id) return;

    const loadInvoice = async () => {
      setIsInfoLoading(true);
      try {

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
        const planCalculated = mapped.plans.map((item: any) => {

          return calculateInvoiceRow(item, gstType)
        }
        );

        setPlans(planCalculated);

        // 🔑 billing state

        const customer = mapped.billing_prefill;

        const company = mapped.billing_prefillCompany;

        // 🔑 decide billing_to
        const billingTo =
          mapped.customer.type === "company" ? "company" : "individual";

        form.setValue("billing_to", billingTo);

        if (billingTo === "individual") {

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
    if (id || jobCardId )
      loadInvoice();
  }, [id, jobCardId,mode]);
  const clearPlanCellError = (rowIndex: number, field: string) => {
    setPlanErrors(prev => {
      const next = { ...prev };
      delete next[`items.${rowIndex}.${field}`];
      return next;
    });
  };
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

  const addPlanRef = useRef<HTMLSelectElement | null>(null);
  const { toast } = useToast();
  async function handleInvoiceSubmission(values: any) {

    if (!plans.length) {
      toast({
        title: "No Plans Added",
        description: "Please add at least one plan",
        variant: "destructive",
      });

      // ✅ focus Add Extra Plan selector
      addPlanRef.current?.focus();
      return;
    }
    try {
      setIsLoading(true);
      const payload = {
        ...buildInvoicePayload(values),
        url: mode !== "edit" && jobCardId ? `job-cards/${jobCardId}/invoice` : `invoices/${id}/update`
      };

      await createInvoice(payload);

      toast({
        title: id ? "Update Invoice" : "Add Invoice",
        description: `Invoice ${id ? "updated" : "added"} successfully`,
        variant: "success",
      });

      navigate("/invoices");
    } catch (err: any) {

      const apiErrors = err?.response?.data?.errors;


      // 👇 THIS IS THE KEY PART
      if (apiErrors && err?.response?.status === 422) {
        const tableErrors: Record<string, string> = {};

        Object.entries(apiErrors).forEach(([field, messages]) => {
          const message = (messages as string[])[0];

          // 🔹 Plan table errors (items.*)
          if (field.startsWith("items.")) {
            tableErrors[field] = message;
            return;
          }

          // 🔹 Normal form fields
          form.setError(field as any, {
            type: "server",
            message,
          });
        });

        // ✅ Save plan errors separately
        if (Object.keys(tableErrors).length) {
          setPlanErrors(tableErrors);

          toast({
            title: "Error",
            description: err?.response?.data?.message,
            variant: "destructive",
          });

        }

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
  const InfoIfExists = ({ value, ...props }: any) => {
    if (value === null || value === undefined || value === "") return null
    return <InfoComp gap="gap-12" colon={false} justify="justify-between" {...props} value={value} />
  }
  const getPlanCellError = (rowIndex: number, field: string) => {
    return planErrors[`items.${rowIndex}.${field}`];
  };
  const paymentColumn = [
    /* ================= CREATED DATE ================= */
    {
      key: "created_at",
      label: "Created Date",
      align: "center",
      width: "120px",
      render: (value: string) => (
        <Box className="flex flex-col">
          <span className="font-medium">{formatDate(value)}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(value)}
          </span>
        </Box>
      ),
    },
    {
      key: "payment_date",
      label: "Payment Date",
      align: "center",
      width: "120px",
      render: (value: string) => (
        <Box className="flex flex-col">
          <span className="font-medium">{formatDate(value)}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(value)}
          </span>
        </Box>
      ),
    },

    /* ================= CONSUMER ================= */
    {
      key: "amount",
      label: "Recieved amount",
      width: "180px",
      render: (value: number) => (
        <span>₹ {value ?? 0}</span>
      ),
    },


    /* ================= BALANCE DUE ================= */
    {
      key: "remarks",
      label: "Notes",
      width: "180px",

    },
    {
      key: "payment_mode",
      label: "Mode",
      width: "120px",

    },
    /* ================= PAYMENT STATUS ================= */
    {
      key: "status",
      label: "Status",
      width: "120px",
      render: (value: string) => {
        const styles: Record<string, string> = {
          issued: "bg-yellow-100 text-yellow-700",
          recieved: "bg-emerald-100 text-emerald-700",
          cancelled: "bg-red-100 text-red-700",
          "Partially-Paid": "bg-blue-100 text-blue-700",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[value]}`}

          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      },
    },

  ];

  const [isListLoading, setIsListLoading] = useState(true);

  const [payments, setPayments] = useState<Array<any>>([]);
  const fetchPayments = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);

      const res =
        await getInvoicePayments(id ?? "");

      const mappedData = res.data?.payments.map((item: any) => ({
        ...item,
        invoice_number: item.invoice?.invoice_number
      }))

      // setHasNext(res.meta.has_next)
      // setTotal(res.meta.total)
      setPayments(mappedData);
      // setLastPage(res.meta.last_page);
      // setFilterMetaInfo(res.meta.filters)
    } catch (e) {
      console.error('error coming', e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "view")
      fetchPayments(false);
  }, []);
  function resetFilter() {
    setSearch('')
    setPage(1)
    setFilters({
      status: "",
      mode: ""
    })
  }
  return (
    <div className=" mx-auto p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            sessionStorage.removeItem('sidebar_active_parent')
            window.history.back()
          }}
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
      {
        isInfoLoading && id ?
          <Card className="mb-6"><div className="min-h-[150px] flex justify-center items-center">
            <div className="p-4 text-sm "><Loader /></div>
          </div></Card> : <>
            {/* Top Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              <CardTitle className=" text-sm font-semibold  text-gray-700 flex gap-4 items-center">
                Billing Info
              </CardTitle>
              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

                  <FloatingRHFSelect
                    name="billing_to"
                    label="Bill To"
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
                    rows={1}
                    label="Billing Address"
                    control={form.control}
                    isRequired
                  />
                </div>
              </Form>
              {mode !== 'view' && <div className="flex items-end gap-3 mt-3 ">

                <div >
                  <select
                    value=""
                    ref={addPlanRef}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) return;

                      const plan = availablePlans.find(
                        (p) => String(p.id) === selectedId
                      );
                      if (!plan) return;

                      const gstType = isSameState ? "cgst_sgst" : "igst"

                      setPlans(prev => {
                        const existing = prev.find(p => p.id === plan.id);

                        // ✅ If already exists → increment qty
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

                        // ✅ First time add → qty = 1
                        return [
                          ...prev,
                          calculateInvoiceRow({ ...plan, qty: 1 }, gstType),
                        ];
                      });

                      // reset dropdown back
                      e.target.value = "";
                    }}
                    className="w-full border rounded-md px-3 py-2 text-xs"
                  >
                    <option value="">Add Extra Plan</option>
                    {availablePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.plan_name}
                      </option>
                    ))}
                  </select>
                </div>


              </div>}
              <CommonTable
                columns={planColumns}
                data={plans}
                searchable={false}
                isAdd={false}
                isLoading={false}
                total={plans.length}
                tabDisplayName="Plans"
                page={1}
                isTotal={false}
                setPage={() => { }}
                lastPage={1}
                hasNext={false}

              />

              {/* TOTALS */}
              <div className="flex md:justify-end ">
                <div className="w-[300px] text-xs space-y-2">

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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Discount :
                    </span>
                    <span className="font-medium">
                      ₹ {costSummary.discountTotal}
                    </span>
                  </div>

                  {isSameState ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          CGST  :
                        </span>
                        <span className="font-medium">
                          ₹ {costSummary.cgstTotal ?? "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          SGST  :
                        </span>
                        <span className="font-medium">
                          ₹ {costSummary.sgstTotal ?? "-"}
                        </span>
                      </div>
                    </>
                  ) : <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      IGST  :
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
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={extraDiscountPercent}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "");
                          if (/^0{2,}/.test(v)) return;
                          setExtraDiscountPercent(
                            v === "" ? "" : String(Math.min(Number(v), 100))
                          );
                        }}
                        onBlur={() => {
                          if (extraDiscountPercent === "") setExtraDiscountPercent("0");
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
            {/* Payments info */}
            {mode == 'view' && <Card className="p-4 lg:col-span-3">
              <CardTitle className=" text-sm font-semibold  text-gray-700 flex gap-2 items-center">
                PAYMENTS INFO
              </CardTitle>
              <CommonTable
                columns={paymentColumn}
                isClear={false}
                data={payments}
                isAdd={false}
                isTotal={false}
                searchable={false}
                perPage={perPage}
                setPerPage={setPerPage}
                resetFilter={resetFilter}
                isLoading={isListLoading}
                total={total}
                hasNext={has_next}
                tabType=""
                tabDisplayName="Payments"
                page={page}
                setPage={setPage}
                lastPage={lastPage}
                searchValue={search}
                onSearch={(value: string) => {
                  // if (value) {
                  setSearch(value);
                  setPage(1); // reset page on new search
                  // }
                }}

              />
            </Card>}
          </>
      }


      {mode !== 'view' &&
        <div className="  pb-4 flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            disabled={isLoading || isInfoLoading}
            className={'hover:bg-[#E3EDF6] hover:text-[#000] h-8 text-xs'}
            onClick={() => navigate("/invoices")}
          >
            {'Cancel'}
          </Button>

          {(
            <Button type="button"
              disabled={isLoading || isInfoLoading}
              onClick={form.handleSubmit(handleInvoiceSubmission)}
              className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] h-8 text-xs">
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

