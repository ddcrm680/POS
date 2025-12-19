import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Box } from "@chakra-ui/react";
import { vehicleCardItem } from "@/lib/types";

export function VehicleCardInfo({
  item,
  isInModal,
  setIsUserModalOpenInfo,
}: {
  item: vehicleCardItem;
  isInModal: boolean;
  setIsUserModalOpenInfo?: (value: boolean) => void;
}) {
  const models = item.model ?? [];
  const total = models.length;

  const visibleModels = isInModal ? models : models.slice(0, 5);
  const remainingCount = total - visibleModels.length;

  const content = (
    <div className="space-y-3">

      {!isInModal && (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-slate-900">
            {item.company}
          </h2>
          <span className="text-xs text-slate-500">
            {total} model{total !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {visibleModels.map((m) => (
          <Box
            key={m.id}
            title={m.name}
            className="rounded-md border border-slate-300 bg-white
                       px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            {m.name.trim().length > 16
              ? `${m.name.trim().slice(0, 16)}…`
              : m.name.trim()}
          </Box>
        ))}

        {!isInModal && remainingCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-900"
            onClick={() => setIsUserModalOpenInfo?.(true)}
          >
            +{remainingCount} more
            <ChevronRight className="ml-0.5 h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );

  if (isInModal) {
    return <div className="p-4">{content}</div>;
  }
  
  return (
    <Card className="rounded-xl border border-slate-200 bg-white hover:border-primary/60 transition">
      <CardContent className="p-4">{content}</CardContent>
    </Card>
  );
}
