import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, User } from "lucide-react";
import { format } from "date-fns";

const intentColors = {
  cash_flow: "bg-blue-100 text-blue-800",
  invoice_status: "bg-purple-100 text-purple-800",
  payment_reminder: "bg-orange-100 text-orange-800",
  expense_analysis: "bg-red-100 text-red-800",
  supplier_info: "bg-green-100 text-green-800",
  credit_query: "bg-indigo-100 text-indigo-800",
  general_help: "bg-gray-100 text-gray-800",
  unknown: "bg-gray-100 text-gray-800"
};

export default function ConversationHistory({ conversations }) {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Conversation History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No conversations yet</p>
            <p className="text-sm">Start by asking me a question!</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 bg-blue-50 p-3 rounded-xl rounded-tl-none">
                  <p className="text-sm text-gray-800">{conv.user_input}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={intentColors[conv.intent]}>
                      {conv.intent?.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(conv.conversation_date), 'MMM dd, h:mm a')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 bg-purple-50 p-3 rounded-xl rounded-tl-none">
                  <p className="text-sm text-gray-800">{conv.ai_response}</p>
                  {conv.action_taken && (
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      Action: {conv.action_taken}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}


