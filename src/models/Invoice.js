export const InvoiceSchema = {
  "name": "Invoice",
  "type": "object",
  "properties": {
    "invoice_number": {
      "type": "string",
      "description": "Unique invoice number"
    },
    "customer_name": {
      "type": "string",
      "description": "Customer name"
    },
    "customer_email": {
      "type": "string",
      "description": "Customer email"
    },
    "customer_phone": {
      "type": "string",
      "description": "Customer phone number"
    },
    "issue_date": {
      "type": "string",
      "format": "date",
      "description": "Invoice issue date"
    },
    "due_date": {
      "type": "string",
      "format": "date",
      "description": "Payment due date"
    },
    "items": {
      "type": "array",
      "description": "Invoice line items",
      "items": {
        "type": "object",
        "properties": {
          "description": {
            "type": "string"
          },
          "quantity": {
            "type": "number"
          },
          "unit_price": {
            "type": "number"
          },
          "total": {
            "type": "number"
          }
        }
      }
    },
    "subtotal": {
      "type": "number",
      "description": "Subtotal amount"
    },
    "tax": {
      "type": "number",
      "description": "Tax amount (VAT)"
    },
    "total_amount": {
      "type": "number",
      "description": "Total invoice amount"
    },
    "status": {
      "type": "string",
      "enum": [
        "draft",
        "sent",
        "paid",
        "overdue",
        "cancelled"
      ],
      "default": "draft",
      "description": "Invoice status"
    },
    "payment_method": {
      "type": "string",
      "enum": [
        "mpesa",
        "bank_transfer",
        "cash",
        "cheque"
      ],
      "description": "Payment method"
    },
    "paid_date": {
      "type": "string",
      "format": "date",
      "description": "Date payment was received"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes"
    },
    "etims_integrated": {
      "type": "boolean",
      "default": false,
      "description": "Whether invoice is synced with eTIMS"
    }
  },
  "required": [
    "customer_name",
    "issue_date",
    "due_date",
    "total_amount"
  ]
};
