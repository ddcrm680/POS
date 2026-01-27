"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { Box, Input, Textarea } from "@chakra-ui/react";
import { Check, Copy, Eye, EyeOff, RefreshCcw } from "lucide-react";

import { Form } from "@/components/ui/form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProductFormType, ProductModalInterface, userFormProp, UserForm as UserFormType, } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Box } from "@chakra-ui/react";
import { Textarea } from "@/components/ui/textarea";
import { productCountSchema, userSchema } from "@/lib/schema";
import { RequiredMark } from "@/components/common/RequiredMark";
import { generateStrongPassword } from "@/lib/utils";
import { CopyButton } from "@/components/common/CopyButton";

export default function ProductSellStockCountHandlerModal({
    roles,
    id,
    onClose,
    initialValues,
    isLoading = false,
    onSubmit,
}: ProductModalInterface) {
console.log(initialValues,'initialValues');

    const form = useForm<ProductFormType>({
        resolver: zodResolver(productCountSchema(initialValues)),
        defaultValues: {
            count: "",
            ...initialValues?.info,
             remarks:initialValues?.info?.remarks?? "",
        },
    });


    // Reset form when initialValues?.info change (important for edit)
    useEffect(() => {
        form.reset({
            count: "",
            ...initialValues?.info,
            
             remarks:initialValues?.info?.remarks?? "",
        });
    }, [initialValues]);

    return (
        <Form {...form}>
            <form
                id={id}
                onSubmit={form.handleSubmit((values) =>
                    onSubmit(values, form.setError)
                )}
                className="space-y-3 "
            >  <div className="p-4 space-y-3 max-h-[500px] overflow-auto">
                    {/* Row 1 */}

                    {/* Row 2 */}
                    <div className={`grid grid-cols-1  gap-4`}>
                            <FormField
                                control={form.control}
                                name="count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel style={{ color: "#000" }}>Count<RequiredMark show={true} /></FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                inputMode="numeric"
                                                placeholder="Enter count"
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

                    {/* Remarks */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel style={{ color: "#000" }}>Remarks</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            onChange={(e) => {
                                                    let value = e.target.value;
                                                    if(value.startsWith(' ')) return
                                                    field.onChange(value);
                                                }}
                                            placeholder="Enter remark (optional)"
                                            minLength={10}
                                            maxLength={300}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                {/* Submit */}
                {<div className="">
                    <div className="flex justify-end gap-3 pb-4 pr-4  border-t pt-[24px]">
                        <Button
                            variant="outline"
                            disabled={isLoading}
                            className={'hover:bg-[#E3EDF6] hover:text-[#000] h-8 text-xs'}
                            onClick={onClose}
                        >
                            {'Cancel'}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
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
                                ? "Updating..."
                                :"Update "}
                        </Button>
                    </div></div>}
            </form>
        </Form>
    );
}
