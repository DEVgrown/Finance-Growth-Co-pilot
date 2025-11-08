import React, { useState } from "react";
import base44 from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: business } = useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      const businesses = await base44.entities.Business.list();
      return businesses[0];
    }
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.getCurrentUser()
  });

  const [businessData, setBusinessData] = useState({
    business_name: business?.business_name || "",
    business_type: business?.business_type || "retail",
    registration_number: business?.registration_number || "",
    tax_pin: business?.tax_pin || "",
    phone_number: business?.phone_number || "",
    mpesa_number: business?.mpesa_number || "",
    location: business?.location || "",
    monthly_revenue: business?.monthly_revenue || 0
  });

  React.useEffect(() => {
    if (business) {
      setBusinessData({
        business_name: business.business_name || "",
        business_type: business.business_type || "retail",
        registration_number: business.registration_number || "",
        tax_pin: business.tax_pin || "",
        phone_number: business.phone_number || "",
        mpesa_number: business.mpesa_number || "",
        location: business.location || "",
        monthly_revenue: business.monthly_revenue || 0
      });
    }
  }, [business]);

  const updateBusinessMutation = useMutation({
    mutationFn: async (data) => {
      if (business) {
        return base44.entities.Business.update(business.id, data);
      } else {
        return base44.entities.Business.create({ ...data, onboarding_completed: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateBusinessMutation.mutate({
      ...businessData,
      monthly_revenue: parseFloat(businessData.monthly_revenue) || 0
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your business profile and preferences</p>
      </div>

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={user?.full_name || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user?.role || ""} readOnly className="capitalize" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={businessData.business_name}
                  onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type *</Label>
                <Select
                  value={businessData.business_type}
                  onValueChange={(value) => setBusinessData({ ...businessData, business_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={businessData.registration_number}
                  onChange={(e) => setBusinessData({ ...businessData, registration_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_pin">KRA PIN</Label>
                <Input
                  id="tax_pin"
                  value={businessData.tax_pin}
                  onChange={(e) => setBusinessData({ ...businessData, tax_pin: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={businessData.phone_number}
                  onChange={(e) => setBusinessData({ ...businessData, phone_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpesa_number">M-Pesa Number</Label>
                <Input
                  id="mpesa_number"
                  value={businessData.mpesa_number}
                  onChange={(e) => setBusinessData({ ...businessData, mpesa_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={businessData.location}
                  onChange={(e) => setBusinessData({ ...businessData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_revenue">Average Monthly Revenue (KES)</Label>
                <Input
                  id="monthly_revenue"
                  type="number"
                  value={businessData.monthly_revenue}
                  onChange={(e) => setBusinessData({ ...businessData, monthly_revenue: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-teal-600"
                disabled={updateBusinessMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateBusinessMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
