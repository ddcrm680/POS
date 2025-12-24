"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box } from "@chakra-ui/react";

import { Form } from "@/components/ui/form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { systemLogProp, systemLogType } from "@/lib/types";

/* -------------------- COMPONENT -------------------- */

export default function SystemLogForm({
  mode,
  id,
  initialValues,
  onClose,
}: systemLogProp) {
  const isView = mode === "view";

  const form = useForm<systemLogType>({
    defaultValues: {
      action: "",
      actor: "",
      ip_address: "",
      browser: "",
      platform: "",
      description:"",
      device_type: "",
      url: "",
      client_url: "",
      subjectType: "",
      subjectId: "",
    },
    shouldUnregister: false,
  });

  /* -------------------- HYDRATE VALUES -------------------- */
  useEffect(() => {
    if (!initialValues) return;

    form.reset({
      action: initialValues.action ?? "",
      actor:initialValues.actor ??"",
      ip_address: initialValues.ip_address ?? "",
      browser: `${initialValues.browser ?? ""}`,
      url: initialValues.url ?? "",
      client_url: initialValues.client_url ?? "",
      description:initialValues.description??"",
      subjectType: initialValues.subjectType ?? "",
      platform:initialValues.platform,
      device_type:initialValues.device_type,
      subjectId: `${initialValues.subjectType} #${String(initialValues.subjectId ?? "")}`,
     
    });
  }, [initialValues, form]);

  /* -------------------- UI -------------------- */

  return (
    <Form {...form}>
     <Form {...form}>
 <form className="space-y-6">
  <div className="p-6 space-y-8 max-h-[50vh] overflow-y-auto">

    {/* ================= ACTION ================= */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <FormField
        control={form.control}
        name="actor"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}>Actor</FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="action"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}>Action</FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
          </FormItem>
        )}
      />
      
    </div>

    {/* ================= ACTOR / DESCRIPTION / SUBJECT ================= */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}>Description</FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="subjectId"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}>Subject</FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
 {/* ================= URLS ================= */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="url"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}>API URL</FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="client_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}>Client URL</FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    {/* ================= TECH INFO ================= */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <FormField
        control={form.control}
        name="ip_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}>IP Address</FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="browser"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}>Browser</FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}>Platform</FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="device_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}>Device Type</FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
          </FormItem>
        )}
      />
    </div>

   

  </div>

  {/* FOOTER */}
  <div className="flex justify-end gap-3 px-6 pb-6 border-t pt-4">
    <Button
      variant="outline"
      onClick={onClose}
      className="hover:bg-[#E3EDF6] hover:text-[#000]"
    >
      Close
    </Button>
  </div>
</form>

</Form>

    </Form>
  );
}


