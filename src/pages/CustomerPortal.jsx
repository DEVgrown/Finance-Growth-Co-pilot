import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Search, Users, FileText, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

export default function CustomerPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for now - will connect to real API
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      // TODO: Connect to Django API
      return [
        {
          id: 1,
          name: 'Tech Solutions Ltd',
          email: 'contact@techsolutions.co.ke',
          phone: '+254712345678',
          totalInvoices: 12,
          totalAmount: 450000,
          status: 'active',
          lastInvoiceDate: '2024-01-15'
        },
        {
          id: 2,
          name: 'Green Energy Co',
          email: 'info@greenenergy.co.ke',
          phone: '+254723456789',
          totalInvoices: 8,
          totalAmount: 320000,
          status: 'active',
          lastInvoiceDate: '2024-01-10'
        }
      ];
    }
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Customer Portal
          </h1>
          <p className="text-gray-600 mt-1">Manage your customers and their invoices</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
          <Users className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search customers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No customers found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or add a new customer</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <Card key={customer.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{customer.name}</h3>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                          </div>
                          {customer.status === 'active' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400 ml-auto" />
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Phone</p>
                            <p className="text-sm font-medium">{customer.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total Invoices</p>
                            <p className="text-sm font-medium">{customer.totalInvoices}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                            <p className="text-sm font-medium">{formatCurrency(customer.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Last Invoice</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(customer.lastInvoiceDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          View Invoices
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





