

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getInitials, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Search, CreditCard, FileText, Briefcase, User, Plus } from "lucide-react";
import { Overview } from "./Overview";
import { DataList } from "./CommonDataList";
import { Kpi } from "./DashboardCards";
import { hideColumnListInCustomer, TABS } from "@/lib/constant";
import { getCustomerDashboardView, getCustomerView } from "@/lib/api";
import { useLocation, useSearchParams } from "wouter";
import JobCard from "../JobCard/JobCard";
import Invoice from "../Invoices/Invoice";
import PaymentsPage from "../Payments/payments";


export default function ConsumerDashboardRedesign() {
  const [activeTab, setActiveTab] = useState("overview");
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<any | null>(null);

  const fetchCustomer = async () => {
    try {
      setIsLoading(true);
      const res = await getCustomerDashboardView(id ?? "");

      setCustomer(res?.data ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id){
      fetchCustomerView()
      fetchCustomer();}
  }, [id]);
     const [customerView, setCustomerView] = useState<any | null>(null);

    const fetchCustomerView = async () => {
        try {
            setIsLoading(true);
            const res = await getCustomerView(id ?? "");
            setCustomerView(res?.data ?? null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-7xl p-3 sm:p-3 space-y-3">

        {/* Top Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#FE0000] flex items-center justify-center text-white font-bold">
              {getInitials(customer?.consumer?.name)}
            </div>
            <div>
              <h1 className="text-[14px] font-semibold text-slate-900">{customer?.consumer?.name ?? "-"}</h1>
              <p className="text-xs text-slate-500"> {customer?.consumer?.phone ?? "-"} · {customer?.consumer?.state?.name ?? "-"}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                localStorage.removeItem('sidebar_active_parent')
                navigate(`/job-cards/manage?phone=${customerView.phone}&store_id=${customerView.store_id}`)

              }}
              className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] flex gap-2 !text-[12px] !h-8"
            >
              <Plus className="h-3 w-3" />
              Add {"Job Card"}
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <>
            <Kpi
              label="Job Cards"
              value={customer?.job_cards.total}
              sub={[`${customer?.job_cards.open ?? 0} Open`, `${customer?.job_cards.completed ?? 0} Complete`]}
              tone="info"
            />

            <Kpi
              label="Invoices"
              value={customer?.invoices.total}
              sub={[`${customer?.invoices.paid ?? 0} Paid`]}
              tone="info"
            />

            <Kpi
              label="Paid"
              value={`₹${Number(customer?.payments.received ?? 0).toLocaleString("en-IN")}`}
              // sub={`Billed ₹${Number(customer?.invoices.total_billed).toLocaleString("en-IN")}`}
              tone="success"
            />

            <Kpi
              label="Outstanding"
              value={`₹${Number(customer?.invoices.due_amount ?? 0).toLocaleString("en-IN")}`}
              // sub="Pending Payment"
              tone="danger"
            />
          </>

        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-[240px_1fr] gap-4">

          {/* Sidebar Tabs */}
          <Card className="rounded-lg">
            <CardContent className="p-2 flex flex-col gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg !text-[12px] font-[600] transition py-2",
                    activeTab === tab.key
                      ? "bg-[#FE0000] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Content */}
          <Card className={`rounded-lg ${activeTab === "overview"? "" :"border-0"} !px-0`}>
            <CardContent className="p-0">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "overview" && <Overview id={id ?? ""} customer={customerView} />}
                {activeTab === "jobcards" && <JobCard noTitle={true} noPadding={true} apiLink={`/api/consumers/${id}/job-cards`} hideColumnListInCustomer={hideColumnListInCustomer.jobcard} />}
                {activeTab === "invoices" && <Invoice noTitle={true} noPadding={true} apiLink={`/api/consumers/${id}/invoices`}  hideColumnListInCustomer={hideColumnListInCustomer.invoice}/>}
                {activeTab === "payments" && <PaymentsPage noTitle={true} noPadding={true} apiLink={`/api/consumers/${id}/payments`}  hideColumnListInCustomer={hideColumnListInCustomer.payment}/>}
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
  
}





