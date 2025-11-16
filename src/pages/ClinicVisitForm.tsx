import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Stethoscope,
  Building2,
  Pill,
  MessageSquare,
  Plus,
  Trash2,
  UserCheck,
  FileText,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  medicine: string;
  message: string;
}

interface VisitFormData {
  visitDate: string;
  doctorId: string;
  clinicId: string;
  products: Product[];
  withSupervisor: boolean;
  notes: string;
}

const ClinicVisitForm: React.FC = () => {
  const [formData, setFormData] = useState<VisitFormData>({
    visitDate: '',
    doctorId: '',
    clinicId: '',
    products: [{ id: '1', medicine: '', message: '' }],
    withSupervisor: false,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - في التطبيق الحقيقي ستأتي من API
  

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      medicine: '',
      message: ''
    };
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  };

  const removeProduct = (productId: string) => {
    if (formData.products.length > 1) {
      setFormData(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== productId)
      }));
    }
  };

  const updateProduct = (productId: string, field: 'medicine' | 'message', value: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === productId ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.visitDate || !formData.doctorId || !formData.clinicId) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      if (formData.products.some(p => !p.medicine || !p.message)) {
        toast.error('يرجى اختيار الدواء والرسالة لجميع المنتجات');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('تم تسجيل الزيارة بنجاح!');
      
      // Reset form
      setFormData({
        visitDate: '',
        doctorId: '',
        clinicId: '',
        products: [{ id: '1', medicine: '', message: '' }],
        withSupervisor: false,
        notes: ''
      });
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الزيارة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            تسجيل زيارة عيادة
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            قم بتسجيل تفاصيل زيارة العيادة مع المنتجات والعينات المقدمة
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              بيانات الزيارة
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              املأ جميع البيانات المطلوبة لتسجيل الزيارة
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="visitDate" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    تاريخ الزيارة
                  </Label>
                  <Input
                    id="visitDate"
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    اختر الطبيب
                  </Label>
                  <Select value={formData.doctorId} onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}>
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="اختر الطبيب" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div className="flex items-center gap-2">
                            <span>{doctor.name}</span>
                            <Badge variant="outline" className="text-xs">{doctor.specialty}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    اختر العيادة
                  </Label>
                  <Select value={formData.clinicId} onValueChange={(value) => setFormData(prev => ({ ...prev, clinicId: value }))}>
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="اختر العيادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          <div className="flex items-center gap-2">
                            <span>{clinic.name}</span>
                            <Badge variant="outline" className="text-xs">{clinic.location}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Products and Samples Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Pill className="w-5 h-5 text-green-600" />
                    المنتجات والعينات
                  </h3>
                  <Button
                    type="button"
                    onClick={addProduct}
                    variant="outline"
                    className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة منتج
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.products.map((product, index) => (
                    <Card key={product.id} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white">المنتج {index + 1}</h4>
                          {formData.products.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeProduct(product.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Pill className="w-4 h-4 text-green-600" />
                              اختر الدواء
                            </Label>
                            <Select 
                              value={product.medicine} 
                              onValueChange={(value) => updateProduct(product.id, 'medicine', value)}
                            >
                              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="اختر الدواء" />
                              </SelectTrigger>
                              <SelectContent>
                                {medicines.map((medicine) => (
                                  <SelectItem key={medicine.id} value={medicine.name}>
                                    <div className="flex items-center gap-2">
                                      <span>{medicine.name}</span>
                                      <Badge variant="outline" className="text-xs">{medicine.type}</Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-purple-600" />
                              اختر الرسالة
                            </Label>
                            <Select 
                              value={product.message} 
                              onValueChange={(value) => updateProduct(product.id, 'message', value)}
                            >
                              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="اختر الرسالة" />
                              </SelectTrigger>
                              <SelectContent>
                                {messages.map((message) => (
                                  <SelectItem key={message.id} value={message.title}>
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">{message.text}</span>
                                      <span className="text-xs text-gray-500">{message.content}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator className="my-8" />

              {/* Additional Information */}
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <Label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        هل الزيارة كانت بصحبة مشرف؟
                      </Label>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        فعّل هذا الخيار إذا كان هناك مشرف مرافق أثناء الزيارة
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.withSupervisor}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, withSupervisor: checked }))}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    ملاحظات
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="أضف أي ملاحظات إضافية حول الزيارة..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-h-[100px] resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الحفظ...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      حفظ الزيارة
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicVisitForm;