import { useState } from "react";
import { profileMenu } from "@/lib/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Password from "./password";
import Profile from "./profile";
import { ChevronLeft } from "lucide-react";

export default function ProfileDetails() {
  const [activeTab, setActiveTab] = useState("overview");

  const [showServiceHistory, setShowServiceHistory] = useState(false);

 
  return (
    <>
       <div className="p-3 sm:p-3 space-y-3 max-w-6xl mx-auto">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 ">

          <div className=" flex justify-between">
            <div className="flex items-center gap-2">
                  <button
                     onClick={() => {
 localStorage.removeItem('sidebar_active_parent')
              window.history.back()
            }}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft size={18} />
                </button>
                 <h1 className="text-xl font-semibold">Profile Details</h1>


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
    whitespace-nowrap px-3 
    transition-all duration-200

    hover:bg-muted
    hover:text-foreground
    hover:shadow-sm

    data-[state=active]:bg-white
    data-[state=active]:text-[#65758b]
    data-[state=active]:shadow h-8 text-xs
  "
                  data-testid={item.dataTestId}
                >
                 <Icon size={16} />
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              })}

            </TabsList>

          </div>

          <div className={`grid gap-4 transition-all duration-300 ${showServiceHistory ? 'grid-cols-12' : 'grid-cols-1'
            }`}>
            <div className=" mx-auto space-y-3 w-full">
              {/* Main Content Tabs */}
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-3 mt-0">
                <Profile />
              </TabsContent>

              {/* Vehicle Information Tab */}
              <TabsContent value="password" className="space-y-3 mt-0">
                <Password />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </>
  );
}