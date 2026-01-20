import { counts, metrics, tiles } from "@/lib/mockData";
import React, { useState } from "react";

export default function DashboardPreview() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className=" py-4 pb-2 mx-4">
      <h1 className="text-lg md:text-xl font-semibold tracking-tight">
        POS Dashboard
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Overview of operations & performance
      </p>
    </div>

      {/* Content */}
      <div className="p-3 space-y-6">
         {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Today's Revenue" value={`₹${metrics.todayRevenue}`} />
          <Stat label="Services Done" value={metrics.servicesCompleted} />
          <Stat label="Active Jobs" value={counts.activeJobs} />
          <Stat label="Satisfaction" value={`${metrics.customerSatisfaction}/5`} />
        </div>
        {/* Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiles.map((tile) => (
            <Tile key={tile.id} tile={tile} />
          ))}
        </div>

       
      </div>
    </div>
  );
}

function Tile({ tile }: any) {
  const Icon = tile.icon;
  return (
    <div className={`${tile.color} relative rounded-2xl p-6 min-h-[160px] text-white shadow-lg hover:scale-[1.03] transition`}>
      { (
        <span className="absolute top-3 right-3 bg-black/30 text-xs px-2 py-1 rounded-full">
          {tile.badge ?? 0}
        </span>
      )}

      <div className="flex flex-col h-full justify-between">
        <div className="p-3 bg-white/20 rounded-xl w-fit">
          <Icon size={28} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{tile.title}</h3>
          <p className="text-sm text-white/90">{tile.description}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
