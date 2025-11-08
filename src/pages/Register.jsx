import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Upload, CheckCircle, Clock, Loader2, ArrowRight, ArrowLeft, Mail } from "lucide-react";

export default function Register() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "retail",
    owner_name: "",
    email: "",
    phone_number: "",
    registration_number: "",
    tax_pin: "",
    location: "",
    monthly_revenue: "",
    registration_certificate_url: "",
    kra_pin_certificate_url: "",
    id_document_url: ""
  });

  const handleFileUpload = async (field, file) => {
    if (!file) return;
    
    try {
      setError("");
      // Upload file to backend and get URL
      const response = await apiClient.uploadDocument(file);
      setFormData({ ...formData, [field]: response.url });
    } catch (err) {
      setError(`Failed to upload ${field}: ${err.message}`);
      console.error('File upload error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiClient.registerBusiness({
        ...formData,
        monthly_revenue: parseFloat(formData.monthly_revenue) || 0
      });
      
      setRegistrationData(response);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit registration. Please check all fields and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-none shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 text-lg mb-6">
              Thank you for applying to FinanceGrowth Co-Pilot. Our team is reviewing your application and documents.
            </p>
            <Alert className="bg-blue-50 border-blue-200 text-left mb-6">
              <AlertDescription className="text-blue-800">
                <strong>What's Next?</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>We'll review your documents within 24-48 hours</li>
                  <li>You'll receive an email with your login credentials once approved</li>
                  <li>You can check your status using your email: <strong>{formData.email}</strong></li>
                  <li>Once approved, you can access the full platform and start managing your finances</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Go to Login
              </Button>
              <Button 
                onClick={() => navigate(`/registration-status/${encodeURIComponent(formData.email)}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Check Status
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Questions? Contact us at support@financegrowth.co.ke
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 p-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Register Your Business</h1>
          <p className="text-gray-600 text-lg">Join FinanceGrowth Co-Pilot and transform your financial management</p>
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Business Registration Application</CardTitle>
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex-1 h-2 rounded ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>
            <p className="text-sm text-gray-500 mt-2">Step {step} of 3</p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Business Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input
                        id="business_name"
                        value={formData.business_name}
                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                        required
                        placeholder="e.g., Mama Njeri Supplies"
                        className="border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_type">Business Type *</Label>
                      <Select
                        value={formData.business_type}
                        onValueChange={(value) => setFormData({ ...formData, business_type: value })}
                      >
                        <SelectTrigger className="border-gray-300">
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
                        className="border-gray-300"
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
                        className="border-gray-300"
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
                        className="border-gray-300"
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
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next: Owner Information <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Owner Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="owner_name">Full Name *</Label>
                      <Input
                        id="owner_name"
                        value={formData.owner_name}
                        onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                        required
                        placeholder="e.g., John Kamau Mwangi"
                        className="border-gray-300"
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
                        className="border-gray-300"
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
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 border-gray-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setStep(3)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Next: Documents <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Required Documents</h3>
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-800">
                      Please upload clear copies of the following documents (PDF, JPG, or PNG)
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    {[
                      { key: 'registration_certificate_url', label: 'Business Registration Certificate *', field: 'registration_certificate_url' },
                      { key: 'kra_pin_certificate_url', label: 'KRA PIN Certificate *', field: 'kra_pin_certificate_url' },
                      { key: 'id_document_url', label: 'National ID / Passport *', field: 'id_document_url' }
                    ].map((doc) => (
                      <div key={doc.key} className="space-y-2">
                        <Label htmlFor={doc.key}>{doc.label}</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id={doc.key}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleFileUpload(doc.field, file);
                              }
                            }}
                            required={!formData[doc.field]}
                            className="border-gray-300"
                          />
                          {formData[doc.field] && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 border-gray-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application <CheckCircle className="w-4 h-4 ml-2" />
                        </>
                      )}
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
