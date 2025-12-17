// src/components/profile/profile.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { fetchVehicleList } from "@/lib/api";
import { vehicleType, } from "@/schema";
import CommonTable from "@/components/common/CommonTable";
import { Box, } from "@chakra-ui/react";

const data = [
  { company: "22 MOTORS", models: ["FLOW"] },
  { company: "AFTEK", models: ["ROYAL PLUS", "SKIPPER", "SCORPION", "ZONTES"] },
  { company: "AMPERE", models: ["REO", "V48"] },
  {
    company: "APRILIA",
    models: [
      "SR 150",
      "SR 125",
      "SRV 850",
      "TUONO",
      "CAPONORD 1200",
      "DORSODURO",
      "MANA",
      "SHIVER 900",
      "RSV4",
      "RS 150",
      "TUONO 150",
      "STORM 125",
      "SXR 160",
    ],
  },
  { company: "ASTON MARTIN", models: ["VANTAGE", "VANQUISH", "DB11", "DBX", "ZAGATO"] },
  { company: "ATHER", models: ["340"] },
  {
    company: "AUDI",
    models: [
      "A3",
      "A4",
      "A5",
      "A6",
      "A8",
      "A3 CABRIOLET",
      "Q3",
      "Q5",
      "Q7",
      "R8",
      "RS6",
      "RS7",
      "TT",
      "E-TRON",
    ],
  },
];

export default function VehicleMaster() {
  const [search, setSearch] = useState("");
 
   const filtered = data.filter((item) =>
     item.company.toLowerCase().includes(search.toLowerCase()) ||
     item.models.some((m) => m.toLowerCase().includes(search.toLowerCase()))
   );
 
   return (
     <div className="min-h-screen bg-neutral-950 p-8">
       <div className="max-w-7xl mx-auto">
         {/* Header */}
         <div className="mb-8 flex flex-col gap-4">
           <h1 className="text-3xl font-semibold text-white">
             Supported Vehicle Brands
           </h1>
           <p className="text-sm text-neutral-400 max-w-2xl">
             Explore vehicle manufacturers and compatible models in a modern card-based view
           </p>
 
           <div className="relative max-w-md">
             {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} /> */}
             <input
               type="text"
               placeholder="Search brand or model"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 text-white border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
             />
           </div>
         </div>
 
         {/* Grid View */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {filtered.map((item, idx) => (
             <div
               key={idx}
               className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-yellow-500/40 transition"
             >
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold text-white tracking-wide">
                   {item.company}
                 </h2>
                 {/* <ChevronRight className="text-neutral-600 group-hover:text-yellow-500 transition" size={18} /> */}
               </div>
 
               <div className="flex flex-wrap gap-2">
                 {item.models.slice(0, 6).map((model, i) => (
                   <span
                     key={i}
                     className="px-3 py-1.5 text-xs rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                   >
                     {model}
                   </span>
                 ))}
 
                 {item.models.length > 6 && (
                   <span className="px-3 py-1.5 text-xs rounded-full bg-neutral-800 text-neutral-400">
                     +{item.models.length - 6} more
                   </span>
                 )}
               </div>
             </div>
           ))}
         </div>
 
         {filtered.length === 0 && (
           <div className="text-center text-neutral-500 mt-16">
             No brands or models found
           </div>
         )}
       </div>
     </div>
   );
}
