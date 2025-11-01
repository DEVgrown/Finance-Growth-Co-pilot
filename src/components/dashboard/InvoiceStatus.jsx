import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function InvoiceStatus({ invoices }) {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'sent': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Receipt className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statusCounts = {
    paid: invoices.filter(i => i.status === 'paid').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    draft: invoices.filter(i => i.status === 'draft').length
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Invoice Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(status)}
                <span className="text-xs font-medium text-gray-600 capitalize">{status}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm font-medium text-gray-700">Recent Invoices</p>
          {invoices.slice(0, 5).map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{invoice.customer_name}</p>
                <p className="text-xs text-gray-500">#{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">KES {invoice.total_amount.toLocaleString()}</p>
                <Badge variant="outline" className={`text-xs mt-1 ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


