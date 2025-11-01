export const AIInsightSchema = {
  "name": "AIInsight",
  "type": "object",
  "properties": {
    "insight_type": {
      "type": "string",
      "enum": [
        "cash_flow",
        "expense_optimization",
        "revenue_growth",
        "supplier_negotiation",
        "credit_improvement",
        "market_opportunity",
        "risk_alert"
      ],
      "description": "Type of insight"
    },
    "title": {
      "type": "string",
      "description": "Insight title"
    },
    "description": {
      "type": "string",
      "description": "Detailed insight description"
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high",
        "critical"
      ],
      "description": "Insight priority"
    },
    "action_items": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Recommended action items"
    },
    "potential_impact": {
      "type": "string",
      "description": "Expected financial impact"
    },
    "is_read": {
      "type": "boolean",
      "default": false,
      "description": "Whether user has read the insight"
    },
    "is_actioned": {
      "type": "boolean",
      "default": false,
      "description": "Whether user has acted on insight"
    }
  },
  "required": [
    "insight_type",
    "title",
    "description",
    "priority"
  ]
};


