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
import { warrantyType } from "@/lib/mockData";
import { InvoicePaymentFormProp, InvoicePaymentFormValues, InvoicePaymentValues, MailValues, organizationFormType, SendMailFormProp, serviceFormProp, serviceFormType, userFormProp, UserFormType } from "@/lib/types";
import { createInvoicePaymentSchema, MailSchema, organizationSchema, servicePlanSchema, userSchema } from "@/lib/schema";
import RHFSelect from "@/components/RHFSelect";
import { Textarea } from "@/components/ui/textarea";
import { unknown } from "zod";
import { useAuth } from "@/lib/auth";
import { fetchCityList, fetchStateList, getInfo, getInvoicePayments,  } from "@/lib/api";
import { Pencil, Trash2, X } from "lucide-react";
import { findIdByName } from "@/lib/utils";
import { RequiredMark } from "@/components/common/RequiredMark";
import { SectionCard } from "@/components/common/card";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingRHFModalSelect } from "@/components/common/FloatingRHFModalSelect"
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { Loader } from "@/components/common/loader";
import { MultiEmailInput } from "@/components/common/MultiEmailInput";

export default function SendMailtForm({
    id,
    onClose,
    initialValues,
    isLoading = false,
    open,
    onSubmit,
}: SendMailFormProp) {

    const form = useForm<MailValues>({
        resolver: zodResolver(MailSchema),
        defaultValues: {
            email_to: [],
            message: "",
            ...initialValues,

            subject: initialValues?.subject ?? "",
        },
    });

    const [isDataLoading, setIsDataLoading] = useState(false);
    const fetchMailInfo = async (isLoaderHide = false) => {
        try {
            if (!isLoaderHide)
                setIsDataLoading(true);

            const res =
                await getInfo(initialValues?.id ?? "",'email');

            const mappedData = res.data
            form.setValue("email_to", mappedData.email_to);
            form.setValue("message", mappedData.message);
            form.setValue("subject", mappedData.subject);
        } catch (e) {
            console.error(e);

        } finally {
            if (!isLoaderHide)
                setIsDataLoading(false);
        }
    };

    useEffect(() => {
        if (id)
            fetchMailInfo(false);
    }, [initialValues]);
    return (
        <Form {...form}>
            <form
                id={id}
                onSubmit={form.handleSubmit((values) =>
                    onSubmit(values, form.setError)
                )}
            >
                {
                    isDataLoading ?
                        <div className="min-h-[150px] flex justify-center items-center">
                            <div className="p-3 text-sm "><Loader /></div>
                        </div> : <div className="pb-4  max-h-[60vh] overflow-y-auto">
                            <SectionCard className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <FloatingField
                                        name="email_to"
                                        label="To"
                                        control={form.control}
                                        isRequired
                                        render={({ field }) => (
                                            <MultiEmailInput
                                                value={field.value ?? []}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />


                                    <FloatingField
                                        name="subject"
                                        label="Subject"
                                        isRequired={true}
                                        type="text"
                                        control={form.control}
                                    />

                                    <FloatingTextarea
                                        isRequired
                                        name="message"
                                        rows={6}
                                        label="Message"
                                        control={form.control}
                                    />

                                </div>
                            </SectionCard>


                        </div>

                }

                {/* ================= ACTIONS ================= */}
                {
                    <div className="">
                        <div className="flex justify-end gap-3 pb-4 pr-4  border-t pt-[24px]">
                            <Button
                                variant="outline"
                                disabled={isLoading || isDataLoading}
                                className={'hover:bg-[#E3EDF6] hover:text-[#000] h-8 text-xs'}
                                onClick={onClose}
                            >
                                {'Cancel'}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || isDataLoading}
                                className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] h-8 text-xs"
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
                                    ? "Sending..." : "Send"
                                }
                            </Button>
                        </div></div>}
            </form>
        </Form>
    );
}
