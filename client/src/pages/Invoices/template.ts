export const InvoiceHtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice</title>

<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    color: #000;
    background: #fff;
  }

  .print-section {
    width: 800px;
    margin: 0 auto;
    border:1px solid black
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    border: 1px solid #000;
    padding: 6px;
    vertical-align: top;
  }
.no-border{
border:none}
  .no-border td {
    border: none;
  }

  .right { text-align: right; }
  .center { text-align: center; }
  .bold { font-weight: 700; }

  .red-head {
    background: #e8574f;
    color: #000;
    font-weight: bold;
  }

  .title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin: 6px 0 10px;
  }

  .small {
    font-size: 11px;
    line-height: 1.4;
  }
</style>
</head>

<body>
<div class="print-section">

<!-- HEADER -->
<table class="no-border">
  <tr style="display:flex;align-items:center; justify-content:space-between">
    <td style="width:55%;padding-left:10px">
      <img
        src="https://mycrm.detailingdevils.com/public/organization-files/1709713857.png"
        style="max-width:260px;"
      >
    </td>
    <td class="right small" style="padding-right:10px">
      <b>{{store_name}}</b><br><br>
      {{store_address}}<br>
      
      {{state}}, {{pincode}}<br>
      GSTIN: {{store_gstin}}<br>
      Contact: +{{store_phone}}<br>
      Email: {{store_email}}
    </td>
  </tr>
</table>


<table class="no-border" style="margin:12px 0 15px;">
  <tr style="display:flex;align-items:center">
    <td style="width:45%; padding:0">
      <hr>
    </td>
    <td class="center bold" style="width:15%; font-size:16px;">
      INVOICE
    </td>
    <td style="width:45%;  padding:0">
      <hr>
    </td>
  </tr>
</table>

<!-- BILL TO -->
<table class="no-border style="width:100%; table-layout:fixed;" >
<tr>
  <td style="width:65%; vertical-align:top;  padding-left:10px">
    
    <b>Bill To</b><br><br>
    {{bill_name}}<br>
    {{bill_address}}<br>
    {{bill_state}}<br>
  {{bill_gst_block}}
  </td>

  <td style="width:35%; vertical-align:top; padding-right:10px;" class="right" >
   
  <table class="no-border" style="width:100%; padding-right:10px">
    <tr>
    <td style="width:95px; padding:0"><b>Invoice Id :</b></td>
           <td style="padding:0">{{invoice_no}}</td>
    </tr>
    <tr>
      <td style="padding:0"><b>Phone :</b></td>
      <td style="padding:0">{{bill_phone}}</td>
    </tr>
    <tr>
      <td style="padding:0"><b>Email :</b></td>
    <td
  style="
  padding:0;
    padding-left:20px;
    width:180px;
    max-width:180px;
    word-break: break-word;
    overflow-wrap: anywhere;
  "
>
  {{bill_email}}
</td>
    </tr>
  </table>
</td>

</tr>
</table>

<br>

<!-- VEHICLE INFO ROW 1 -->
<table style="">
<tr class="red-head">
  <td>Invoice Date</td>
  <td>Vehicle Type</td>
  <td>Make</td>
  <td>Model</td>
</tr>
<tr>
  <td>{{invoice_date}}</td>
  <td>{{vehicle_type}}</td>
  <td>{{make}}</td>
  <td>{{model}}</td>
</tr>
</table>

<br>

<!-- VEHICLE INFO ROW 2 -->
<table style="padding-right:10px; border-right:0px; border-left:0px;">
<tr class="red-head">
  <td>Vehicle Color</td>
  <td>Chassis No</td>
  <td>Vehicle Registration No</td>
  <td>Coating Studio</td>
  <td>  Payment Mode</td>
</tr>
<tr>
  <td>{{vehicle_color}}</td>
  <td>{{chassis_no}}</td>
  <td>{{reg_no}}</td>
  <td>{{coating_studio}}</td>
  <td>{{payment_mode}}</td>
</tr>
</table>

<br>

<!-- ITEMS TABLE -->
<table style="padding-right:10px">
<tr class="red-head">
  <td width="4%">#</td>
  <td width="18%">Name</td>
  <td width="8%">SAC</td>
  <td width="8%">Qty</td>
  <td width="8%">Price</td>
  <td width="8%">Dis.(%)</td>
  <td width="8%">Discount</td>
  <td width="8%">Sub Amount</td>
  {{tax_header}}
  <td width="8%">Amount</td>
</tr>


{{invoice_items_rows}}

</table>

<br>

<!-- TOTALS -->
<table class="no-border">
<tr>
  <td  style="padding-left:10px">Thanks for the business.</td>
 <td class="right" style="color:#000;padding-right:0">
  <table style="width:100%; border-collapse:collapse; color:#000;">
    <tr>
      <td>Total Items :</td>
      <td class="right" style="padding-right:10px"> {{total_items}}</td>
    </tr>

    <tr>
      <td>Sub Total Amount :</td>
      <td class="right" style="padding-right:10px">₹ {{sub_total}}</td>
    </tr>

    <tr>
      <td>Total Discount Amount :</td>
      <td class="right" style="padding-right:10px">₹ {{discount}}</td>
    </tr>

   {{tax_total_rows}}

    <tr>
      <td colspan="2" style="padding-right:0">
        <hr style="border:0; border-top:1px solid #000; margin:6px 0;">
      </td>
    </tr>

    <tr class="bold">
      <td>Grand Total Amount :</td>
      <td class="right" style="padding-right:10px">₹ {{total_amount}}</td>
    </tr>

    <tr>
      <td>Received Amount :</td>
      <td class="right" style="padding-right:10px">₹ {{received}}</td>
    </tr>

    <tr>
      <td>Balance Amount :</td>
      <td class="right" style="padding-right:10px">₹ {{balance}}</td>
    </tr>
   
  </table>
</td>

</tr>
</table>


<br>

<!-- TERMS -->
<table class="no-border">
<tr>
  <th style="text-align:left; border-left:0px; border-right:0px">Terms &amp; Conditions</th>
</tr>
<tr>
  <td class="small" style="line-height:1.5; padding:10px">

    <span>1.</span> Armor Reload, Armor Pro &amp; Armor Absolute<br><br>
    <ul style="margin:0 0 10px 18px; padding:0;">
      <li>Warranty is provided only for the shine of the vehicle's painted body.</li>
      <li>
        After application, avoid washing/cleaning your vehicle for 2 days.
        Bring your vehicle after 2 days for a Complimentary first wash.
        (Note: only 1st wash is complimentary).
      </li>
      <li>
        1st complimentary ceramic wash can be availed within a period of 10 days
        from the date of treatment. No requests will be entertained afterwards.
      </li>
      <li>
        First car assessment should be done after one year of treatment and thereafter,
        once a year.
      </li>
      <li>
        Yearly assessment can be availed before 30 days or after 30 days from the year
        completion date. No requests will be entertained after the period expires.
      </li>
    </ul>

    <span>2.</span> Warranty shall be considered void if:<br><br>
    <ul style="margin:0 0 10px 18px; padding:0;">
      <li>
        If your warranty is not registered online, in that case contact the studio from
        where service has been availed immediately &amp; get it registered.
      </li>
      <li>If vehicle is washed/cleaned within 2 days after application of coating.</li>
      <li>Coating is either removed or over coated with any other product(s).</li>
      <li>
        Soiling, damages, discoloration or stains caused due to bleaches, solvents, acid,
        burns, dye, accident, vandalism or negligence/faults on part of the automobile owner.
      </li>
      <li>Damage due to accident.</li>
      <li>Scratches due to dry cleaning of the vehicle (Only wet clean the vehicle with plain water).</li>
      <li>
        Vehicle is repainted. (Warranty will be considered void for repainted part(s) or
        entire exterior paint body depending on the paint job).
        <br>
        <b>Note:</b> Customer can get their vehicle coated again (whether repainted/damaged by accident)
        by paying appropriate charges.
      </li>
    </ul>

    <span>3.</span> To uphold the authenticity of the warranty, follow the instructions and consult
    an authorized Detailing Devils studio.<br>

    <span>4.</span> Detailing Devils warranty is non-transferable and applicable only after you complete
    all the registration formalities.<br>

    <span>5.</span> In case of any coating damage during the warranty period, follow the given procedure:<br><br>

    <ul style="margin:0 0 10px 18px; padding:0;">
      <li>
        Contact your nearest coating studio right away and inform them about the damage issue.
      </li>
      <li>
        The service inspection in charge will then examine your vehicle during the business
        hours in the nearest coating studio (allotted by them).
      </li>
      <li>
        Post assessment if your claims get accepted, then our service inspector will contact
        you with a mutually convenient time and location.
      </li>
      <li>
        Provide your Invoice/warranty card to avail warranty.
        (Warranty shall be considered invalid in case it is not registered online)
      </li>
      <li>
        If the claim is not made within 30 days of observing the problem, it will automatically
        set Detailing Devils dealer free of any legal obligations.
      </li>
    </ul>

    <span>6.</span> Goods once sold will not be taken back or exchanged except as required by law.<br>

    <span>7.</span> This is a Computer Generated Invoice, hence signature not required.<br>

    <b>Disclaimer:</b>
    Always make sure to take your invoice and get your warranty registered online from the
    studio you are availing the service. Detailing Devils gives no warranty and accepts no
    responsibility or liability if your warranty is not registered online. In that case under
    no circumstances will Detailing Devils be held responsible or liable in any way for any
    warranty claims.<br><br>

    Check your warranty from below mentioned link:<br>
    <a href="https://mycrm.detailingdevils.com/check-warranty" target="_blank">
      https://mycrm.detailingdevils.com/check-warranty
    </a>

  </td>
</tr>

</table>

</div>
</body>
</html>
`;
