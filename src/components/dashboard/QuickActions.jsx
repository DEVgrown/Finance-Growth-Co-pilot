import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Receipt, Upload } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link to={createPageUrl("Transactions")}>
        <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </Link>
      <Link to={createPageUrl("Invoices")}>
        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
          <Receipt className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </Link>
    </div>
  );
}
