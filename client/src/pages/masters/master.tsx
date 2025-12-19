import { useState } from "react";
import { masterTabList } from "@/lib/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Users from "./user/users";
import VehicleMaster from "./vehicleMaster/vehicle";
import Services from "./servicePlan/services";

export default function Master() {
  const [activeTab, setActiveTab] = useState("servicePlan");

  return (
    <>
      <div className="  ">
        
        <div className={`grid gap-6 transition-all duration-300 ${ 'grid-cols-1'
          }`}>
          <div className="p-6">
            <div className=" mx-auto space-y-6 ">

              {/* Main Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 ">
                <div className=" mb-6 flex justify-between">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Details</h1>
         <TabsList className="grid w-full grid-cols-3  lg:w-max  lg:inline-grid">
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
          {/* <p className="text-gray-600">Centralize, organize, and control all master data settings</p> */}
        </div>

               

                {/* Overview Tab */}
                <TabsContent value="users" className="space-y-6">
                  <Users />
                </TabsContent>

                {/* Vehicle Information Tab */}
                <TabsContent value="vehicleMaster" className="space-y-6">
                  <VehicleMaster />
                </TabsContent>

                 <TabsContent value="servicePlan" className="space-y-6">
                  <Services />
                </TabsContent>


              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}