export const BusinessRegistrationSchema = {
  "name": "BusinessRegistration",
  "type": "object",
  "properties": {
    "business_name": {
      "type": "string",
      "description": "Name of the business applying"
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
    "owner_name": {
      "type": "string",
      "description": "Business owner full name"
    },
    "email": {
      "type": "string",
      "description": "Business email"
    },
    "phone_number": {
      "type": "string",
      "description": "Business phone number"
    },
    "registration_number": {
      "type": "string",
      "description": "Business registration number"
    },
    "tax_pin": {
      "type": "string",
      "description": "KRA PIN"
    },
    "location": {
      "type": "string",
      "description": "Business location"
    },
    "monthly_revenue": {
      "type": "number",
      "description": "Estimated monthly revenue"
    },
    "registration_certificate_url": {
      "type": "string",
      "description": "Uploaded registration certificate"
    },
    "kra_pin_certificate_url": {
      "type": "string",
      "description": "Uploaded KRA PIN certificate"
    },
    "id_document_url": {
      "type": "string",
      "description": "Uploaded ID document"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "approved",
        "rejected"
      ],
      "default": "pending",
      "description": "Application status"
    },
    "rejection_reason": {
      "type": "string",
      "description": "Reason for rejection if applicable"
    },
    "reviewed_by": {
      "type": "string",
      "description": "Admin who reviewed the application"
    },
    "reviewed_date": {
      "type": "string",
      "format": "date-time",
      "description": "When the application was reviewed"
    }
  },
  "required": [
    "business_name",
    "business_type",
    "owner_name",
    "email",
    "phone_number"
  ]
};
