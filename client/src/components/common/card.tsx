import { cn } from "@/lib/utils";

export const SectionCard = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "bg-white  rounded-xl p-4 pb-0",
      className
    )} >
    <h3 className="text-sm font-semibold mb-4 text-gray-700">{title}</h3>
    {children}
  </div>
);