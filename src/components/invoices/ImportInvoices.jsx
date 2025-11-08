import React, { useState } from "react";
import apiClient from "../../lib/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, X, Loader2 } from "lucide-react";

export default function ImportInvoices({ onClose, businessId }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setResult(null);

    try {
      // For now, parse CSV manually or use a simple parser
      // In production, you'd upload to backend for AI processing
      const text = await selectedFile.text();
      
      // Simple CSV parser (you can enhance this)
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      if (!headers.includes('customer_name') && !headers.includes('Customer Name')) {
        throw new Error('CSV must include customer_name column');
      }

      const invoices = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        // Skip empty rows
        if (values.every(v => !v)) continue;
        
        const invoice = {
          invoice_number: values[headers.indexOf('invoice_number')] || values[headers.indexOf('Invoice Number')] || `IMPORT-${Date.now()}-${i}`,
          customer_name: values[headers.indexOf('customer_name')] || values[headers.indexOf('Customer Name')] || values[headers.indexOf('Customer')] || '',
          customer_email: values[headers.indexOf('customer_email')] || values[headers.indexOf('Email')] || values[headers.indexOf('Customer Email')] || '',
          customer_phone: values[headers.indexOf('customer_phone')] || values[headers.indexOf('Phone')] || values[headers.indexOf('Customer Phone')] || '',
          subtotal: parseFloat(values[headers.indexOf('subtotal')] || values[headers.indexOf('Subtotal')] || 0),
          tax_amount: parseFloat(values[headers.indexOf('tax_amount')] || values[headers.indexOf('Tax')] || values[headers.indexOf('Tax Amount')] || 0),
          total_amount: parseFloat(values[headers.indexOf('total_amount')] || values[headers.indexOf('Total')] || values[headers.indexOf('Total Amount')] || 0),
          issue_date: values[headers.indexOf('issue_date')] || values[headers.indexOf('Issue Date')] || new Date().toISOString().split('T')[0],
          due_date: values[headers.indexOf('due_date')] || values[headers.indexOf('Due Date')] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'draft',
          currency: 'KES',
          business: businessId,
        };
        
        // Calculate total if not provided
        if (!invoice.total_amount && invoice.subtotal) {
          invoice.total_amount = invoice.subtotal + (invoice.tax_amount || 0);
        }
        
        if (invoice.customer_name && invoice.total_amount > 0) {
          invoices.push(invoice);
        }
      }

      if (invoices.length === 0) {
        throw new Error('No valid invoices found in file');
      }

      // Create invoices via API
      const created = [];
      for (const invoice of invoices) {
        try {
          const createdInvoice = await apiClient.createInvoice(invoice);
          created.push(createdInvoice);
        } catch (err) {
          console.error('Error creating invoice:', err);
        }
      }

      setResult({
        success: true,
        count: created.length,
        message: `Successfully imported ${created.length} invoice(s)`
      });

      toast.success(`Successfully imported ${created.length} invoice(s)`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (error) {
      console.error("Import error:", error);
      setResult({
        success: false,
        message: error.message || "Error processing file. Please ensure it's a valid CSV file with required columns."
      });
      toast.error(error.message || "Error processing file. Please check the CSV format.");
    }

    setIsProcessing(false);
  };

  return (
    <Card className="border-none shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Import Invoices
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            <strong>CSV Import:</strong> Upload a CSV file with columns: customer_name, invoice_number, subtotal, tax_amount, total_amount, issue_date, due_date
          </AlertDescription>
        </Alert>

        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <Label htmlFor="invoice-file" className="cursor-pointer">
            <div className="text-lg font-medium text-gray-900 mb-2">
              Click to upload or drag and drop
            </div>
            <p className="text-sm text-gray-500 mb-4">
              CSV file (max 10MB)
            </p>
          </Label>
          <Input
            id="invoice-file"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
          />
          {file && !isProcessing && !result && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700 mt-4">
              <FileText className="w-4 h-4" />
              {file.name}
            </div>
          )}
        </div>

        {isProcessing && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing file...
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
              <div className="flex items-center gap-2">
                {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {result.message}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {result?.success && (
          <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Done
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
