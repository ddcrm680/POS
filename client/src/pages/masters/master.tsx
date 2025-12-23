"use client";

import { useEffect, useState } from "react";
import { masterTabList } from "@/lib/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Users from "./user/users";
import VehicleMaster from "./vehicleMaster/vehicle";
import Services from "./servicePlan/services";
import Organization from "./organization/organization";
import Store from "./store/store";

const MASTER_TAB_KEY = "master_active_tab";

export default function Master() {
  const [activeTab, setActiveTab] = useState<string>("users");

  /* 🔹 Load tab from localStorage on mount */
  useEffect(() => {
    const savedTab = localStorage.getItem(MASTER_TAB_KEY);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  /* 🔹 Save tab whenever it changes */
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem(MASTER_TAB_KEY, value);
  };

  return (
    <div>
      <div className="grid gap-6 transition-all duration-300 grid-cols-1">
        <div className="p-6">
          <div className="mx-auto space-y-6">

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Master Details
                </h1>

                <TabsList className="grid w-full grid-cols-5 lg:w-max lg:inline-grid">
                  {masterTabList.map((tab) => {
                    const Icon = tab.emoji;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex items-center gap-2"
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

              <TabsContent value="users">
                <Users />
              </TabsContent>

              <TabsContent value="vehicleMaster">
                <VehicleMaster />
              </TabsContent>

              <TabsContent value="servicePlan">
                <Services />
              </TabsContent>

              <TabsContent value="organization">
                <Organization />
              </TabsContent>

              <TabsContent value="store">
                <Store />
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
