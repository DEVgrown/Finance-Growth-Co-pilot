import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Upload, CheckCircle, Clock } from "lucide-react";

export default function Register() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "retail",
    owner_name: "",
    email: "",
    phone_number: "",
    registration_number: "",
    tax_pin: "",
    location: "",
    monthly_revenue: ""
  });
  const [documents, setDocuments] = useState({
    registration_certificate: null,
    kra_pin_certificate: null,
    id_document: null
  });
  const [uploadedUrls, setUploadedUrls] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.BusinessRegistration.create(data);
    },
    onSuccess: () => {
      setSubmitted(true);
    }
  });

  const handleFileUpload = async (docType, file) => {
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrls(prev => ({ ...prev, [docType]: file_url }));
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await submitMutation.mutateAsync({
      ...formData,
      monthly_revenue: parseFloat(formData.monthly_revenue) || 0,
      registration_certificate_url: uploadedUrls.registration_certificate,
      kra_pin_certificate_url: uploadedUrls.kra_pin_certificate,
      id_document_url: uploadedUrls.id_document,
      status: "pending"
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-none shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-green-600 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 text-lg mb-6">
              Thank you for applying to FinanceGrowth Co-Pilot. Our team is reviewing your application and documents.
            </p>
            <Alert className="bg-blue-50 border-blue-200 text-left">
              <AlertDescription className="text-blue-800">
                <strong>What's Next?</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>We'll review your documents within 24-48 hours</li>
                  <li>You'll receive an email with your login credentials once approved</li>
                  <li>You can then access the full platform and start managing your finances</li>
                </ul>
              </AlertDescription>
            </Alert>
            <p className="text-sm text-gray-500 mt-6">
              Questions? Contact us at support@financegrowth.co.ke
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Register Your Business</h1>
          <p className="text-gray-600">Join FinanceGrowth Co-Pilot and transform your financial management</p>
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader>
            <CardTitle>Business Registration Application</CardTitle>
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-green-600' : 'bg-gray-200'}`} />
              <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
              <div className={`flex-1 h-2 rounded ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} />
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Business Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input
                        id="business_name"
                        value={formData.business_name}
                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                        required
                        placeholder="e.g., Mama Njeri Supplies"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_type">Business Type *</Label>
                      <Select
                        value={formData.business_type}
                        onValueChange={(value) => setFormData({ ...formData, business_type: value })}
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
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        placeholder="e.g., Nairobi, Westlands"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registration_number">Business Registration Number *</Label>
                      <Input
                        id="registration_number"
                        value={formData.registration_number}
                        onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                        required
                        placeholder="e.g., PVT-ABC123XYZ"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax_pin">KRA PIN *</Label>
                      <Input
                        id="tax_pin"
                        value={formData.tax_pin}
                        onChange={(e) => setFormData({ ...formData, tax_pin: e.target.value })}
                        required
                        placeholder="e.g., A001234567B"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="monthly_revenue">Estimated Monthly Revenue (KES) *</Label>
                      <Input
                        id="monthly_revenue"
                        type="number"
                        value={formData.monthly_revenue}
                        onChange={(e) => setFormData({ ...formData, monthly_revenue: e.target.value })}
                        required
                        placeholder="e.g., 500000"
                      />
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600"
                  >
                    Next: Owner Information
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Owner Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="owner_name">Full Name *</Label>
                      <Input
                        id="owner_name"
                        value={formData.owner_name}
                        onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                        required
                        placeholder="e.g., John Kamau Mwangi"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number *</Label>
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        required
                        placeholder="+254712345678"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setStep(3)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-teal-600"
                    >
                      Next: Documents
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Required Documents</h3>
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-800">
                      Please upload clear copies of the following documents (PDF, JPG, or PNG)
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="registration_certificate">Business Registration Certificate *</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="registration_certificate"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setDocuments({ ...documents, registration_certificate: file });
                              handleFileUpload('registration_certificate', file);
                            }
                          }}
                          required={!uploadedUrls.registration_certificate}
                        />
                        {uploadedUrls.registration_certificate && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="kra_pin_certificate">KRA PIN Certificate *</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="kra_pin_certificate"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setDocuments({ ...documents, kra_pin_certificate: file });
                              handleFileUpload('kra_pin_certificate', file);
                            }
                          }}
                          required={!uploadedUrls.kra_pin_certificate}
                        />
                        {uploadedUrls.kra_pin_certificate && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="id_document">National ID / Passport *</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="id_document"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setDocuments({ ...documents, id_document: file });
                              handleFileUpload('id_document', file);
                            }
                          }}
                          required={!uploadedUrls.id_document}
                        />
                        {uploadedUrls.id_document && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={submitMutation.isPending || isUploading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-teal-600"
                    >
                      {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
