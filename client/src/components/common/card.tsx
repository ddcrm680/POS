import { cn } from "@/lib/utils";

export const SectionCard = ({
  title,
  children,
  className,
  headingMarginBottom = "mb-4"
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headingMarginBottom?:string
}) => (
  <div
    className={cn(
      "bg-white  rounded-xl p-4 pb-0",
      className
    )} >
  {title &&  <h3 className={`text-sm font-semibold ${headingMarginBottom} text-gray-700`}>{title}</h3>}
    {children}
  </div>
);