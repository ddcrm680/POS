import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Customer, POSJobData, posJobSchema } from "@/schema";
import {
  Car,
  CheckCircle,
  Loader2,
  BarChart3,
  EditIcon,
  Key
} from "lucide-react";
import { availableServices, masterTabList } from "@/lib/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Users from "./user/users";
import Product from "../product";
import VehicleMaster from "./vehicleMaster/vehicle";

export default function Master() {
  const [activeTab, setActiveTab] = useState("users");
  const [showServiceHistory, setShowServiceHistory] = useState(false);

  return (
    <>
      <div className="  p-6">
        <div className=" mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Details</h1>
          <p className="text-gray-600">Centralize, organize, and control all master data settings</p>
        </div>

        <div className={`grid gap-6 transition-all duration-300 ${showServiceHistory ? 'grid-cols-12' : 'grid-cols-1'
          }`}>
          <div className="p-6">
            <div className=" mx-auto space-y-6 ">

              {/* Main Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2  lg:w-max  lg:inline-grid">
                  {masterTabList.map((tab) =>{
                     const Icon = tab.emoji;
                    return  (
                    <TabsTrigger
                      value={tab.id}
                      className="flex items-center gap-3"
                      data-testid="tab-vehicles"
                    >
                        <Icon size={16} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>)})}

                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="users" className="space-y-6">
                  <Users />
                </TabsContent>

                {/* Vehicle Information Tab */}
                <TabsContent value="vehicleMaster" className="space-y-6">
                  <VehicleMaster />
                </TabsContent>


              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}