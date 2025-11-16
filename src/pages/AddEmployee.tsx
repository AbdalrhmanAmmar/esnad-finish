import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Save, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { createEmployee } from '@/api/Users';

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: string;
  teamProducts: string;
  teamArea: string;
  area: string[];
  city: string;
  district: string;
}

const AddEmployee: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    role: '',
    teamProducts: '',
    teamArea: '',
    area: [],
    city: '',
    district: ''
  });

  const roles = [
    { value: 'MEDICAL REP', label: 'مندوب طبي' },
    { value: 'SALES REP', label: 'مندوب مبيعات' },
    { value: 'SUPERVISOR', label: 'مشرف' },
    { value: 'MANAGER', label: 'مدير' },
    { value: 'TEAM_LEAD', label: 'قائد فريق' },
    { value: 'FINANCE', label: 'مالية' },
    { value: 'WAREHOUSE', label: 'مخزن' }
  ];

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAreaChange = (value: string) => {
    const areas = value.split(',').map(area => area.trim()).filter(area => area);
    setFormData(prev => ({
      ...prev,
      area: areas
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?._id) {
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على معرف المستخدم',
        variant: 'destructive'
      });
      return;
    }

    // التحقق من الحقول المطلوبة
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.password || !formData.role) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const employeeData = {
        ...formData,
        adminId: user._id
      };

      await createEmployee(employeeData);
      
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء الموظف بنجاح',
        variant: 'default'
      });

      // إعادة توجيه إلى صفحة إدارة الموظفين
      window.location.href = '/management/employees';
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إنشاء الموظف',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    window.location.href = '/employees-management';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button onClick={handleGoBack} variant="outline" size="sm">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">إضافة موظف جديد</h1>
            <p className="text-muted-foreground mt-1">إضافة موظف جديد إلى النظام</p>
          </div>
        </div>
        <User className="h-8 w-8 text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات الموظف</CardTitle>
          <CardDescription>
            يرجى ملء جميع البيانات المطلوبة لإنشاء حساب الموظف الجديد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* الاسم الأول والأخير */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">الاسم الأول *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="أدخل الاسم الأول"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">الاسم الأخير *</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="أدخل الاسم الأخير"
                  required
                />
              </div>
            </div>

            {/* اسم المستخدم وكلمة المرور */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم *</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
            </div>

            {/* الدور */}
            <div className="space-y-2">
              <Label htmlFor="role">الدور *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* منتجات الفريق ومنطقة الفريق */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* المناطق */}
            <div className="space-y-2">
              <Label htmlFor="area">المناطق</Label>
              <Textarea
                id="area"
                value={formData.area.join(', ')}
                onChange={(e) => handleAreaChange(e.target.value)}
                placeholder="أدخل المناطق مفصولة بفاصلة (مثال: القاهرة, الجيزة, الإسكندرية)"
                rows={3}
              />
            </div>

            {/* المدينة والحي */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="أدخل المدينة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">الحي</Label>
                <Input
                  id="district"
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="أدخل الحي"
                />
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="h-4 w-4 ml-2" />
                {loading ? 'جاري الحفظ...' : 'حفظ الموظف'}
              </Button>
              <Button type="button" variant="outline" onClick={handleGoBack} className="flex-1">
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEmployee;