import { Button } from "@/components/ui/button";

export function DataList({ title }:any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <Button size="sm" variant="outline">Filter</Button>
      </div>

   
    </div>
  );
}