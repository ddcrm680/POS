import { useState } from "react";
import { profileMenu } from "@/lib/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Password from "./password";
import Profile from "./profile";

export default function ProfileDetails() {
  const [activeTab, setActiveTab] = useState("overview");

  const [showServiceHistory, setShowServiceHistory] = useState(false);

 
  return (
    <>
      <div className="  p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          <div className=" mb-6 flex justify-between">
            <div className="flex flex-col">
              <h1 className="
  text-lg
  sm:text-xl
  md:text-2xl
  font-bold
  text-gray-900
">Profile Details</h1>

            </div>
            <TabsList className="h-auto
    flex 
    overflow-x-auto
    scrollbar-hide
    lg:grid lg:grid-cols-2
    justify-start
     lg:w-[40]
     
  ">
              {profileMenu.map((item) => {
                 const Icon = item.emoji;
                return <TabsTrigger
                  value={item.value}
                 className="
    flex items-center gap-2
    whitespace-nowrap px-3 py-2
    transition-all duration-200

    hover:bg-muted
    hover:text-foreground
    hover:shadow-sm
    hover:-translate-y-[1px]

    data-[state=active]:bg-white
    data-[state=active]:text-[#65758b]
    data-[state=active]:shadow
  "
                  data-testid={item.dataTestId}
                >
                 <Icon size={16} />
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              })}

            </TabsList>

          </div>

          <div className={`grid gap-6 transition-all duration-300 ${showServiceHistory ? 'grid-cols-12' : 'grid-cols-1'
            }`}>
            <div className=" mx-auto space-y-6 w-full">
              {/* Main Content Tabs */}
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                <Profile />
              </TabsContent>

              {/* Vehicle Information Tab */}
              <TabsContent value="password" className="space-y-6">
                <Password />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </>
  );
}