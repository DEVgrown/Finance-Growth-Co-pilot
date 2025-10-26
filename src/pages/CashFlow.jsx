import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function CashFlow() {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: forecasts = [] } = useQuery({
    queryKey: ['forecasts'],
    queryFn: () => base44.entities.CashFlowForecast.list('-forecast_date'),
    initialData: []
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-transaction_date'),
    initialData: []
  });

  const generateForecast = async () => {
    setIsGenerating(true);
    try {
      // Calculate historical data
      const last30Days = transactions.filter(t => {
        const date = new Date(t.transaction_date);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return date >= monthAgo;
      });

      const avgIncome = last30Days
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) / 30;

      const avgExpenses = last30Days
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) / 30;

      // Use AI to generate forecast
      const prompt = `Based on historical transaction data:
- Average daily income: KES ${avgIncome.toFixed(2)}
- Average daily expenses: KES ${avgExpenses.toFixed(2)}
- Transaction count: ${last30Days.length}

Generate a 30-day cash flow forecast with:
1. Predicted income and expenses
2. Risk assessment
3. Specific recommendations for improving cash flow`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_income: { type: "number" },
            predicted_expenses: { type: "number" },
            risk_level: { type: "string", enum: ["low", "medium", "high"] },
            confidence_score: { type: "number" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      const netCashFlow = aiResponse.predicted_income - aiResponse.predicted_expenses;

      await base44.entities.CashFlowForecast.create({
        forecast_period: "30_days",
        predicted_income: aiResponse.predicted_income,
        predicted_expenses: aiResponse.predicted_expenses,
        net_cash_flow: netCashFlow,
        confidence_score: aiResponse.confidence_score,
        risk_level: aiResponse.risk_level,
        recommendations: aiResponse.recommendations,
        forecast_date: new Date().toISOString().split('T')[0]
      });

      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
    } catch (error) {
      console.error("Error generating forecast:", error);
    }
    setIsGenerating(false);
  };

  const latestForecast = forecasts[0];

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Flow Analysis</h1>
          <p className="text-gray-600 mt-1">AI-powered forecasting and insights</p>
        </div>
        <Button
          onClick={generateForecast}
          disabled={isGenerating}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Forecast
            </>
          )}
        </Button>
      </div>

      {latestForecast && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <p className={`text-sm font-medium px-2 py-1 rounded ${
                    latestForecast.risk_level === 'low' ? 'bg-green-200 text-green-800' :
                    latestForecast.risk_level === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {latestForecast.risk_level} risk
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-2">Predicted Income (30 days)</p>
                <p className="text-3xl font-bold text-gray-900">
                  KES {latestForecast.predicted_income.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <p className="text-sm font-medium text-gray-600">
                    {latestForecast.confidence_score}% confidence
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-2">Predicted Expenses (30 days)</p>
                <p className="text-3xl font-bold text-gray-900">
                  KES {latestForecast.predicted_expenses.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className={`border-none shadow-lg ${
              latestForecast.net_cash_flow >= 0
                ? 'bg-gradient-to-br from-blue-50 to-cyan-50'
                : 'bg-gradient-to-br from-orange-50 to-amber-50'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className={`w-6 h-6 ${
                    latestForecast.net_cash_flow >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`} />
                </div>
                <p className="text-sm text-gray-600 mb-2">Net Cash Flow (30 days)</p>
                <p className={`text-3xl font-bold ${
                  latestForecast.net_cash_flow >= 0 ? 'text-blue-900' : 'text-orange-900'
                }`}>
                  {latestForecast.net_cash_flow >= 0 ? '+' : ''}KES {latestForecast.net_cash_flow.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestForecast.recommendations?.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                    <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-800 font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!latestForecast && (
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Forecast Available
            </h3>
            <p className="text-gray-600 mb-6">
              Generate your first AI-powered cash flow forecast to get insights
            </p>
            <Button
              onClick={generateForecast}
              disabled={isGenerating}
              className="bg-gradient-to-r from-teal-600 to-cyan-600"
            >
              Generate Forecast Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
