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
import { fetchCityList, fetchStateList, getInvoicePayments } from "@/lib/api";
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

    const form = useForm<InvoicePaymentFormValues>({
        resolver: zodResolver(invoicePaymentSchema),
        defaultValues: {
            grand_total: "",
            paid_amount: "",
            total_due: "",

            received_amount: "",
            txn_id: '',

            payment_mode: "",
            payment_date: "",

            remarks: "",
        },
    });
    const [paymentMode, setPaymentMode] = useState([])

    const [isListLoading, setIsDataLoading] = useState(true);
    const fetchPayments = async (isLoaderHide = false) => {
        try {
            if (!isLoaderHide)
                setIsDataLoading(true);

            const res =
                await getInvoicePayments(initialValues ?? "");
            console.log(res.data, 'res.data');

            const mappedData = res.data
            setPaymentMode(res.payment_modes)
            console.log(mappedData, 'mappedData');

            form.setValue("grand_total", mappedData.grand_total);

            form.setValue("total_due", mappedData.total_due);

            form.setValue("paid_amount", mappedData.paid_amount);

        } catch (e) {
            console.error(e);

        } finally {
            if (!isLoaderHide)
                setIsDataLoading(false);
        }
    };

    useEffect(() => {
        if (initialValues)
            fetchPayments(false);
    }, [initialValues]);

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
                                name="grand_total"
                                label="Invoice Total"
                                control={form.control}
                                isView
                            />
                            <FloatingField
                                name="paid_amount"
                                label="Already Received"
                                control={form.control}
                                isView
                            />
                            <FloatingField
                                name="total_due"
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
                                type="text"
                                isRequired
                                control={form.control}
                                maxAmount={form.getValues('total_due')}
                            />

                            <FloatingField
                                name="txn_id"
                                label="Transaction Id"
                                isRequired
                                type="text"
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

                            <FormField
                                control={form.control}
                                name="payment_mode"
                                disabled={mode === "view"}
                                render={({ field }) => (
                                    <FormItem className="flex justify-between items-center">
                                        <FormLabel  className="text-muted-foreground">
                                            Payment Mode <RequiredMark show /> 
                                        </FormLabel>
<div className="flex flex-col items-start gap-2">
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="w-full h-10 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring"
                                            >
                                                <option value="" disabled>Select mode</option>

                                                {paymentMode.map((item: any) => (
                                                    <option key={item.value ?? item.id} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>

                                        <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </SectionCard>

                    <SectionCard title="Additional Note" className="mt-0">
                        <FloatingTextarea
                            name="remarks"
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
