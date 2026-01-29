import logo from "@/lib/images/detailing_devil.png";
import carDiagram from "@/lib/images/car.webp";

export const jobCardHtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Job Card</title>

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
      padding: 10px;
    }

  table {
  border-collapse: collapse;
  border-spacing: 0;
}
input[type="checkbox"] {
  vertical-align: middle;
  position: relative;
  top: -1px;
}
   td, th {
  padding: 6px;
  vertical-align: top;
}

.no-pad {
  padding: 0 !important;
}

.pad-left-0 {
  padding-left: 0 !important;
}

.pad-right-0 {
  padding-right: 0 !important;
}

    .bordered th,
    .bordered td {
      border: 1px solid #000;
    }

    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: 700; }

   h3 {
  margin: 8px 0 6px; /* reduce top gap */
}

    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin: 15px 0 10px;
    }
.section-head {
  font-size: 14px;
  font-weight: bold;
  margin: 6px 0 6px;
  line-height: 18px;
}

.red {
  color: red;
}
    .checkbox {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 1px solid #000;
      margin-right: 6px;
      vertical-align: middle;
    }

    .checked {
      background: #000;
    }

    .small {
      font-size: 11px;
      line-height: 1.4;
    }
.services-grid td {
  width: 33%;
  padding: 6px 8px;
  vertical-align: middle;
  font-size: 12px;
}

.services-grid .checkbox {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 1px solid #000;
  margin-right: 6px;
  vertical-align: middle;
}

.services-grid .checkbox.checked::after {
  content: "✓";
  font-size: 11px;
  position: relative;
  top: -2px;
  left: 2px;
}
.lock {
  vertical-align: middle;
  pointer-events: none;
  opacity: 0.6;
  margin-right: 6px;
}

.service-opt td {
  width: 50%;
}
    .terms ol {
      padding-left: 20px;
    }

    .terms li {
      margin-bottom: 6px;
      line-height: 1.4;
    }

    .page-break {
      page-break-after: always;
    }
      .section-head {
  font-size: 14px;
  font-weight: bold;
  margin: 6px 0;
}

.red {
  color: red;
}

.lock {
  vertical-align: middle;
  pointer-events: none;
  opacity: 0.6;
  margin-right: 6px;
}

.checkbox {
  display:inline-block;
  width:14px;
  height:14px;
  border:1px solid #000;
  margin-right:6px;
  vertical-align:middle;
}
  </style>
</head>

<body>
<div class="print-section">

  <!-- HEADER -->
<table width="100%">
  <tr>
    <!-- LEFT: LOGO -->
   <td style="width:60%; vertical-align:top;" class="pad-left-0">
      <img
        style="max-width:289px; max-height:60px;"
        src="{{logoSrc}}"
      >
    </td>

    <!-- RIGHT: SERIAL + DATE (NO TABLE) -->
    <td style="width:40%; text-align:right; vertical-align:top; " class="pad-right-0">

      <!-- Serial No -->
      <div style="margin-bottom:8px; font-weight:700;">
        Serial No:
        <span style="text-decoration:underline;">
          {{job_card_number}}
        </span>
      </div>

      <!-- Date box -->
      <div
        style="
          display:inline-block;
          border:1px solid #000;
          padding:6px 14px;
          font-weight:700;
        "
      >
        Date :
        <span style="text-decoration:underline;">
          {{date}}
        </span>
      </div>

    </td>
  </tr>
</table>


  <!-- STORE -->
 <table style="margin-top:10px; width:100%; table-layout:fixed;">
  <tr>
      <td style="padding-left:0"><b>Service Location:</b> <span style="  text-decoration: underline"> {{service_location}}</span></td>
    <td class="right pad-right-0"><b>Store Manager:</b><span style="  text-decoration: underline"> {{store_manager}}</span></td>
    </tr>
  </table>

<table class="bordered" style="margin-top:10px; width:100%; border-collapse:collapse;">

  <!-- CUSTOMER DETAILS -->
  <tr>
    <td colspan="4"><strong>Name :</strong> {{customer_name}}</td>
  </tr>

  <tr>
    <td colspan="4"><strong>Full Address :</strong> {{address}}</td>
  </tr>

  <tr>
    <td colspan="2"><strong>Contact No :</strong> {{phone}}</td>
    <td colspan="2"><strong>Email :</strong> {{email}}</td>
  </tr>

  <!-- VEHICLE DETAILS -->
  <tr>
    <td colspan="2"><strong>Vehicle Type :</strong> {{vehicle_type}}</td>
    <td colspan="2"><strong>Make :</strong> {{make}}</td>
  </tr>

  <tr>
    <td colspan="2"><strong>Model :</strong> {{model}}</td>
    <td><strong>Color :</strong> {{color}}</td>
    <td><strong>Year :</strong> {{year}}</td>
  </tr>

  <tr>
    <td colspan="2"><strong>Regn. No :</strong> {{reg_no}}</td>
    <td colspan="2"><strong>Chassis No :</strong> {{chasis_no}}</td>
  </tr>

</table>


  <!-- SRS REQUIRED -->
<table style="width:100%; margin-top:10px; table-layout:fixed;">
  <tr>
    <!-- LEFT COLUMN -->
    <td width="100%" valign="top" class="pad-left-0 pad-right-0">

      <!-- SRS REQUIRED -->
      <div class="section-head">
        <span class="red">SRS</span> REQUIRED :
      </div>

      <table class="bordered service-opt" style="width:100%; margin-bottom:10px;">
       {{vehicle_condition_rows}}
      </table>

      <!-- SERVICES OPTED -->
      <div class="section-head">
        <span class="red">SERVICES</span> OPTED :
      </div>
<table class="  bordered service-opt" style="width:100%; margin-bottom:10px;">
  {{services_rows}}
</table>

    </td>

    <!-- RIGHT COLUMN -->

  </tr>
</table>
<table class="bordered" style="width:100%; table-layout:fixed;">

  <!-- TECHNICIAN HEADER -->
  <tr>
    <th colspan="3" style="text-align:left;">Studio Technician</th>
  </tr>

  <!-- NAME -->
  <tr>
<td colspan="1">
  Name : {{technician}}
</td>
    <td colspan="1">Time Start : ________</td>
    <td colspan="1">Time Finish : ________</td>
  </tr>

  <!-- WARRANTY HEADER -->
  <tr>
    <th colspan="3" style="text-align:left;">Warranty</th>
  </tr>

  <!-- WARRANTY ROW 1 -->
{{warranty_rows}}

  <!-- SIGNATURE -->
  <tr>
    <td colspan="3" style="padding-top:14px;">
      <b>Customer Signature :</b> ______________________
    </td>
  </tr>

</table>



  <!-- DAMAGE WAIVER -->
  <table style="margin-top:15px; width:100%;">
  <tr>
    <td colspan="2" class="pad-left-0 pad-right-0">
   
    <table class="bordered" style="margin-top:0px; width:100%;">

     <tr>
        <th style="text-align:left;">Damage Waiver</th>
     </tr>

    <tr>
        <td style="font-size:12.5px; line-height:1.5;">
        Detailing Devils uses premium quality vehicle care products and highly trained paint
      technicians. We take pride in delivering world class results with minimal damage to
      vehicle's finish. We guarantee flawless paint finish, but take no responsibility for
      burnouts, burn marks or any other paint damage caused during the SRS (Skin Restoration
      System) process on the following paint conditions :
      <br><br>

      <!-- CONDITIONS -->
     <table style="width:100%; margin-bottom:10px;">
        <tr>
            <td width="50%">
               {{isRepainted}}
                <b>Repainted Vehicle</b>
            </td>
            <td width="50%">
              {{isSingleStagePaint}}
                <b>Single Stage Paint</b>
            </td>
        </tr>
    <tr>
    <td>
      {{isPaintThickness}}
      <b>Paint Thickness Below 2 MIL</b>
    </td>
    <td>
    {{isVehicleOlder}}
      <b>Vehicle older than 5 Years</b>
    </td>
  </tr>
</table>


      <!-- CONFIRMATION -->
      <div style="margin-top:6px;">
                 <input
  type="checkbox"
  checked
  style="
    vertical-align:middle;
    pointer-events:none;
    opacity:0.5;
  "
>
        I have have read the disclaimer above and I understand that Detailing Devils is not
        responsible for any damage caused to my vehicle's paint during the SRS process.
      </div>

      <!-- AUTHORIZATION -->
      <div style="margin-top:12px; font-weight:bold;">
        I <u>{{service_customer_name}}</u> Authorize Detailing Devils to service my vehicle.
      </div>
    </td>
    

     </tr>
       </table>
       <tr> 
         <td width="40%" valign="top">
     </td>
     
<td width="60%" valign="top" class="pad-right-0">
<p style="text-align:right; font-size:11px; margin:6px 0 0;">
  Paint condition diagram &amp; paint depth analysis cont.
</p>
      </td>
       <tr>

 </td>
   
  </tr>
</table>



  <!-- VEHICLE DIAGRAM -->
  <div class="page-break"></div>

 <img style=\"width:800px; margin: auto;\" src="{{service_vehicle_img}}">
  <!-- TERMS -->
  <div class="terms">
    <h3>Terms and Conditions</h3>
 <ol style="list-style: decimal-leading-zero; padding-left: 18px; line-height: 1.4;">
  <li>
    The services delineated in this job card are hereby agreed upon by both the client and the franchisee.
    Any supplementary services requested shall incur additional charges.
    Only the services listed and authorized in this job card are considered authorized services.
    The parent company, Detailing Devils, will not be liable for or warrant any unauthorized services rendered.
  </li>

  <li>
    The initial condition of the vehicle has been thoroughly inspected and documented in this job card.
    The client acknowledges these pre-existing conditions by affixing their signature to this document.
  </li>

  <li>
    Full remuneration is required upon completion of the services unless otherwise agreed in writing.
    Any outstanding balance must be settled prior to the release of the vehicle.
  </li>

  <li>
    The estimated time for service completion is provided as a guideline only.
    Delays may occur due to unforeseen circumstances, and the client shall be informed promptly.
  </li>

  <li>
    The franchisee shall not be held responsible for any personal items left in the vehicle.
    Clients are advised to remove all valuables prior to service.
  </li>

  <li>
    While all reasonable care is taken, the franchisee shall not be held liable for any minor damages
    or issues not noted during the initial inspection.
    If damage is noticed during the service that was present from the beginning but missed during the
    initial inspection, the franchisee shall document the damage and notify the client immediately.
    The franchisee shall not be held responsible for pre-existing damage once documented.
    Any new damages incurred during the service shall be resolved by the franchisee.
  </li>

  <li>
    This job card alone does not constitute proof of service.
    Clients must ensure that service details are uploaded to the Detailing Devils portal
    to be eligible for any warranty claims.
  </li>

  <li>
    In the event that a Detailing Devils studio ceases operations,
    clients must claim their warranty from the nearest operational Detailing Devils studio.
  </li>

  <li>
    It is the client's responsibility to maintain records of all service transactions
    and communications related to their vehicle maintenance.
  </li>

  <li>
    Clients must adhere to all guidelines and schedules provided by Detailing Devils
    to maintain the validity of their warranty.
    The warranty is subject to certain terms and conditions, including but not limited to
    the type of service availed and adherence to prescribed maintenance routines.
  </li>

  <li>
    If the client is dissatisfied with the service, they must notify the franchisee
    within 24 hours of service completion.
    The franchisee shall make every effort to address and rectify the issue.
  </li>

  <li>
    The franchisee adheres to all applicable environmental and safety standards
    in service operations.
    Clients are requested to follow any specific instructions provided by the staff.
  </li>

  <li>
    The franchisee shall not be liable for any delay or failure in performing services
    due to circumstances beyond their control, including but not limited to
    natural disasters, acts of God, or any other unforeseen events.
  </li>

  <li>
    Any disputes arising from the service shall be addressed amicably.
    If unresolved, they shall be subject to the jurisdiction of the courts
    in the place of service.
  </li>

  <li>
    By signing this job card, the client agrees to the terms and conditions outlined herein.
  </li>

  <li>
    All client information shall be kept confidential and used solely for service-related purposes.
    The franchisee agrees to adhere to data privacy regulations and protect client data.
  </li>

  <li>
    The franchisee is committed to providing high-quality services.
    Any deviation from standard procedures shall be reported to the parent company,
    and corrective actions shall be taken.
  </li>

  <li>
    The parent company reserves the right to audit and inspect the franchisee’s operations
    to ensure compliance with company standards and prevent fraudulent activities.
  </li>

  <li>
    Only services listed and authorized in this job card shall be performed.
    Any unauthorized services or charges shall not be accepted by the client or the parent company.
  </li>

  <li>
    Clients are encouraged to follow up on maintenance services
    at authorized franchised stores only.
    The parent company shall not be responsible for services rendered by unauthorized entities.
  </li>

  <li>
    Detailed records of all services performed shall be maintained by the franchisee
    and shared with the client.
    Clients can verify service records through the official website.
  </li>

  <li>
    In the event that damage is caused by the franchisee during the service,
    the franchisee shall take full responsibility and make necessary repairs
    or compensations to the client's satisfaction.
    Detailing Devils, as the parent company, shall not be held liable
    for any damages or disputes arising from services provided by the franchisee.
  </li>

  <li>
    In case of pickup or drop-off performed by the franchisee,
    any damages that occur during transportation must be covered by the client
    or their insurance.
    The franchisee or the parent company shall not be held liable for any such damages.
  </li>
</ol>

    <p class="bold">
      Client Approval<br/><br/>
      Signature: ____________ <br/><br/>
      Date: ____________ <br/><br/>
    </p>
<p class="">
    By signing below, the undersigned acknowledges understanding and acceptance of the terms and conditions outlined in this document and recognizes the importance of maintaining accurate and up-to-date records for any warranty claims.
  </p>
 
    </div>

</div>
</body>
</html>
`;
