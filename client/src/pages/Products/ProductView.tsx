

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getInitials, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Search, CreditCard, FileText, Briefcase, User, Plus, ChevronLeft, ArrowLeft } from "lucide-react";
import { hideColumnListInCustomer, hideColumnListInProduct, ProductViewTab, TABS } from "@/lib/constant";
import { getCustomerDashboardView, getCustomerView,  } from "@/lib/api";
import { useLocation, useSearchParams } from "wouter";
import JobCard from "../JobCard/JobCard";
import Invoice from "../Invoices/Invoice";
import PaymentsPage from "../Payments/payments";
import { GlobalLoader } from "@/components/common/GlobalLoader";
import { encryptQuery } from "@/lib/crypto";
import { Kpi } from "../Customer/DashboardCards";

import brush from '@/lib/images/brush.webp'
import { Image } from "@chakra-ui/react";
import FranchiseItemLog from "./FranchiseItemLog";
import TransferProducts from "./TransferProducts";
import { productOverviewMock } from "@/lib/mockData";
import { Overview } from "./Overview";

export default function ProductView() {
  const [activeTab, setActiveTab] = useState("overview");
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchCustomer = async () => {
    try {
      setIsLoading(true);
      const res = await getCustomerDashboardView(id ?? "");

      setCustomer(res?.data ?? null);
    } catch (e: any) {
      console.error(e);
      if (e?.response?.data?.code === 404) {
        setNotFound(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductView()
      fetchCustomer();
    }

  }, [id]);

  const [productView, setProductView] = useState<any | null>(null);

  const fetchProductView = async () => {
    try {
      setIsLoading(true);
      const res = await getCustomerView(id ?? "");
      setProductView(res?.data ?? null);

    } catch (e: any) {

      if (e?.response?.data?.code === 404) {
        setNotFound(true);
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-slate-500">
          <GlobalLoader />
        </div>
      </div>
    );
  }
  const showNotFound = !isLoading && notFound;

  if (showNotFound) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center mb-4 gap-2">
              <div className="border-[3px] p-1 border-red-500 rounded-[50%]">
                <User className="h-9 w-9 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Customer Not Found
              </h1>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              The customer you are trying to view does not exist or may have been deleted.
            </p>

            {/* 👇 Go Home Button */}
            <div className="mt-6">
              <Button
                onClick={() => navigate("/customers")}
                className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] flex items-center gap-2 mx-auto"
              >
                <ArrowLeft size={16} />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    );
  }
  return (
    <div className="min-h-screen ">
      <div className="mx-auto  p-3 sm:p-3 space-y-3">

        {/* Top Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('sidebar_active_parent')
                window.history.back()
              }}
              disabled={isLoading}

              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="h-10 w-10  bg-[#fff] flex items-center border border-[#e5e5e5] rounded-sm justify-center text-white font-bold">
              <Image src={brush} className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-[14px] font-semibold text-slate-900">{productOverviewMock?.product?.name}</h1>
              <p className="text-xs text-slate-500"> {productOverviewMock?.brand?.name} · {productOverviewMock?.category?.name}</p>
            </div>
          </div>

         
        </div>

    

        {/* Main Layout */}
        <div className="grid lg:grid-cols-[240px_1fr] gap-3">

          {/* Sidebar Tabs */}
          <Card className="rounded-lg">
            <CardContent className="p-2 flex flex-col gap-1">
              {ProductViewTab.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  disabled={tab.key==="online-sold"}
                  className={cn(
                    `
    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
    text-sm font-medium
    transition-colors

    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-primary
    focus-visible:ring-offset-2
    ${tab.key==="online-sold" ?' opacity-[0.5]':'' }
    `,
                    activeTab === tab.key
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-slate-100"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Content */}
          <Card className={`rounded-lg ${activeTab === "overview" ? "" : "border-0"} !px-0`}>
            <CardContent className="p-0">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "overview" && <Overview product={productOverviewMock} />}
                {activeTab === "item-log" && <FranchiseItemLog noTitle={true} noPadding={true} apiLink={`/api/consumers/${id}/job-cards`}  />}
                {activeTab === "online-sold" && <Invoice noTitle={true} noPadding={true} apiLink={`/api/consumers/${id}/invoices`} hideColumnListInCustomer={hideColumnListInCustomer.invoice} />}
                {activeTab === "transfer-to-franchise" && <TransferProducts noTitle={true} noPadding={true} apiLink={`/api/consumers/${id}/payments`} hideColumnListInCustomer={hideColumnListInProduct.transferStock} />}
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

}





