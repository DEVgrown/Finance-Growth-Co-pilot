import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XCircle, Sparkles } from "lucide-react";

const LOAN_PURPOSES = ["inventory", "equipment", "expansion", "working_capital", "emergency", "other"];

export default function LoanApplicationForm({ onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    loan_amount: "",
    loan_purpose: "working_capital",
    repayment_period: "12"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      loan_amount: parseFloat(formData.loan_amount),
      repayment_period: parseInt(formData.repayment_period)
    });
  };

  return (
    <Card className="border-none shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Loan Application
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loan_amount">Loan Amount (KES) *</Label>
              <Input
                id="loan_amount"
                type="number"
                step="1000"
                value={formData.loan_amount}
                onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })}
                placeholder="e.g., 50000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repayment_period">Repayment Period (Months) *</Label>
              <Select
                value={formData.repayment_period}
                onValueChange={(value) => setFormData({ ...formData, repayment_period: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="18">18 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="loan_purpose">Purpose *</Label>
              <Select
                value={formData.loan_purpose}
                onValueChange={(value) => setFormData({ ...formData, loan_purpose: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_PURPOSES.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isSubmitting ? "Processing..." : "Submit Application"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
