import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Calendar, Package, User, FileText } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useMedicalRepStore } from "@/stores/medicalRepStore";
import { MedicalRepDoctor, MedicalRepProduct } from "@/api/MedicalRep";
import toast from "react-hot-toast";
import { createSampleRequest } from "@/api/SampleRequests";

interface SampleRequestData {
  requestDate: string;
  deliveryDate: string;
  medicationId: string;
  doctorId: string;
  quantity: number;
  notes: string;
}



export default function SampleRequestForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { doctors, products, fetchDoctors, fetchProducts } = useMedicalRepStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<SampleRequestData>({
    requestDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    medicationId: '',
    doctorId: '',
    quantity: 1,
    notes: ''
  });

  useEffect(() => {
    if (doctors.length === 0 || products.length === 0) {
      toast.error("يرجى زيارة صفحة 'بياناتي' أولاً لتحميل البيانات");
    }
  }, [doctors.length, products.length]);

  const handleInputChange = (field: keyof SampleRequestData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if data is loaded
    if (doctors.length === 0 || products.length === 0) {
      toast.error("يرجى زيارة صفحة 'بياناتي' أولاً لتحميل البيانات");
      return;
    }
    
    if (!formData.deliveryDate || !formData.medicationId || !formData.doctorId || formData.quantity < 1) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.deliveryDate.trim() === '' || formData.medicationId.trim() === '' || formData.doctorId.trim() === '') {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (new Date(formData.deliveryDate) <= new Date(formData.requestDate)) {
      toast.error('تاريخ التسليم يجب أن يكون بعد تاريخ الطلب');
      return;
    }

    setIsLoading(true);
    
    try {
      const requestData = {
        requestDate: formData.requestDate,
        deliveryDate: formData.deliveryDate,
        product: formData.medicationId,
        doctor: formData.doctorId,
        quantity: formData.quantity,
        notes: formData.notes
      };

      const result = await createSampleRequest(requestData);
      toast.success(`تم إنشاء طلب العينة برقم: ${result.id}`);
      navigate('/sample-requests'); // Navigate to requests list
    } catch (error: any) {
      console.error('Error submitting sample request:', error);
      toast.error(error.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if no data
  if (doctors.length === 0 && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-4">جاري تحميل البيانات...</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-3">لا يمكن إنشاء طلب عينة بدون تحميل بيانات الأطباء والمنتجات أولاً</p>
            <Button 
              onClick={() => navigate('/my-data')}
              className="w-full"
              variant="outline"
            >
              انتقل إلى صفحة بياناتي
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">بعد تحميل البيانات، يمكنك العودة لإنشاء طلب العينة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">نموذج طلب عينات</h1>
        </div>
        <p className="text-muted-foreground">قم بملء البيانات المطلوبة لطلب عينات الأدوية</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            بيانات الطلب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Request Date */}
              <div className="space-y-2">
                <Label htmlFor="requestDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  تاريخ الطلب
                </Label>
                <Input
                  id="requestDate"
                  type="date"
                  value={formData.requestDate}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Delivery Date */}
              <div className="space-y-2">
                <Label htmlFor="deliveryDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  تاريخ التسليم *
                </Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                  required
                />
              </div>

              {/* Medication */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  الدواء *
                </Label>
                <Select
                  value={formData.medicationId}
                  onValueChange={(value) => handleInputChange('medicationId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدواء" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.code} - {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  الطبيب *
                </Label>
                <Select
                  value={formData.doctorId}
                  onValueChange={(value) => handleInputChange('doctorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطبيب" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        <div className="flex flex-col text-right">
                          <span className="font-medium">{doctor.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {doctor.specialty} - {doctor.organizationName}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  الكمية *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                ملاحظات
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="أضف أي ملاحظات إضافية..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="px-8"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}