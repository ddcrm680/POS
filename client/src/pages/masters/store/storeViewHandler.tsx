"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useSearchParams } from "wouter";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import StoreForm from "./storeForm";
import StoreView from "./storeView";

/* -------------------- CARD -------------------- */


export default function StoreFormHandler() {

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const isView = mode === "view";
  return (
    <>{isView ?<StoreView/> :<StoreForm/> }</>
  );
}
