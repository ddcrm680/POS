"use client";

import { useEffect, useState } from "react";
import { Constant, masterTabList, productsTabList } from "@/lib/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import Store from "../masters/store/store";
import Users from "../masters/user/users";
import TransferProducts from "./TransferProducts";
import ProductsListing from "./ProductListing";

const MASTER_TAB_KEY = "master_active_tab";

export default function Products() {
  const [activeTab, setActiveTab] = useState<string>("products-listing");
  const { user, } = useAuth();
  const [location] = useLocation();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  useEffect(() => {
    setIsSuperAdmin(user?.role === Constant.superAdmin)
  }, [user])
  /* 🔹 Load tab from localStorage on mount */
  useEffect(() => {
    const savedTab = localStorage.getItem(MASTER_TAB_KEY);
    if (savedTab) {
      setActiveTab(savedTab);
    }
    return () => {
      const isOnMasterRoute = location.startsWith("/products");

      if (!isOnMasterRoute) {
        setActiveTab("products-listing")
      }
    }
  }, []);

  /* 🔹 Save tab whenever it changes */
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem(MASTER_TAB_KEY, value);
    
  localStorage.setItem("sidebar_active_parent", "master");
  };

  return (
    <div>
      <div className="grid gap-4 transition-all duration-300 grid-cols-1">
        <div className="p-3">
          <div className="mx-auto space-y-3">

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-3">
              <div className="mb-6 flex justify-between items-center">
               
  <div>
                <h1 className="
text-lg font-semibold
">
                  Product Management
                </h1>
             
              </div>
                <TabsList
                  className={cn(
                    "h-auto flex overflow-x-auto scrollbar-hide justify-start lg:grid  lg:w-[40]",
                    isSuperAdmin ? "lg:grid-cols-2" : "lg:grid-cols-2"
                  )}
                >     {productsTabList.filter((tab) => tab.id === "systemLog" ? isSuperAdmin : true).map((tab) => {
                  const Icon = tab.emoji;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="
    flex items-center gap-2
    whitespace-nowrap px-2 py-2
    transition-all duration-200

    hover:bg-muted
    hover:text-foreground
    hover:shadow-sm

    data-[state=active]:bg-white
    data-[state=active]:text-[#65758b]
    data-[state=active]:shadow  h-8 text-xs
  "
                    >
                      <Icon size={16} />
                      <span className="hidden sm:inline">
                        {tab.label}
                      </span>
                    </TabsTrigger>

                  );
                })}
                </TabsList>
              </div>

              <TabsContent value="products-listing">
                <ProductsListing />
              </TabsContent>

              <TabsContent value="transfer-stock">
                <ProductsListing />
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
