export const BusinessSchema = {
  "name": "Business",
  "type": "object",
  "properties": {
    "business_name": {
      "type": "string",
      "description": "Name of the business"
    },
    "business_type": {
      "type": "string",
      "enum": [
        "retail",
        "wholesale",
        "service",
        "manufacturing",
        "agriculture",
        "technology",
        "other"
      ],
      "description": "Type of business"
    },
    "registration_number": {
      "type": "string",
      "description": "Business registration number"
    },
    "tax_pin": {
      "type": "string",
      "description": "KRA PIN number"
    },
    "phone_number": {
      "type": "string",
      "description": "Business contact number"
    },
    "mpesa_number": {
      "type": "string",
      "description": "M-Pesa business number"
    },
    "location": {
      "type": "string",
      "description": "Business location"
    },
    "monthly_revenue": {
      "type": "number",
      "description": "Average monthly revenue"
    },
    "credit_score": {
      "type": "number",
      "description": "AI-calculated credit score (0-100)"
    },
    "onboarding_completed": {
      "type": "boolean",
      "default": false,
      "description": "Whether business setup is complete"
    }
  },
  "required": [
    "business_name",
    "business_type"
  ]
};
