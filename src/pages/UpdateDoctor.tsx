import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, UserCheck, Loader2 } from 'lucide-react';
import { updateDoctor, getDoctorById, AddDoctorData } from '@/api/Doctors';
import { useToast } from '@/hooks/use-toast';

interface DoctorFormData {
  drName: string;
  organizationType: string;
  organizationName: string;
  keyOpinionLeader: boolean;
  city: string;
  area: string;
  brand: string;
  specialty: string;
  subSpecialty: string;
  classification: string;
  potential: string;
  decileSegment: string;
  brickCode: string;
  brickName: string;
  address: string;
  phoneNumber: string;
  email: string;
  workingDays: string;
  workingHours: string;
  telNumber: string;
  profile: string;
  district: string;
  segment: string;
  targetFrequency: number;
  teamProducts: string;
  teamArea: string;
  notes: string;
}

const UpdateDoctor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState<DoctorFormData>({
    drName: '',
    organizationType: '',
    organizationName: '',
    keyOpinionLeader: false,
    city: '',
    area: '',
    brand: '',
    specialty: '',
    subSpecialty: '',
    classification: '',
    potential: '',
    decileSegment: '',
    brickCode: '',
    brickName: '',
    address: '',
    phoneNumber: '',
    email: '',
    workingDays: '',
    workingHours: '',
    telNumber: '',
    profile: '',
    district: '',
    segment: '',
    targetFrequency: 0,
    teamProducts: '',
    teamArea: '',
    notes: ''
  });

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!id) {
        toast({
          title: "خطأ",
          description: "معرف الطبيب غير صحيح",
          variant: "destructive"
        });
        navigate('/management/data/doctors');
        return;
      }

      try {
        setIsLoadingData(true);
        const doctorData = await getDoctorById(id);
        setFormData({
          drName: doctorData.drName || '',
          organizationType: doctorData.organizationType || '',
          organizationName: doctorData.organizationName || '',
          keyOpinionLeader: doctorData.keyOpinionLeader || false,
          city: doctorData.city || '',
          area: doctorData.area || '',
          brand: doctorData.brand || '',
          specialty: doctorData.specialty || '',
          subSpecialty: doctorData.subSpecialty || '',
          classification: doctorData.classification || '',
          potential: doctorData.potential || '',
          decileSegment: doctorData.decileSegment || '',
          brickCode: doctorData.brickCode || '',
          brickName: doctorData.brickName || '',
          address: doctorData.address || '',
          phoneNumber: doctorData.phoneNumber || '',
          email: doctorData.email || '',
          workingDays: doctorData.workingDays || '',
          workingHours: doctorData.workingHours || '',
          telNumber: doctorData.telNumber || '',
          profile: doctorData.profile || '',
          district: doctorData.district || '',
          segment: doctorData.segment || '',
          targetFrequency: doctorData.targetFrequency || 0,
          teamProducts: doctorData.teamProducts || '',
          teamArea: doctorData.teamArea || '',
          notes: doctorData.notes || ''
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل في جلب بيانات الطبيب",
          variant: "destructive"
        });
        navigate('/management/data/doctors');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDoctorData();
  }, [id, navigate, toast]);

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
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة (اسم الطبيب، المدينة، العلامة التجارية)",
        variant: "destructive"
      });
      return;
    }

    if (!id) {
      toast({
        title: "خطأ",
        description: "معرف الطبيب غير صحيح",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend: AddDoctorData = {
        drName: formData.drName.trim(),
        organizationType: formData.organizationType,
        organizationName: formData.organizationName.trim(),
        keyOpinionLeader: formData.keyOpinionLeader,
        city: formData.city.trim(),
        area: formData.area.trim(),
        brand: formData.brand.trim(),
        specialty: formData.specialty.trim(),
        subSpecialty: formData.subSpecialty.trim(),
        classification: formData.classification,
        potential: formData.potential,
        decileSegment: formData.decileSegment,
        brickCode: formData.brickCode.trim(),
        brickName: formData.brickName.trim(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        workingDays: formData.workingDays.trim(),
        workingHours: formData.workingHours.trim(),
        telNumber: formData.telNumber.trim(),
        profile: formData.profile.trim(),
        district: formData.district.trim(),
        segment: formData.segment.trim(),
        targetFrequency: formData.targetFrequency,
        teamProducts: formData.teamProducts.trim(),
        teamArea: formData.teamArea.trim(),
        notes: formData.notes.trim()
      };

      const result = await updateDoctor(id, dataToSend);
      
      if (result.success) {
        toast({
          title: "تم بنجاح",
          description: "تم تحديث بيانات الطبيب بنجاح"
        });
        navigate('/management/data/doctors');
      } else {
        toast({
          title: "خطأ",
          description: result.error || "حدث خطأ أثناء تحديث الطبيب",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الطبيب",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>جاري تحميل بيانات الطبيب...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/management/data/doctors')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">تحديث بيانات الطبيب</h1>
      </div>

      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            تحديث بيانات الطبيب
          </CardTitle>
          <CardDescription>
            يرجى تعديل البيانات المطلوبة وحفظ التغييرات
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
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  "حفظ التغييرات"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/management/data/doctors')}
                className="flex-1"
                disabled={isLoading}
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

export default UpdateDoctor;