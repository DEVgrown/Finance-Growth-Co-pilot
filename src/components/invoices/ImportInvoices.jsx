import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, X } from "lucide-react";

export default function ImportInvoices({ onClose }) {
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
      // Step 1: Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });

      // Step 2: AI extracts invoice data
      const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            invoices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  invoice_number: { type: "string" },
                  customer_name: { type: "string" },
                  customer_email: { type: "string" },
                  customer_phone: { type: "string" },
                  issue_date: { type: "string" },
                  due_date: { type: "string" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        quantity: { type: "number" },
                        unit_price: { type: "number" },
                        total: { type: "number" }
                      }
                    }
                  },
                  subtotal: { type: "number" },
                  tax: { type: "number" },
                  total_amount: { type: "number" },
                  notes: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (extractionResult.status === "success") {
        // Step 3: Insert invoices into database
        const invoices = extractionResult.output.invoices;
        await base44.entities.Invoice.bulkCreate(
          invoices.map(inv => ({
            ...inv,
            status: "draft"
          }))
        );

        setResult({
          success: true,
          count: invoices.length,
          message: `Successfully imported ${invoices.length} invoice(s)`
        });

        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      } else {
        setResult({
          success: false,
          message: extractionResult.details || "Failed to extract invoice data"
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      setResult({
        success: false,
        message: "Error processing file. Please ensure it's a valid invoice document."
      });
    }

    setIsProcessing(false);
  };

  return (
    <Card className="border-none shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Invoice Import
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            <strong>AI-Powered:</strong> Upload invoices (PDF, Excel, image) and our AI will automatically extract all data
          </AlertDescription>
        </Alert>

        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-purple-400 transition-colors cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <Label htmlFor="invoice-file" className="cursor-pointer">
            <div className="text-lg font-medium text-gray-900 mb-2">
              Click to upload or drag and drop
            </div>
            <p className="text-sm text-gray-500 mb-4">
              PDF, Excel, CSV, JPG, PNG (max 10MB)
            </p>
          </Label>
          <Input
            id="invoice-file"
            type="file"
            accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
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
          <Alert className="bg-purple-50 border-purple-200">
            <AlertDescription className="text-purple-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              AI is analyzing your document...
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
          <Button onClick={onClose} className="w-full bg-gradient-to-r from-green-600 to-teal-600">
            Done
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
