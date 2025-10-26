export const ProactiveAlertSchema = {
  "name": "ProactiveAlert",
  "type": "object",
  "properties": {
    "alert_type": {
      "type": "string",
      "enum": [
        "overdue_invoice",
        "negative_cash_flow",
        "high_expense_category",
        "upcoming_payment",
        "low_credit_score",
        "supplier_issue"
      ],
      "description": "Type of alert"
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high",
        "critical"
      ],
      "description": "Alert priority level"
    },
    "title": {
      "type": "string",
      "description": "Alert title"
    },
    "message": {
      "type": "string",
      "description": "Detailed alert message"
    },
    "suggested_action": {
      "type": "string",
      "description": "AI-recommended action to resolve the issue"
    },
    "affected_entities": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "IDs of affected invoices, transactions, etc."
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "resolved",
        "dismissed"
      ],
      "default": "active",
      "description": "Alert status"
    },
    "resolved_date": {
      "type": "string",
      "format": "date-time",
      "description": "When the alert was resolved"
    }
  },
  "required": [
    "alert_type",
    "priority",
    "title",
    "message"
  ]
};
