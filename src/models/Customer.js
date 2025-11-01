export const CustomerSchema = {
  "name": "Customer",
  "type": "object",
  "properties": {
    "customer_name": {
      "type": "string",
      "description": "Customer full name or business name"
    },
    "email": {
      "type": "string",
      "description": "Customer email for login"
    },
    "phone_number": {
      "type": "string",
      "description": "Customer phone number"
    },
    "customer_type": {
      "type": "string",
      "enum": [
        "individual",
        "business"
      ],
      "description": "Type of customer"
    },
    "company_name": {
      "type": "string",
      "description": "Company name if business customer"
    },
    "physical_address": {
      "type": "string",
      "description": "Physical address"
    },
    "payment_terms": {
      "type": "string",
      "description": "Payment terms (e.g., Net 30)"
    },
    "total_invoiced": {
      "type": "number",
      "default": 0,
      "description": "Total amount invoiced to customer"
    },
    "total_paid": {
      "type": "number",
      "default": 0,
      "description": "Total amount paid by customer"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "inactive",
        "suspended"
      ],
      "default": "active",
      "description": "Customer status"
    },
    "onboarded_by": {
      "type": "string",
      "description": "Email of user who onboarded this customer"
    }
  },
  "required": [
    "customer_name",
    "email",
    "phone_number"
  ]
};


