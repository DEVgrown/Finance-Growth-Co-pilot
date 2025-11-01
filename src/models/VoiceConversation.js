export const VoiceConversationSchema = {
  "name": "VoiceConversation",
  "type": "object",
  "properties": {
    "user_input": {
      "type": "string",
      "description": "User's voice input (transcribed)"
    },
    "ai_response": {
      "type": "string",
      "description": "AI's response text"
    },
    "intent": {
      "type": "string",
      "enum": [
        "cash_flow",
        "invoice_status",
        "payment_reminder",
        "expense_analysis",
        "supplier_info",
        "credit_query",
        "general_help",
        "unknown"
      ],
      "description": "Detected user intent"
    },
    "action_taken": {
      "type": "string",
      "description": "Action triggered by the conversation (if any)"
    },
    "conversation_date": {
      "type": "string",
      "format": "date-time",
      "description": "When the conversation occurred"
    }
  },
  "required": [
    "user_input",
    "ai_response",
    "conversation_date"
  ]
};


