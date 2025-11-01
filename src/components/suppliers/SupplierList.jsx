import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Star, Phone, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  preferred: "bg-yellow-100 text-yellow-800"
};

export default function SupplierList({ suppliers, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 mb-3" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>All Suppliers ({suppliers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900">{supplier.supplier_name}</h3>
                  {supplier.status === 'preferred' && (
                    <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                  )}
                  <Badge className={statusColors[supplier.status]}>
                    {supplier.status}
                  </Badge>
                </div>

                {supplier.contact_person && (
                  <p className="text-sm text-gray-600 mb-1">{supplier.contact_person}</p>
                )}

                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {supplier.phone_number}
                  </div>
                  {supplier.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {supplier.email}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">{supplier.category}</Badge>
                  {supplier.reliability_score && (
                    <span className="text-xs text-gray-500">
                      Reliability: {supplier.reliability_score}/10
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(supplier)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(supplier.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


