export const LoanApplicationSchema = {
  "name": "LoanApplication",
  "type": "object",
  "properties": {
    "loan_amount": {
      "type": "number",
      "description": "Requested loan amount"
    },
    "loan_purpose": {
      "type": "string",
      "enum": [
        "inventory",
        "equipment",
        "expansion",
        "working_capital",
        "emergency",
        "other"
      ],
      "description": "Purpose of loan"
    },
    "repayment_period": {
      "type": "number",
      "description": "Repayment period in months"
    },
    "monthly_payment": {
      "type": "number",
      "description": "Calculated monthly payment"
    },
    "eligibility_score": {
      "type": "number",
      "description": "AI-calculated eligibility score (0-100)"
    },
    "status": {
      "type": "string",
      "enum": [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "disbursed"
      ],
      "default": "draft",
      "description": "Application status"
    },
    "risk_assessment": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high"
      ],
      "description": "AI risk assessment"
    },
    "ai_recommendation": {
      "type": "string",
      "description": "AI recommendation and insights"
    },
    "supporting_data": {
      "type": "object",
      "properties": {
        "average_monthly_revenue": {
          "type": "number"
        },
        "average_monthly_expenses": {
          "type": "number"
        },
        "cash_flow_stability": {
          "type": "number"
        },
        "business_age_months": {
          "type": "number"
        }
      },
      "description": "Supporting financial data"
    },
    "application_date": {
      "type": "string",
      "format": "date",
      "description": "Date of application"
    }
  },
  "required": [
    "loan_amount",
    "loan_purpose",
    "repayment_period"
  ]
};


