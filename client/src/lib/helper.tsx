export function mapColumnsForCustomerView(
  baseColumns: any[],
  config: { label: string; name: string; type?: string }[]
) {
  return config
    .map(cfg => {
      const col = baseColumns.find(c => c.key === cfg.name);
      if (!col) return null;

      // clone column
      const mapped = { ...col };

      // 🔐 Preserve filter / JSX labels
      const isJSXLabel =
        typeof col.label === "object" && col.label !== null;

      if (!isJSXLabel) {
        mapped.label = cfg.label;
      }

      // custom renderer only when needed
      if (cfg.type === "customer-custom") {
        mapped.render = (_: any, row: any) => {
          switch (cfg.name) {
            case "vehicle_type":
              return (
                <span className="text-sx font-medium">
                  {[
                    row?.vehicle_type,
                    row?.vmake?.name,
                    row?.vmodel?.name,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </span>
              );

            case "reg_no":
              return (
                <div className="flex flex-col text-sx">
                  <span>
                    {row.reg_no || row.chasis_no || "-"}
                  </span>
                </div>
              );

            default:
              return row[cfg.name] ?? "-";
          }
        };
      }

      return mapped;
    })
    .filter(Boolean);
}
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}