import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiProps = {
  label: string;
  value: React.ReactNode;
  sub?: string[];
  tone?: "success" | "danger" | "info";
};

export function Kpi({ label, value, sub = [], tone }: KpiProps) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-3">
        <p className="text-xs text-slate-500">{label}</p>

        <p
          className={cn(
            "mt-1 text-md font-semibold",
            tone === "success" && "text-emerald-600",
            tone === "danger" && "text-rose-600",
            tone === "info" && "text-sky-600",
            !tone && "text-slate-800"
          )}
        >
          {value}
        </p>

        {sub.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
            {sub.map((item, index) => (
              <span key={index} className="flex items-center gap-1">
                {index !== 0 && <span className="opacity-60">•</span>}
                <span>{item}</span>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}