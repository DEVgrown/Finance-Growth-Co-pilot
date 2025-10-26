import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Receipt, 
  Send, 
  AlertCircle, 
  Users, 
  CreditCard,
  BarChart3,
  FileText
} from "lucide-react";

const quickCommands = [
  {
    icon: TrendingUp,
    text: "What's my cash position this week?",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    icon: Receipt,
    text: "Show me overdue invoices",
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    icon: Send,
    text: "Send payment reminders to overdue clients",
    color: "text-orange-600",
    bg: "bg-orange-50"
  },
  {
    icon: BarChart3,
    text: "Analyze my expenses this month",
    color: "text-red-600",
    bg: "bg-red-50"
  },
  {
    icon: Users,
    text: "List my top suppliers",
    color: "text-green-600",
    bg: "bg-green-50"
  },
  {
    icon: CreditCard,
    text: "What's my credit score?",
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    icon: AlertCircle,
    text: "Any financial risks I should know about?",
    color: "text-yellow-600",
    bg: "bg-yellow-50"
  },
  {
    icon: FileText,
    text: "Generate a financial summary",
    color: "text-teal-600",
    bg: "bg-teal-50"
  }
];

export default function QuickCommands({ onCommand }) {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-gray-700">Quick Commands</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickCommands.map((cmd, index) => {
          const Icon = cmd.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-start text-left h-auto py-3 ${cmd.bg} hover:${cmd.bg} hover:scale-105 transition-all`}
              onClick={() => onCommand(cmd.text)}
            >
              <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${cmd.color}`} />
              <span className="text-sm text-gray-700">{cmd.text}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
