import React, { useState } from "react";
import base44 from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Shield, AlertCircle } from "lucide-react";

import LoanApplicationForm from "../components/credit/LoanApplicationForm";
import CreditScore from "../components/credit/CreditScore";
import LoanList from "../components/credit/LoanList";

export default function Credit() {
  const [showForm, setShowForm] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const queryClient = useQueryClient();

  const { data: business } = useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      const businesses = await base44.entities.Business.list();
      return businesses[0];
    }
  });

  const { data: loans = [] } = useQuery({
    queryKey: ['loans'],
    queryFn: () => base44.entities.LoanApplication.list('-created_date'),
    initialData: []
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-transaction_date'),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LoanApplication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setShowForm(false);
    }
  });

  const calculateCreditScore = async () => {
    setIsCalculating(true);
    try {
      const last90Days = transactions.filter(t => {
        const date = new Date(t.transaction_date);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        return date >= ninetyDaysAgo;
      });

      const income = last90Days.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = last90Days.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      const prompt = `Calculate a credit score (0-100) for an SME with:
- Total income (90 days): KES ${income}
- Total expenses (90 days): KES ${expenses}
- Transaction count: ${last90Days.length}
- Business age: ${business?.created_date ? Math.floor((Date.now() - new Date(business.created_date).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0} months

Provide:
1. Credit score (0-100)
2. Risk assessment
3. Recommendations for improvement`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            credit_score: { type: "number" },
            risk_assessment: { type: "string" },
            improvement_recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      if (business) {
        await base44.entities.Business.update(business.id, {
          credit_score: aiResponse.credit_score
        });
        queryClient.invalidateQueries({ queryKey: ['business'] });
      }
    } catch (error) {
      console.error("Error calculating credit score:", error);
    }
    setIsCalculating(false);
  };

  const handleLoanApplication = async (data) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const avgMonthlyRevenue = income / 3;
    const avgMonthlyExpenses = expenses / 3;

    const prompt = `Assess loan eligibility for:
- Requested amount: KES ${data.loan_amount}
- Repayment period: ${data.repayment_period} months
- Average monthly revenue: KES ${avgMonthlyRevenue}
- Average monthly expenses: KES ${avgMonthlyExpenses}
- Credit score: ${business?.credit_score || 50}

Provide:
1. Eligibility score (0-100)
2. Risk assessment (low/medium/high)
3. Monthly payment calculation
4. Recommendation`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          eligibility_score: { type: "number" },
          risk_assessment: { type: "string" },
          monthly_payment: { type: "number" },
          recommendation: { type: "string" }
        }
      }
    });

    createMutation.mutate({
      ...data,
      eligibility_score: aiResponse.eligibility_score,
      risk_assessment: aiResponse.risk_assessment,
      monthly_payment: aiResponse.monthly_payment,
      ai_recommendation: aiResponse.recommendation,
      supporting_data: {
        average_monthly_revenue: avgMonthlyRevenue,
        average_monthly_expenses: avgMonthlyExpenses,
        cash_flow_stability: business?.credit_score || 50,
        business_age_months: business?.created_date ? Math.floor((Date.now() - new Date(business.created_date).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
      },
      application_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credit & Financing</h1>
          <p className="text-gray-600 mt-1">Access micro-loans based on your business performance</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={calculateCreditScore}
            disabled={isCalculating}
            variant="outline"
            className="border-blue-600 text-blue-600"
          >
            {isCalculating ? "Calculating..." : "Update Credit Score"}
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Apply for Loan
          </Button>
        </div>
      </div>

      <CreditScore business={business} />

      {showForm && (
        <LoanApplicationForm
          onSubmit={handleLoanApplication}
          onCancel={() => setShowForm(false)}
          isSubmitting={createMutation.isPending}
        />
      )}

      <LoanList loans={loans} />
    </div>
  );
}


