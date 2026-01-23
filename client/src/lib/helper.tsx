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
export function openHtmlInNewTabAndPrint(html: string, title = "Print", printType: string, id: string) {
  console.log(id, 'id');

  if (!html) {
    console.error("No HTML content provided for printing");
    return;
  }

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Popup blocked. Please allow popups to print.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${printType} - ${id}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          /* Optional: enforce clean print */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        ${html}
        <script>
          window.onload = function () {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
export function downloadHtmlAsPdf(
  html: string,
  fileType: string,
  id: string
) {
  if (!html) {
    console.error("No HTML content provided for download");
    return;
  }

  // Create full HTML document
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${fileType} - ${id}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  // Create blob
  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8;" });

  // Create temp link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${fileType}-${id}.html`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


export function buildJobCardHtml(row: any, template: string) {
const services = row.opted_services ?? [];

let servicesRows = "";

for (let i = 0; i < services.length; i += 2) {
  servicesRows += `
    <tr>
      <td>
        <input type="checkbox" checked class="lock">
        ${services[i]?.plan_name ?? ""}
      </td>
      <td>
        ${
          services[i + 1]
            ? `
              <input type="checkbox" checked class="lock">
              ${services[i + 1].plan_name}
            `
            : ""
        }
      </td>
    </tr>
  `;
}



console.log(row.vehicle_condition=== 'good-condition','vehicle_condition');

  return template
    .replace("{{job_card_number}}", row.job_card_number ?? "")
    .replace("{{date}}", row.jobcard_date ?? "")
    .replace("{{service_location}}",row.state ?? "")
    .replace("{{customer_name}}", row.name ?? "")
    .replace("{{address}}", row.address ?? "")
    .replace("{{phone}}", row.phone ?? "")
    .replace("{{email}}", row.email ?? "")
    .replace("{{vehicle_type}}", row.vehicle_type ?? "")
    .replace("{{make}}", row.make ?? "")
    .replace("{{model}}", row.model ?? "")
    .replace("{{color}}", row.color ?? "")
    .replace("{{year}}", row.year ?? "")
    .replace("{{reg_no}}", row.reg_no ?? "")
    .replace("{{chasis_no}}", row.chasis_no ?? "")
    
    .replace("{{vehicle_condition}}", row.vehicle_condition ?? "")
    
    .replace("{{services_rows}}", servicesRows)
    .replace("{{isRepainted}}", row.isRepainted ?? "")
    .replace("{{isSingleStagePaint}}", row.isSingleStagePaint ?? "")
    .replace("{{isPaintThickness}}", row.isPaintThickness ?? "")
    .replace("{{store_manager}}", row.store_manager ?? "")
    .replace("{{isVehicleOlder}}", row.isVehicleOlder ?? "")
    .replace("{{brandNewChecked}}", row.vehicle_condition === "brand-new" ? "checked" : "")
.replace("{{goodChecked}}", row.vehicle_condition === "good-condition" ? "checked" : "")
.replace("{{fairChecked}}", row.vehicle_condition === "fair-condition" ? "checked" : "")
.replace("{{poorChecked}}", row.vehicle_condition === "poor-condition" ? "checked" : "")

}
