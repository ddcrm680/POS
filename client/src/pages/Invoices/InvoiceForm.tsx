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

const invoiceViewMock = {
  invoice_no: "CO/25-26/2",
  status: "Open",
  customer: {
    bill_to: "Detailing Devils ss",
    name: "Detailing Devils ss",
    phone: "6647123413",
    email: "admin@pos.com",
    address: "124r35",
  },
  vehicle: {
    type: "Luxury Mini SUV",
    make: "HYUNDAI",
    model: "CRETA",
    reg_no: "wqdqwe12",
    make_year: "2025",
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

function InfoRow({ label, value }:any) {
  return (
    <div className="flex justify-between py-1 text-sm border-b last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "-"}</span>
    </div>
  );
}

export default function InvoiceForm() {
  const d = invoiceViewMock;
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

  {
    key: "action",
    label: "Action",
    width: "80px",
    render: () => (
      <button className="bg-red-500 text-white rounded p-1">
        🗑
      </button>
    ),
  },
], []);
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ChevronLeft size={18} className="cursor-pointer" />
        <h1 className="text-lg font-semibold flex-1">Invoice #{d.invoice_no}</h1>
        <Badge className="bg-emerald-100 text-emerald-700">{d.status}</Badge>
      </div>

      {/* Top Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Customer Detail</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Bill To" value={d.customer.bill_to} />
            <InfoRow label="Name" value={d.customer.name} />
            <InfoRow label="Phone" value={d.customer.phone} />
            <InfoRow label="Email" value={d.customer.email} />
            <InfoRow label="Address" value={d.customer.address} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Vehicle Info</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Type" value={d.vehicle.type} />
            <InfoRow label="Make" value={d.vehicle.make} />
            <InfoRow label="Model" value={d.vehicle.model} />
            <InfoRow label="Reg No" value={d.vehicle.reg_no} />
            <InfoRow label="Year" value={d.vehicle.make_year} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Jobcard Info</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Jobcard Date" value={d.jobcard.jobcard_date} />
            <InfoRow label="Edited Date" value={d.jobcard.edited_date} />
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
    <Card>
  <CardContent className="p-4 space-y-3">
    <h4 className="text-sm font-semibold text-gray-700">
      NEW PLAN INFO
    </h4>

    <CommonTable
      columns={planColumns}
      data={invoicePlanMockData}
      searchable={false}
      isAdd={false}
      perPage={10}
      isLoading={false}
      total={invoicePlanMockData.length}
      tabDisplayName="Plans"
      page={1}
      setPage={() => {}}
      lastPage={1}
      hasNext={false}
    />

    {/* TOTALS */}
    <div className="flex justify-end text-sm mt-4">
      <div className="space-y-1 text-right">
        <p>Sub Total : ₹ 8040</p>
        <p>Extra Discount (0%) : ₹ 0</p>
        <p className="font-semibold">
          IGST Amount : ₹ 1447.2
        </p>
      </div>
    </div>
  </CardContent>
</Card>

    </div>
  );
}
