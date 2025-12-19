import { Card } from "@/components/ui/card";
import { vehicleCardItem } from "@/lib/types";
import { Box,  } from "@chakra-ui/react";

export function VehicleCardInfo({ item, isInModal, setIsUserModalOpenInfo }: { item: vehicleCardItem, isInModal: boolean, setIsUserModalOpenInfo?: (value: any) => void }) {
  const content = (
    <>
     { !isInModal &&<div className="flex items-center justify-between mb-4">
        { (
          <h2 className="text-md font-semibold tracking-wide">
            {item.company}
          </h2>
        )}
      </div>}

      <div className="flex flex-wrap gap-2 max-h-[200px] overflow-auto">
        { !isInModal ? item.model?.slice(0, 5)?.map((r: { name: string }, idx: number) => (
          <Box
            key={idx}
            title={r.name}
            className="px-3 w-[120px] py-1.5 text-xs font-semibold rounded-full
                       border border-primary bg-[#ffa9a9] uppercase tracking-wide"
          >
            {r.name.length > 8 ? `${r.name.slice(0, 8)}…` : r.name}
          </Box>
        )) :item.model?.map((r: { name: string }, idx: number) => (
          <Box
            key={idx}
            title={r.name}
            className="px-3 w-[120px] py-1.5 text-xs font-semibold rounded-full
                       border border-primary bg-[#ffa9a9] uppercase tracking-wide"
          >
            {r.name.length > 8 ? `${r.name.slice(0, 8)}…` : r.name}
          </Box>
        ))  }

        {!isInModal && item?.model?.length > 5 && (
          <span
            className="px-3 py-1.5 text-xs rounded-full cursor-pointer
                       bg-primary text-primary-foreground"
            onClick={() => setIsUserModalOpenInfo?.(true)}
          >
            +{item.model.length - 5} more
          </span>
        )}
      </div>
    </>
  );

  if (isInModal) {
    // ❌ NO Card inside modal
    return <div className="p-4">{content}</div>;
  }

  // ✅ Card outside modal
  return (
    <Card
      className="
        group min-h-[150px] max-h-[410px]
        border border-[#cdd7e5]
        rounded-2xl p-5
        hover:border-primary transition
      "
    >
      {content}
    </Card>
  );

}