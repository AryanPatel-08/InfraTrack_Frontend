import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from 'html2canvas';

export const generateQuotationPDFBlob = async (quotation) => {
  console.log('Generating PDF for quotation:', quotation);

  // Create a temporary div to render the quotation
  const tempDiv = document.createElement('div');
  tempDiv.className = 'quotation-pdf-container';

  const statusList = [
    { id: 1, name: 'Pending' },
    { id: 2, name: 'Confirmed' },
    { id: 3, name: 'Canceled' },
    // ...
  ];

  // Format date properly
  const formattedDate = quotation.date ? new Date(quotation.date).toLocaleDateString() : 'N/A';
  const qStatusName = statusList.find(s => s.id === quotation.status)?.name || 'Pending';

  // Calculate totals
  const items = quotation.quotationItems || [];
  const subtotal = items.reduce((total, item) =>
    total + (Number(item.quantity || 0) * Number(item.itemPrice || 0)), 0);

  // Create the PDF content
  tempDiv.innerHTML = `
  <div style="
    max-width: 1500px;
    margin: 0 auto; 
    padding: 30px; 
    font-family: 'Arial', sans-serif; 
    color: #333;
    background-color: #fff;
  ">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="margin: 0; font-weight: 700; font-size: 28px; color: #004085;">InfraTrack Progress Management System</h1>
      <p style="font-size: 16px; color: #666; margin-top: 4px;">
        Date: ${formattedDate} | Status: <strong>${qStatusName}</strong>
      </p>
    </div>

    <!-- Client & Quotation Info -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%;">
            <h3 style="border-bottom: 2px solid #004085; padding-bottom: 6px; margin-bottom: 12px; font-weight: 600;">Quotation Details</h3>
            <p><strong>Quotation No.:</strong> ${quotation.quotationId || 'N/A'}</p>
            <p><strong>Quotation Name:</strong> ${quotation.quotationName || 'N/A'}</p>
            <p><strong>Note:</strong> ${quotation.note || 'N/A'}</p>
        </div>
        <div style="width: 48%;">
            <h3 style="border-bottom: 2px solid #004085; padding-bottom: 6px; margin-bottom: 12px; font-weight: 600;">Client Information</h3>
            <p><strong>Name:</strong> ${quotation.clientName || 'N/A'}</p>
            <p><strong>Email:</strong> ${quotation.client?.email || 'N/A'}</p>
            <p><strong>Mobile:</strong> ${quotation.client?.mobile || 'N/A'}</p>
        </div>
    </div>

    <!-- Items Table -->
    <div>
  <h3 style="border-bottom: 2px solid #004085; padding-bottom: 6px; margin-bottom: 15px; font-weight: 600;">Items</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <thead>
      <tr style="background-color: #e9ecef;">
        <th style="width: 25%; border: 1px solid #ddd; padding: 10px; text-align: left;">Item Name</th>
        <th style="width: 25%; border: 1px solid #ddd; padding: 10px; text-align: left;">Remark</th>
        <th style="width: 15%; border: 1px solid #ddd; padding: 10px; text-align: right;">Rate/Sq.Ft. (Rs.)</th>
        <th style="width: 15%; border: 1px solid #ddd; padding: 10px; text-align: right;">Qty (Sq.Ft.)</th>
        <th style="width: 20%; border: 1px solid #ddd; padding: 10px; text-align: right;">Amount (Rs.)</th>
      </tr>
    </thead>
    <tbody>
      ${items.length > 0
      ? items.map(item => {
        const quantity = Number(item.quantity || 0);
        const rate = Number(item.itemPrice || 0);
        const amount = quantity * rate;
        return `
              <tr>
                <td style="width: 25%; border: 1px solid #ddd; padding: 10px;">${item.itemName || 'N/A'}</td>
                <td style="width: 25%; border: 1px solid #ddd; padding: 10px;">${item.remark || 'N/A'}</td>
                <td style="width: 15%; border: 1px solid #ddd; padding: 10px; text-align: right;">${rate.toFixed(2)}</td>
                <td style="width: 15%; border: 1px solid #ddd; padding: 10px; text-align: right;">${quantity}</td>
                <td style="width: 20%; border: 1px solid #ddd; padding: 10px; text-align: right;">${amount.toFixed(2)}</td>
              </tr>
            `;
      }).join('')
      : `<tr><td colspan="5" style="text-align: center; padding: 10px;">No items found</td></tr>`
    }
    </tbody>
    <tfoot>
      <tr style="background-color: #f8f9fa; font-weight: 600;">
        <td colspan="4" style="border: 1px solid #ddd; padding: 10px; text-align: right;">Subtotal:</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${subtotal.toFixed(2)} Rs.</td>
      </tr>
      <tr style="background-color: #f8f9fa; font-weight: 600;">
        <td colspan="4" style="border: 1px solid #ddd; padding: 10px; text-align: right;">Tax:</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${(Number(quotation.orderTax || 0)).toFixed(2)} Rs.</td>
      </tr>
      <tr style="background-color: #e2e6ea; font-weight: 700;">
        <td colspan="4" style="border: 1px solid #ddd; padding: 10px; text-align: right;">Grand Total:</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${(Number(quotation.grandTotal || 0)).toFixed(2)} Rs.</td>
      </tr>
    </tfoot>
  </table>
</div>


    <!-- Terms and Conditions -->
    <div style="margin-top: 40px; font-size: 13px; color: #555;">
      <strong>Terms and Conditions:</strong>
      <ol style="margin-left: 20px; margin-top: 10px;">
        <li>Payment Terms: 50% advance, remaining upon completion</li>
        <li>10% of amount will be kept as security deposit</li>
        <li>Taxes: All applicable taxes are extra</li>
      </ol>
    </div>

    <!-- Signature -->
    <div style="margin-top: 50px; text-align: right;">
      <p style="margin-bottom: 60px; font-weight: 600;">Authorized Signature</p>
      <p style="border-top: 1px solid #333; width: 200px; margin-left: auto;">&nbsp;</p>
    </div>

  </div>
`;

  // Add the temporary div to the document
  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm');
    const imgWidth = 210; // A4 size width in mm
    const pageHeight = 297; // A4 size height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Return PDF as Blob instead of saving it
    return pdf.output('blob');

  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw error;
  } finally {
    document.body.removeChild(tempDiv);
  }
};

