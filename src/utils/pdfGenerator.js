import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateQuotationPDF = async (quotation) => {
    console.log('Generating PDF for quotation:', quotation);

    // Create a temporary div to render the quotation
    const tempDiv = document.createElement('div');
    tempDiv.className = 'quotation-pdf-container';

    // Format date properly
    const formattedDate = quotation.date ? new Date(quotation.date).toLocaleDateString() : 'N/A';

    // Calculate totals
    const items = quotation.quotationItems || [];
    const subtotal = items.reduce((total, item) =>
        total + (Number(item.quantity || 0) * Number(item.itemPrice || 0)), 0);

    // Create the PDF content
    tempDiv.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333;">Quotation</h1>
                <p>Date: ${formattedDate}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>Project Details</h3>
                <p><strong>Quotation Name:</strong> ${quotation.quotationName || 'N/A'}</p>
                <p><strong>Client:</strong> ${quotation.clientName || 'N/A'}</p>
                <p><strong>Note:</strong> ${quotation.note || 'N/A'}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h3>Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f5f5f5;">
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item Name</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Quantity</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rate (₹)</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.length > 0 ?
            items.map(item => {
                console.log('Processing item for PDF:', item);
                const quantity = Number(item.quantity || 0);
                const rate = Number(item.itemPrice || 0);
                const amount = quantity * rate;
                return `
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${item.itemName || 'N/A'}</td>
                                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${quantity}</td>
                                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${rate.toFixed(2)}</td>
                                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${amount.toFixed(2)}</td>
                                    </tr>
                                `;
            }).join('')
            : '<tr><td colspan="4" style="text-align: center; padding: 8px;">No items found</td></tr>'
        }
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>Subtotal:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>Tax:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${(Number(quotation.orderTax || 0)).toFixed(2)}</td>
                        </tr>
                        <tr style="background-color: #f5f5f5;">
                            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>Grand Total:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${(Number(quotation.grandTotal || 0)).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div style="margin-top: 40px;">
                <p><strong>Terms and Conditions:</strong></p>
                <ol style="margin-left: 20px;">
                    <li>Payment Terms: 50% advance, remaining upon completion</li>
                    <li>Validity: This quotation is valid for 30 days</li>
                    <li>Taxes: All applicable taxes are extra</li>
                </ol>
            </div>

            <div style="margin-top: 40px; text-align: right;">
                <p style="margin-bottom: 40px;">
                    <strong>Authorized Signature</strong>
                </p>
                <p>_____________________</p>
            </div>
        </div>
    `;

    // Add the temporary div to the document
    document.body.appendChild(tempDiv);

    try {
        // Convert the div to canvas
        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            logging: true,
            useCORS: true
        });

        // Create PDF
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        const pdf = new jsPDF('p', 'mm');
        let position = 0;

        // Add image to PDF
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add new pages if content is longer than one page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Save the PDF
        pdf.save(`${quotation.quotationName || 'Quotation'}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    } finally {
        // Clean up: remove the temporary div
        document.body.removeChild(tempDiv);
    }
}; 