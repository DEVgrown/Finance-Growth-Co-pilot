import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TrendingUp, AlertCircle } from "lucide-react";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  disbursed: "bg-purple-100 text-purple-800"
};

export default function LoanList({ loans }) {
  if (loans.length === 0) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Loan Applications</h3>
          <p className="text-gray-600">Apply for your first micro-loan to grow your business</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Loan Applications ({loans.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loans.map((loan) => (
            <div key={loan.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">
                      KES {loan.loan_amount.toLocaleString()}
                    </h3>
                    <Badge className={statusColors[loan.status]}>
                      {loan.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span>Purpose: {loan.loan_purpose.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    <span>Repayment: {loan.repayment_period} months</span>
                    <span>•</span>
                    <span>Applied: {format(new Date(loan.application_date), 'MMM dd, yyyy')}</span>
                  </div>
                  {loan.monthly_payment && (
                    <p className="text-sm text-gray-600 mt-2">
                      Monthly Payment: KES {loan.monthly_payment.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  {loan.eligibility_score && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Eligibility:</span>
                      <Badge variant="outline" className={
                        loan.eligibility_score >= 75 ? "bg-green-100 text-green-800" :
                        loan.eligibility_score >= 50 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }>
                        {loan.eligibility_score}%
                      </Badge>
                    </div>
                  )}
                  {loan.risk_assessment && (
                    <Badge variant="outline" className={
                      loan.risk_assessment === 'low' ? "bg-green-100 text-green-800" :
                      loan.risk_assessment === 'medium' ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {loan.risk_assessment} risk
                    </Badge>
                  )}
                </div>
              </div>

              {loan.ai_recommendation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{loan.ai_recommendation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
