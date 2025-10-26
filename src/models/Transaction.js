export const TransactionSchema = {
  "name": "Transaction",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": [
        "income",
        "expense"
      ],
      "description": "Transaction type"
    },
    "amount": {
      "type": "number",
      "description": "Transaction amount in KES"
    },
    "category": {
      "type": "string",
      "enum": [
        "sales",
        "services",
        "inventory",
        "rent",
        "utilities",
        "salaries",
        "supplies",
        "marketing",
        "transport",
        "equipment",
        "taxes",
        "loan_repayment",
        "other"
      ],
      "description": "Transaction category"
    },
    "description": {
      "type": "string",
      "description": "Transaction description"
    },
    "transaction_date": {
      "type": "string",
      "format": "date",
      "description": "Date of transaction"
    },
    "source": {
      "type": "string",
      "enum": [
        "mpesa",
        "bank",
        "cash",
        "invoice",
        "manual"
      ],
      "description": "Source of transaction data"
    },
    "reference_number": {
      "type": "string",
      "description": "Transaction reference/receipt number"
    },
    "party_name": {
      "type": "string",
      "description": "Customer or supplier name"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes"
    }
  },
  "required": [
    "type",
    "amount",
    "category",
    "transaction_date"
  ]
};
