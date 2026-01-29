import { Constant, srsConditionList } from "./constant";

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
        ${services[i + 1]
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

  const isRepainted = ` <input type="checkbox" ${row?.isRepainted ? 'checked' : ''} class="lock">`

  const isSingleStagePaint = ` <input type="checkbox" ${row?.isSingleStagePaint ? 'checked' : ''} class="lock">`
  const isPaintThickness = ` <input type="checkbox" ${row?.isPaintThickness ? 'checked' : ''} class="lock">`
  const isVehicleOlder = ` <input type="checkbox" ${row?.isVehicleOlder ? 'checked' : ''} class="lock">`
  // jobcardLogo
  const selectedWarranties: number[] = row.warranty_years ?? [];

  const isChecked = (value: number) =>
    selectedWarranties.includes(value) ? "checked" : "";

  console.log(`${process.env.REACT_APP_BASE_URL ?? Constant.REACT_APP_BASE_URL}${row.jobcardLogo}`, 'jobcardLogo');
  const warrantyRows = `
<tr>
  <td>
    <input type="checkbox" class="lock" ${isChecked(1)}> 1 Year
  </td>
  <td>
    <input type="checkbox" class="lock" ${isChecked(3)}> 3 Years
  </td>
  <td>
    <input type="checkbox" class="lock" ${isChecked(5)}> 5 Years
  </td>
</tr>

<tr>
  <td>
    <input type="checkbox" class="lock" ${isChecked(6)}> 6 Years
  </td>
  <td>
    <input type="checkbox" class="lock" ${isChecked(7)}> 7 Years
  </td>

  <!-- No Warranty (special layout) -->
  <td style="padding:0;">
    <div style="display:flex; align-items:stretch; height:100%;">
      <div style="padding:6px 30px 6px 6px;">
        <input type="checkbox" class="lock" ${isChecked(0)}> No Warranty
      </div>

      <div style="width:1px; background:#000;"></div>

      <div style="padding:6px 6px;">
        <input type="checkbox" class="lock">
        ____________
      </div>
    </div>
  </td>
</tr>
`;
const conditions = srsConditionList ?? [];
let conditionRows = "";

for (let i = 0; i < conditions.length; i += 2) {
  const left = conditions[i];
  const right = conditions[i + 1];

  conditionRows += `
    <tr>
      <td>
        <input type="checkbox" class="lock"
          ${row.vehicle_condition === left.value ? "checked" : ""}>
        ${i + 1} (${left.label})
      </td>

      <td>
        ${
          right
            ? `
              <input type="checkbox" class="lock"
                ${row.vehicle_condition === right.value ? "checked" : ""}>
              ${i + 2} (${right.label})
            `
            : ""
        }
      </td>
    </tr>
  `;
}

// srsConditionList
  return template
    .replace("{{logoSrc}}", `${process.env.REACT_APP_BASE_URL ?? Constant.REACT_APP_BASE_URL}/${row.jobcardLogo}`)
    .replace("{{job_card_number}}", row.job_card_number ?? "")
    .replace("{{date}}", row.jobcard_date ?? "")
    .replace("{{service_location}}", row.serviceLocation ?? "")
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
.replace("{{vehicle_condition_rows}}", conditionRows)
    .replace("{{vehicle_condition}}", row.vehicle_condition ?? "")
    .replace("{{technician}}",row.technician ?? "________")
    .replace("{{services_rows}}", servicesRows)
    .replace("{{service_vehicle_img}}", `${process.env.REACT_APP_BASE_URL ?? Constant.REACT_APP_BASE_URL}/${row.serviceVehicleImg}`)
    .replace("{{isRepainted}}", isRepainted ?? "")
    .replace("{{isSingleStagePaint}}", isSingleStagePaint ?? "")
    .replace("{{isPaintThickness}}", isPaintThickness ?? "")
    .replace("{{store_manager}}", row.store_manager ?? "")
    .replace("{{isVehicleOlder}}", isVehicleOlder ?? "")
    // .replace("{{brandNewChecked}}", row.vehicle_condition === "brand-new" ? "checked" : "")
    // .replace("{{goodChecked}}", row.vehicle_condition === "good-condition" ? "checked" : "")
    // .replace("{{fairChecked}}", row.vehicle_condition === "fair-condition" ? "checked" : "")
    // .replace("{{poorChecked}}", row.vehicle_condition === "poor-condition" ? "checked" : "")
    .replace("{{service_customer_name}}", row.name ?? "")
    .replace("{{warranty_rows}}", warrantyRows)

}
export function buildInvoiceHtml(row: any, template: string) {
  const items = row.invoice_items ?? [];
  const isCGSTSGST = row.gst_type === "cgst_sgst";

  /* ---------------- TAX HEADER ---------------- */
  const taxHeader = isCGSTSGST
    ? `<td width="6%">CGST</td><td width="6%">SGST</td>`
    : `<td width="6%">IGST</td>`;
  const billGstHtml =
    row?.billing_type === "company" && row?.gstin
      ? `GST No.: ${row.gstin}`
      : "";

  /* ---------------- ITEM ROWS ---------------- */
  const invoiceItemsRows = items
    .map((item: any, index: number) => {
      const taxCells = isCGSTSGST
        ? `
          <td class="left">
            <div>₹ ${item.cgst_amount ?? "0.00"} (${item.cgst_percent ?? "0"}%)</div>
          </td>
          <td class="left">
            <div>₹ ${item.sgst_amount ?? "0.00"} (${item.sgst_percent ?? "0"}% )</div>
          </td>
        `
        : `
          <td class="left">
            <div>₹ ${item.igst_amount ?? "0.00"} (${item.igst_percent ?? "0"}%)</div>
          </td>
        `;

      return `
        <tr>
          <td class="left">${index + 1}</td>
          <td>${item.service_name ?? "-"}</td>
          <td class="left">${item.sac ?? "-"}</td>
          <td class="left">${item.qty ?? 1}</td>
          <td class="left">${item.price ?? "0.00"}</td>
          <td class="left">${item.discount_percent ?? "0%"}</td>
          <td class="left">₹ ${item.discount_amount ?? "0.00"}</td>
          <td class="left">₹ ${item.subAmount ?? "0.00"}</td>
          ${taxCells}
          <td class="left">₹ ${item.amount ?? "0.00"}</td>
        </tr>
      `;
    })
    .join("");


  const taxTotalRows = isCGSTSGST
    ? `
      <tr><td>CGST Amount :</td><td class="right">₹ ${row?.cgst}</td></tr>
      <tr><td>SGST Amount :</td><td class="right">₹ ${row?.sgst}</td></tr>
    `
    : `
      <tr><td>IGST Amount :</td><td class="right">₹ ${row?.igst}</td></tr>
    `;

  /* ---------------- TEMPLATE REPLACEMENTS ---------------- */
  return template
    .replace("{{store_name}}", row.store_name ?? "Coating Daddy Pvt. Ltd.")
    .replace("{{store_address}}", row.store_address ?? "")
    .replace("{{state}}", row.state ?? "")
    .replace("{{pincode}}", row.pincode ?? "")
    .replace("{{store_gstin}}", row.store_gstin ?? "")
    .replace("{{store_phone}}", row.store_phone ?? "")
    .replace("{{store_email}}", row.store_email ?? "")

    .replace("{{invoice_no}}", row.invoice_no ?? "")
    .replace("{{invoice_date}}", row.invoice_date ?? "")
    .replace("{{payment_mode}}", row.payment_mode ?? "—")

    .replace("{{bill_name}}", row.name ?? "")
    .replace("{{bill_address}}", row.address ?? "")
    .replace("{{bill_state}}", row.state ?? "")
    .replace("{{bill_gstin}}", row.gstin ?? "")

    .replace("{{bill_phone}}", row.bill_phone ?? "")
    .replace("{{bill_email}}", row.bill_email ?? "")

    .replace("{{vehicle_type}}", row.vehicle_type ?? "")
    .replace("{{make}}", row.make ?? "")
    .replace("{{model}}", row.model ?? "")
    .replace("{{vehicle_color}}", row.color ?? "")
    .replace("{{chassis_no}}", row.chasis_no ?? "")
    .replace("{{reg_no}}", row.reg_no ?? "")
    .replace("{{coating_studio}}", row.coating_studio ?? "")

    .replace("{{tax_header}}", taxHeader)
    .replace("{{invoice_items_rows}}", invoiceItemsRows)
    .replace("{{tax_total_rows}}", taxTotalRows)

    .replace("{{total_items}}", String(row.total_items ?? items.length))
    .replace("{{sub_total}}", row?.sub_total.toString())
    .replace("{{discount}}", row?.discount.toString())
    .replace("{{total_amount}}", row?.total_amount.toString())
    .replace("{{received}}", row?.received.toString())
    .replace("{{balance}}", row?.balance.toString())
    .replace("{{bill_gst_block}}", billGstHtml)
    .replace("{{amount_in_words}}", row.amount_in_words ?? "");
}
