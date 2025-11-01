import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from "date-fns";

export default function CashFlowChart({ transactions }) {
  const generateChartData = () => {
    const startDate = startOfMonth(subMonths(new Date(), 2));
    const endDate = endOfMonth(new Date());
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const dataByDay = {};
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      dataByDay[dateStr] = { date: dateStr, income: 0, expenses: 0 };
    });

    transactions.forEach(t => {
      const dateStr = t.transaction_date;
      if (dataByDay[dateStr]) {
        if (t.type === 'income') {
          dataByDay[dateStr].income += t.amount;
        } else {
          dataByDay[dateStr].expenses += t.amount;
        }
      }
    });

    return Object.values(dataByDay)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(d => ({
        ...d,
        date: format(new Date(d.date), 'MMM dd'),
        netFlow: d.income - d.expenses
      }));
  };

  const data = generateChartData();

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Cash Flow Trends</CardTitle>
        <p className="text-sm text-gray-500">Income vs Expenses over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              formatter={(value) => `KES ${value.toLocaleString()}`}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', r: 4 }}
              name="Expenses"
            />
            <Line 
              type="monotone" 
              dataKey="netFlow" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Net Flow"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


