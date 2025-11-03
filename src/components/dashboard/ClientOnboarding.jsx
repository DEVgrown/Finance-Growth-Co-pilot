import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, X } from "lucide-react";

export default function ClientOnboarding({ onClose }) {
  const [formData, setFormData] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    customer_type: "individual",
    company_name: "",
    physical_address: "",
    payment_terms: "Net 30"
  });
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Backend sets owner, business and onboarded_by server-side
      return await base44.entities.Customer.create({
        ...data,
        status: "active"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onClose();
    },
    onError: (e) => {
      const message = e?.message || 'Failed to create client.';
      setError(message);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    await createMutation.mutateAsync(formData);
  };

  return (
    <Card className="border-none shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Onboard New Client
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customer_name">Client Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
                placeholder="John Doe or Company Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="client@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
                placeholder="+254..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_type">Customer Type *</Label>
              <Select
                value={formData.customer_type}
                onValueChange={(value) => setFormData({ ...formData, customer_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                placeholder="Net 30"
              />
            </div>

            {formData.customer_type === 'business' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="physical_address">Physical Address</Label>
              <Input
                id="physical_address"
                value={formData.physical_address}
                onChange={(e) => setFormData({ ...formData, physical_address: e.target.value })}
                placeholder="Street, City, Country"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              {createMutation.isPending ? "Creating..." : "Onboard Client"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
