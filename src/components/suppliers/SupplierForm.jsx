import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, Save } from "lucide-react";

const CATEGORIES = ["inventory", "equipment", "services", "utilities", "other"];
const STATUSES = ["active", "inactive", "preferred"];

export default function SupplierForm({ supplier, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(supplier || {
    supplier_name: "",
    contact_person: "",
    phone_number: "",
    email: "",
    category: "inventory",
    payment_terms: "",
    average_order_value: 0,
    total_spent: 0,
    reliability_score: 5,
    negotiation_notes: "",
    status: "active"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      average_order_value: parseFloat(formData.average_order_value) || 0,
      total_spent: parseFloat(formData.total_spent) || 0,
      reliability_score: parseInt(formData.reliability_score) || 5
    });
  };

  return (
    <Card className="border-none shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{supplier ? 'Edit Supplier' : 'New Supplier'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_name">Supplier Name *</Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                placeholder="e.g., Net 30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reliability_score">Reliability Score (1-10)</Label>
              <Input
                id="reliability_score"
                type="number"
                min="1"
                max="10"
                value={formData.reliability_score}
                onChange={(e) => setFormData({ ...formData, reliability_score: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="negotiation_notes">Negotiation Notes</Label>
            <Textarea
              id="negotiation_notes"
              value={formData.negotiation_notes}
              onChange={(e) => setFormData({ ...formData, negotiation_notes: e.target.value })}
              placeholder="AI insights and negotiation history..."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-orange-600 to-amber-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {supplier ? 'Update' : 'Add'} Supplier
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
