export const CashFlowForecastSchema = {
  "name": "CashFlowForecast",
  "type": "object",
  "properties": {
    "forecast_period": {
      "type": "string",
      "enum": [
        "7_days",
        "30_days",
        "90_days"
      ],
      "description": "Forecast time period"
    },
    "predicted_income": {
      "type": "number",
      "description": "Predicted income for period"
    },
    "predicted_expenses": {
      "type": "number",
      "description": "Predicted expenses for period"
    },
    "net_cash_flow": {
      "type": "number",
      "description": "Net cash flow (income - expenses)"
    },
    "confidence_score": {
      "type": "number",
      "description": "AI confidence in forecast (0-100)"
    },
    "risk_level": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high"
      ],
      "description": "Cash flow risk assessment"
    },
    "recommendations": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "AI-generated recommendations"
    },
    "forecast_date": {
      "type": "string",
      "format": "date",
      "description": "Date forecast was generated"
    }
  },
  "required": [
    "forecast_period",
    "predicted_income",
    "predicted_expenses"
  ]
};
