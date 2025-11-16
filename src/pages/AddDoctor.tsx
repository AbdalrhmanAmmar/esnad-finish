import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createDoctor } from '@/api/Doctors';

interface DoctorFormData {
  drName: string;
  organizationType: string;
  organizationName: string;
  specialty: string;
  telNumber: string;
  profile: string;
  district: string;
  city: string;
  area: string;
  brand: string;
  segment: string;
  targetFrequency: number;
  keyOpinionLeader: boolean;
  teamProducts: string;
  teamArea: string;
}

const AddDoctor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<DoctorFormData>({
    drName: '',
    organizationType: '',
    organizationName: '',
    specialty: '',
    telNumber: '',
    profile: '',
    district: '',
    city: '',
    area: '',
    brand: '',
    segment: '',
    targetFrequency: 0,
    keyOpinionLeader: false,
    teamProducts: '',
    teamArea: ''
  });

  const handleInputChange = (field: keyof DoctorFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من الحقول المطلوبة
    if (!formData.drName || !formData.city || !formData.brand) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة (اسم الطبيب، المدينة، العلامة التجارية)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await createDoctor(formData);
      
      if (result.success) {
        toast({
          title: "تم بنجاح",
          description: result.message || "تم إضافة الطبيب بنجاح",
          variant: "default"
        });
        
        // العودة إلى صفحة إدارة الأطباء
        navigate('/management/data/doctors');
      } else {
        toast({
          title: "خطأ",
          description: result.error || "فشل في إضافة الطبيب",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/management/data/doctors');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">إضافة طبيب جديد</h1>
      </div>

      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            بيانات الطبيب
          </CardTitle>
          <CardDescription>
            يرجى ملء جميع البيانات المطلوبة لإضافة طبيب جديد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="drName">اسم الطبيب *</Label>
                <Input
                  id="drName"
                  type="text"
                  value={formData.drName}
                  onChange={(e) => handleInputChange('drName', e.target.value)}
                  placeholder="أدخل اسم الطبيب"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organizationType">نوع المؤسسة</Label>
                <Input
                  id="organizationType"
                  type="text"
                  value={formData.organizationType}
                  onChange={(e) => handleInputChange('organizationType', e.target.value)}
                  placeholder="أدخل نوع المؤسسة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organizationName">اسم المؤسسة</Label>
                <Input
                  id="organizationName"
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  placeholder="أدخل اسم المؤسسة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialty">التخصص</Label>
                <Input
                  id="specialty"
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  placeholder="أدخل التخصص"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telNumber">رقم الهاتف</Label>
                <Input
                  id="telNumber"
                  type="tel"
                  value={formData.telNumber}
                  onChange={(e) => handleInputChange('telNumber', e.target.value)}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profile">الملف الشخصي</Label>
                <Input
                  id="profile"
                  type="text"
                  value={formData.profile}
                  onChange={(e) => handleInputChange('profile', e.target.value)}
                  placeholder="أدخل الملف الشخصي"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="district">المنطقة</Label>
                <Input
                  id="district"
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="أدخل المنطقة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">المدينة *</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="أدخل المدينة"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="area">المنطقة الفرعية</Label>
                <Input
                  id="area"
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="أدخل المنطقة الفرعية"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand">العلامة التجارية *</Label>
                <Input
                  id="brand"
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="أدخل العلامة التجارية"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="segment">الشريحة</Label>
                <Input
                  id="segment"
                  type="text"
                  value={formData.segment}
                  onChange={(e) => handleInputChange('segment', e.target.value)}
                  placeholder="أدخل الشريحة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetFrequency">التكرار المستهدف</Label>
                <Input
                  id="targetFrequency"
                  type="number"
                  min="0"
                  value={formData.targetFrequency}
                  onChange={(e) => handleInputChange('targetFrequency', parseInt(e.target.value) || 0)}
                  placeholder="أدخل التكرار المستهدف"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teamProducts">منتجات الفريق</Label>
                <Input
                  id="teamProducts"
                  type="text"
                  value={formData.teamProducts}
                  onChange={(e) => handleInputChange('teamProducts', e.target.value)}
                  placeholder="أدخل منتجات الفريق"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teamArea">منطقة الفريق</Label>
                <Input
                  id="teamArea"
                  type="text"
                  value={formData.teamArea}
                  onChange={(e) => handleInputChange('teamArea', e.target.value)}
                  placeholder="أدخل منطقة الفريق"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="keyOpinionLeader"
                checked={formData.keyOpinionLeader}
                onCheckedChange={(checked) => handleInputChange('keyOpinionLeader', checked as boolean)}
              />
              <Label htmlFor="keyOpinionLeader">قائد رأي رئيسي</Label>
            </div>
            
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "جاري الإضافة..." : "إضافة الطبيب"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDoctor;