import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  CreditCard,
  Building2
} from "lucide-react";
import { format } from "date-fns";

export default function CustomerPortal() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const { data: customer } = useQuery({
    queryKey: ['customer', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const customers = await base44.entities.Customer.list();
      return customers.find(c => c.email === user.email);
    },
    enabled: !!user
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['customer-invoices', customer?.email],
    queryFn: async () => {
      if (!customer) return [];
      const allInvoices = await base44.entities.Invoice.list('-created_date');
      return allInvoices.filter(inv => inv.customer_email === customer.email);
    },
    enabled: !!customer
  });

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800"
  };

  const statusIcons = {
    draft: <Clock className="w-4 h-4" />,
    sent: <AlertCircle className="w-4 h-4" />,
    paid: <CheckCircle className="w-4 h-4" />,
    overdue: <AlertCircle className="w-4 h-4" />
  };

  const totalOwed = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  if (!user || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait while we load your account</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {customer.customer_name}
              </h1>
              <p className="text-gray-600">Customer Portal</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="border-none shadow-md bg-gradient-to-br from-red-50 to-orange-50">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 mb-1">Amount Due</p>
                <p className="text-2xl font-bold text-red-600">
                  KES {totalOwed.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  KES {totalPaid.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">
                  {invoices.length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {invoices.filter(inv => inv.status === 'overdue').length > 0 && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Overdue Invoices:</strong> You have {invoices.filter(inv => inv.status === 'overdue').length} overdue invoice(s). Please make payment as soon as possible.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">
                        Invoice #{invoice.invoice_number}
                      </h3>
                      <Badge className={statusColors[invoice.status]}>
                        <span className="flex items-center gap-1">
                          {statusIcons[invoice.status]}
                          {invoice.status}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>Issued: {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</span>
                      <span>•</span>
                      <span>Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        KES {invoice.total_amount.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600" size="sm">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {invoices.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No invoices yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
