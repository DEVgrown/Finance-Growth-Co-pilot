export const SupplierSchema = {
  "name": "Supplier",
  "type": "object",
  "properties": {
    "supplier_name": {
      "type": "string",
      "description": "Supplier business name"
    },
    "contact_person": {
      "type": "string",
      "description": "Contact person name"
    },
    "phone_number": {
      "type": "string",
      "description": "Supplier phone number"
    },
    "email": {
      "type": "string",
      "description": "Supplier email"
    },
    "category": {
      "type": "string",
      "enum": [
        "inventory",
        "equipment",
        "services",
        "utilities",
        "other"
      ],
      "description": "Supplier category"
    },
    "payment_terms": {
      "type": "string",
      "description": "Payment terms (e.g., Net 30)"
    },
    "average_order_value": {
      "type": "number",
      "description": "Average order value"
    },
    "total_spent": {
      "type": "number",
      "description": "Total amount spent with supplier"
    },
    "reliability_score": {
      "type": "number",
      "description": "Supplier reliability score (1-10)"
    },
    "negotiation_notes": {
      "type": "string",
      "description": "AI negotiation insights and notes"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "inactive",
        "preferred"
      ],
      "default": "active",
      "description": "Supplier status"
    }
  },
  "required": [
    "supplier_name",
    "phone_number",
    "category"
  ]
};
