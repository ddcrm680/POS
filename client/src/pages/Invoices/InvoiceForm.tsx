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
import { invoicePlanMockData, warrantyType } from "@/lib/mockData";
import { InvoicePaymentFormProp, InvoicePaymentFormValues, organizationFormType, serviceFormProp, serviceFormType, userFormProp, UserFormType } from "@/lib/types";
import { invoicePaymentSchema, organizationSchema, servicePlanSchema, userSchema } from "@/lib/schema";
import RHFSelect from "@/components/RHFSelect";
import { Textarea } from "@/components/ui/textarea";
import { unknown } from "zod";
import { useAuth } from "@/lib/auth";
import { fetchCityList, fetchStateList } from "@/lib/api";
import { Pencil, Trash2, X } from "lucide-react";
import { findIdByName } from "@/lib/utils";
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

const invoiceViewMock = {
  invoice_no: "CO/25-26/2",
  status: "Open",
  customer: {
    bill_to: "Detailing Devils ss",
    name: "Detailing Devils ss",
    phone: "6647123413",
    email: "admin@pos.com",
    address: "124r35",
    adhar: "",
    panNo: "",
    gst: ""
  },
  vehicle: {
    type: "Luxury Mini SUV",
    make: "HYUNDAI",
    model: "CRETA",
    reg_no: "wqdqwe12",
    make_year: "2025",
    color: "Red",
    chassisNo: "",
    remark: ""

  },
  jobcard: {
    jobcard_date: "13-01-2026",
    edited_date: "07-01-2026 11:01 AM",
  },
  plans: [
    { id: 1, name: "Front Right Door Coating", amount: 3540 },
    { id: 2, name: "Front Bumper Coating", amount: 2407 },
  ],
  images: [
    { id: 1, label: "Vehicle Front", url: "https://placehold.co/300x200" },
    { id: 2, label: "Vehicle Rear", url: "https://placehold.co/300x200" },
  ],
};
const availablePlansMock = [
  {
    id: 101,
    plan_name: "Wheel Nano Armor",
    sac: "9997",
    visits: 1,
    price: 3000,
    discount_percent: 0,
    discount_amount: 0,
    sub_amount: 3000,
    igst_percent: 18,
    igst_amount: 540,
    total_amount: 3540,
  },
  {
    id: 102,
    plan_name: "Full Body Coating",
    sac: "9997",
    visits: 1,
    price: 15000,
    discount_percent: 0,
    discount_amount: 0,
    sub_amount: 15000,
    igst_percent: 18,
    igst_amount: 2700,
    total_amount: 17700,
  },
];

export default function InvoiceForm() {
  const d = invoiceViewMock;
  const [plans, setPlans] = useState(invoicePlanMockData);
const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [extraDiscountPercent, setExtraDiscountPercent] = useState(0);
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
    },

    {
      key: "visits",
      label: "No. Of Visits",
      width: "120px",
      align: "center",
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
      width: "120px",
      render: (v: number) => (
        <input
          type="number"
          defaultValue={v}
          className="w-16 border rounded px-1 py-0.5 text-xs"
        />
      ),
    },

    {
      key: "discount_amount",
      label: "Discount",
      width: "120px",
      render: (v: number) => (
        <input
          type="number"
          defaultValue={v}
          className="w-20 border rounded px-1 py-0.5 text-xs"
        />
      ),
    },

    {
      key: "sub_amount",
      label: "Sub Amount",
      width: "130px",
      render: (v: number) => `₹ ${v}`,
    },

    {
      key: "igst_amount",
      label: "IGST(%)",
      width: "150px",
      render: (_: any, row: any) => (
        <span>
          ₹ {row.igst_amount}{" "}
          <span className="text-green-600 text-xs">
            ({row.igst_percent}%)
          </span>
        </span>
      ),
    },

    {
      key: "total_amount",
      label: "Amount",
      width: "130px",
      render: (v: number) => `₹ ${v}`,
    },


  ], []);
const costSummary = useMemo(() => {
  const totalItems = plans.length;

  const subTotal = plans.reduce(
    (sum, item) => sum + Number(item.sub_amount || 0),
    0
  );

  const igstTotal = plans.reduce(
    (sum, item) => sum + Number(item.igst_amount || 0),
    0
  );

  const extraDiscountAmount =
    (subTotal * Number(extraDiscountPercent || 0)) / 100;

  return {
    totalItems,
    subTotal,
    extraDiscountAmount,
    igstTotal,
  };
}, [plans, extraDiscountPercent]);
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ChevronLeft size={18} className="cursor-pointer" />
        <h1 className="text-lg font-semibold flex-1">Invoice #{d.invoice_no}</h1>
        <Badge
          className={
            d.status
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-red-600 bg-red-50 text-red-700"
          }
        >
          {d.status}
        </Badge>
      </div>

      {/* Top Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
            Customer Detail
          </CardTitle>
          <div className="space-y-2">
            <Info gap="gap-12" colon={false} justify="justify-between" label="Bill To" value={d.customer.bill_to} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Name" value={d.customer.name} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Phone" value={d.customer.phone} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Email" value={d.customer.email} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Address" value={d.customer.address} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Aadhar" value={d.customer.adhar} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Pan No" value={d.customer.panNo} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="GSTIN" value={d.customer.gst} />

          </div>
        </Card>

        <Card className="p-4">
          <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
            Vehicle Info  </CardTitle>   <div className="space-y-2">

            <Info gap="gap-12" colon={false} justify="justify-between" label="Type" value={d.vehicle.type} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Make" value={d.vehicle.make} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Model" value={d.vehicle.model} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Reg No" value={d.vehicle.reg_no} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Year" value={d.vehicle.make_year} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Color" value={d.vehicle.color} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="  Chassis No" value={d.vehicle.chassisNo} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Remark" value={d.vehicle.remark} />

          </div>
        </Card>

        <Card className="p-4">
          <CardTitle className=" text-sm font-semibold mb-4 text-gray-700 flex gap-2 items-center">
            Jobcard Info
          </CardTitle>
          <div className="space-y-2">
            <Info gap="gap-12" colon={false} justify="justify-between" label="Jobcard Date" value={d.jobcard.jobcard_date} />
            <Info gap="gap-12" colon={false} justify="justify-between" label="Edited Date" value={d.jobcard.edited_date} />
          </div>
        </Card>
      </div>

      {/* Plans */}
      <Card className="p-4 lg:col-span-3">
        <CardTitle className=" text-sm font-semibold  text-gray-700 flex gap-2 items-center">
           PLAN INFO
        </CardTitle>

<div className="flex items-end gap-3 mt-3 ">
  <div className="w-72">


    <select
      value={selectedPlanId}
      onChange={(e) => setSelectedPlanId(e.target.value)}
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
      if (!selectedPlanId) return;

      const plan = availablePlansMock.find(
        (p) => String(p.id) === selectedPlanId
      );

      if (!plan) return;

      // ❌ prevent duplicate
      if (plans.some((p) => p.id === plan.id)) return;

      setPlans((prev) => [...prev, plan]);
      setSelectedPlanId("");
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
                ₹ {costSummary.subTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Extra Discount (%):
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={extraDiscountPercent}
                  onChange={(e) =>
                    setExtraDiscountPercent(Number(e.target.value || 0))
                  }
                  className="w-16 border rounded px-2 py-1 text-xs text-right"
                />
                <span className="text-muted-foreground">
                  ₹ {costSummary.extraDiscountAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-semibold border-t pt-2">
              <span>IGST Amount :</span>
              <span>
                ₹ {costSummary.igstTotal.toFixed(2)}
              </span>
            </div>

          </div>
        </div>
      </Card>

    </div>
  );
}
