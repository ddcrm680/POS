"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { SendWhatsapptFormProp, WhatsappValues } from "@/lib/types";
import { whatsappSchema } from "@/lib/schema";
import { RequiredMark } from "@/components/common/RequiredMark";
import { SectionCard } from "@/components/common/card";
import { getPhoneInfo } from "@/lib/api";
import { Loader } from "@/components/common/loader";

export default function SendOnWhatsappForm({
    id,
    onClose,
    initialValues,
    isLoading = false,
    onSubmit,
}: SendWhatsapptFormProp) {

    const form = useForm<WhatsappValues>({
        resolver: zodResolver(whatsappSchema),
        defaultValues: {
            phone: "",
            ...initialValues,
        },
    });

    const [isDataLoading, setIsDataLoading] = useState(false);
    const fetchMailInfo = async (isLoaderHide = false) => {
        try {
            if (!isLoaderHide)
                setIsDataLoading(true);

            const res =
                await getPhoneInfo(initialValues?.id ?? "");

            const mappedData = res.data
            form.setValue("phone", mappedData.phone);
        } catch (e) {
            console.error(e);

        } finally {
            if (!isLoaderHide)
                setIsDataLoading(false);
        }
    };

    useEffect(() => {
        form.reset({
            phone: "",
            ...initialValues,
        });
        //   if (initialValues)
        //       fetchMailInfo(false);
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
                                        </div> :    <div className="pb-4  max-h-[60vh] overflow-y-auto">
                        <SectionCard className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel style={{ color: "#000" }}>Whatsapp No.<RequiredMark show={true} /></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    inputMode="numeric"
                                                    maxLength={10}
                                                    placeholder="Enter whatsapp no."
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, "");
                                                        if (value.startsWith("0")) value = value.replace(/^0+/, "");
                                                        field.onChange(value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
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
