import { cn } from "@/lib/utils";

export const SectionCard = ({
  title,
  children,
  className,
  headingMarginBottom = "mb-4",
}: {
  title?: React.ReactNode; // ✅ FIX HERE
  children: React.ReactNode;
  className?: string;
  headingMarginBottom?: string;
}) => (
  <div
    className={cn(
      "bg-white rounded-xl p-4 pb-0",
      className
    )}
  >
    {title && (
      <h3
        className={cn(
          "text-sm font-semibold text-gray-700",
          headingMarginBottom
        )}
      >
        {title}
      </h3>
    )}
    {children}
  </div>
);
