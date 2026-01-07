"use client";

import { useEffect, useRef, useState } from "react";
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
import { warrantyType } from "@/lib/mockData";
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

export default function InvoicePaymentForm({
    mode,
    id,
    onClose,
    initialValues,
    isLoading = false,
    onSubmit,
}: InvoicePaymentFormProp) {
    const { countries, user } = useAuth();
    const [existingOrgImage, setExistingOrgImage] = useState<string | null>(null);

    const form = useForm<InvoicePaymentFormValues>({
        resolver: zodResolver(invoicePaymentSchema),
        defaultValues: {
            invoice_total: initialValues?.invoice_total ?? 0,
            already_received: initialValues?.already_received ?? 0,
            due_amount: initialValues?.due_amount ?? 0,

            received_amount: 0,
            net_amount: 0,

            payment_mode: "",
            payment_date: "",

            tax_deducted: "no",
            withholding_tax: undefined,

            note: "",
        },
    });
    const receivedAmount = form.watch("received_amount");
    const withholdingTax = form.watch("withholding_tax") ?? 0;
    const taxDeducted = form.watch("tax_deducted");

    useEffect(() => {
        const net =
            taxDeducted === "yes"
                ? Math.max(receivedAmount - withholdingTax, 0)
                : receivedAmount;

        form.setValue("net_amount", net);
    }, [receivedAmount, withholdingTax, taxDeducted]);

    const isView = mode === "view";
    const isCreate = mode === "create";
    return (
        <Form {...form}>
            <form
                id={id}
                onSubmit={form.handleSubmit((values) =>
                    onSubmit(values, form.setError)
                )}
            >
                <div className="pb-4  max-h-[60vh] overflow-y-auto">
                    <SectionCard title="Invoice Summary" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FloatingField
                                name="invoice_total"
                                label="Invoice Total"
                                control={form.control}
                                isView
                            />
                            <FloatingField
                                name="already_received"
                                label="Already Received"
                                control={form.control}
                                isView
                            />
                            <FloatingField
                                name="due_amount"
                                label="Due Amount"
                                control={form.control}
                                isView
                            />
                        </div>
                    </SectionCard>

                    <SectionCard title="Payment Details" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FloatingField
                                name="received_amount"
                                label="Received Amount"
                                type="number"
                                isRequired
                                control={form.control}
                            />

                            <FloatingField
                                name="net_amount"
                                label="Net Amount"
                                type="number"
                                isView
                                control={form.control}
                            />

                            <FloatingField
                                name="payment_date"
                                label="Payment Date"
                                type="date"
                                isRequired
                                control={form.control}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <FloatingRHFSelect
                                name="payment_mode"
                                label="Payment Mode"
                                isRequired
                                control={form.control}
                                options={[
                                    { label: "Cash", value: "cash" },
                                    { label: "UPI", value: "upi" },
                                    { label: "Card", value: "card" },
                                    { label: "Bank Transfer", value: "bank" },
                                ]}
                            />

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">
                                    Tax Deducted?
                                </label>
                                <div className="flex gap-4 text-sm">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            value="no"
                                            checked={taxDeducted === "no"}
                                            onChange={() => form.setValue("tax_deducted", "no")}
                                        />
                                        No
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            value="yes"
                                            checked={taxDeducted === "yes"}
                                            onChange={() => form.setValue("tax_deducted", "yes")}
                                        />
                                        Yes (TDS)
                                    </label>
                                </div>
                            </div>

                            {taxDeducted === "yes" && (
                                <FloatingField
                                    name="withholding_tax"
                                    label="Withholding Tax"
                                    type="number"
                                    isRequired
                                    control={form.control}
                                />
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard title="Additional Note"className="mt-0">
                        <FloatingTextarea
                            name="note"
                            label="Payment Note"
                            control={form.control}
                        />
                    </SectionCard>
                </div>

                {/* ================= ACTIONS ================= */}
                {mode !== 'view' &&
                    <div className="">
                        <div className="flex justify-end gap-3 pb-4 pr-4  border-t pt-[24px]">
                            <Button
                                variant="outline"
                                disabled={isLoading}
                                className={'hover:bg-[#E3EDF6] hover:text-[#000]'}
                                onClick={onClose}
                            >
                                {'Cancel'}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
                            >
                                {isLoading && <svg
                                    className="h-6 w-6 animate-spin text-[#fff]"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    />
                                </svg>}
                                {isLoading
                                    ? "Saving..." : "Save"
                                }
                            </Button>
                        </div></div>}
            </form>
        </Form>
    );
}
