import React from "react";
import { format } from "date-fns";

export const generateInvoicePDF = async (invoice, business) => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .header h1 { font-size: 32px; margin-bottom: 5px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .business-details { background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; margin-bottom: 30px; }
    .business-details p { margin: 5px 0; font-size: 13px; }
    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .invoice-info div { flex: 1; }
    .invoice-info h3 { color: #10b981; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }
    .invoice-info p { margin: 5px 0; font-size: 14px; }
    .invoice-number { background: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
    .invoice-number h2 { font-size: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead { background: #10b981; color: white; }
    thead th { padding: 12px; text-align: left; font-size: 13px; text-transform: uppercase; }
    tbody td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    tbody tr:hover { background: #f9fafb; }
    .totals { text-align: right; margin-top: 20px; }
    .totals div { margin: 8px 0; font-size: 15px; }
    .totals .subtotal { color: #6b7280; }
    .totals .tax { color: #6b7280; }
    .totals .total { font-size: 24px; font-weight: bold; color: #10b981; padding-top: 10px; border-top: 2px solid #10b981; margin-top: 10px; }
    .notes { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 30px 0; }
    .notes h4 { color: #92400e; margin-bottom: 8px; }
    .notes p { color: #78350f; font-size: 14px; line-height: 1.6; }
    .footer { text-align: center; padding: 30px 0; border-top: 2px solid #e5e7eb; margin-top: 40px; }
    .footer p { color: #6b7280; font-size: 13px; margin: 5px 0; }
    .footer strong { color: #10b981; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-pending { background: #dbeafe; color: #1e40af; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div className="container">
    <div className="header">
      <h1>${business?.business_name || 'FinanceGrowth Co-Pilot'}</h1>
      <p>Empowering SMEs with Smart Financial Solutions</p>
    </div>
    
    <div className="business-details">
      <p><strong>Business Details:</strong></p>
      ${business?.location ? `<p>📍 ${business.location}</p>` : ''}
      ${business?.phone_number ? `<p>📞 ${business.phone_number}</p>` : ''}
      ${business?.mpesa_number ? `<p>💳 M-Pesa: ${business.mpesa_number}</p>` : ''}
      ${business?.tax_pin ? `<p>🔖 KRA PIN: ${business.tax_pin}</p>` : ''}
    </div>

    <div className="invoice-number">
      <h2>INVOICE #${invoice.invoice_number}</h2>
      <span className="status-badge status-${invoice.status === 'paid' ? 'paid' : invoice.status === 'sent' ? 'pending' : 'overdue'}">
        ${invoice.status.toUpperCase()}
      </span>
    </div>

    <div className="invoice-info">
      <div>
        <h3>Bill To:</h3>
        <p><strong>${invoice.customer_name}</strong></p>
        ${invoice.customer_email ? `<p>📧 ${invoice.customer_email}</p>` : ''}
        ${invoice.customer_phone ? `<p>📞 ${invoice.customer_phone}</p>` : ''}
      </div>
      <div>
        <h3>Invoice Details:</h3>
        <p><strong>Issue Date:</strong> ${format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</p>
        <p><strong>Due Date:</strong> ${format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
        ${invoice.paid_date ? `<p><strong>Paid Date:</strong> ${format(new Date(invoice.paid_date), 'MMM dd, yyyy')}</p>` : ''}
        ${invoice.payment_method ? `<p><strong>Payment Method:</strong> ${invoice.payment_method}</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Quantity</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items?.map(item => `
          <tr>
            <td>${item.description}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">KES ${item.unit_price.toLocaleString()}</td>
            <td style="text-align: right;"><strong>KES ${(item.total || item.quantity * item.unit_price).toLocaleString()}</strong></td>
          </tr>
        `).join('') || '<tr><td colspan="4">No items</td></tr>'}
      </tbody>
    </table>

    <div className="totals">
      <div className="subtotal">Subtotal: KES ${invoice.subtotal?.toLocaleString() || invoice.total_amount.toLocaleString()}</div>
      ${invoice.tax ? `<div className="tax">Tax (VAT): KES ${invoice.tax.toLocaleString()}</div>` : ''}
      <div className="total">TOTAL: KES ${invoice.total_amount.toLocaleString()}</div>
    </div>

    ${invoice.notes ? `
      <div className="notes">
        <h4>📝 Notes:</h4>
        <p>${invoice.notes}</p>
      </div>
    ` : ''}

    <div className="footer">
      <p><strong>Thank you for your business!</strong></p>
      <p>For any questions regarding this invoice, please contact us:</p>
      ${business?.phone_number ? `<p>📞 ${business.phone_number}</p>` : ''}
      ${business?.email ? `<p>📧 ${business.email}</p>` : ''}
      <p style="margin-top: 20px; font-size: 11px;">Generated by <strong>FinanceGrowth Co-Pilot</strong> - SME Financial Management Platform</p>
    </div>
  </div>
</body>
</html>
  `;

  // Create a blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice-${invoice.invoice_number}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
