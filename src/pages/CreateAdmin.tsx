import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createAdmin, CreateAdminData } from '@/api/Users';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';

const CreateAdmin = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAdminData>({
    firstName: '',
    lastName: '',
    username: '',
    password: ''
  });

  // التحقق من صلاحية المستخدم
  if (!user || user.role !== 'SYSTEM_ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.password) {
      toast({
        title: 'خطأ',
        description: 'جميع الحقول مطلوبة',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'خطأ',
        description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await createAdmin(formData);
      
      if (response.success) {
        toast({
          title: 'نجح',
          description: response.message,
          variant: 'default'
        });
        
        // إعادة تعيين النموذج
        setFormData({
          firstName: '',
          lastName: '',
          username: '',
          password: ''
        });
      } else {
        toast({
          title: 'خطأ',
          description: response.message,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">إنشاء أدمن جديد</CardTitle>
          <CardDescription className="text-center">
            إنشاء حساب أدمن جديد في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">الاسم الأول</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="أدخل الاسم الأول"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">الاسم الأخير</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="أدخل الاسم الأخير"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="أدخل اسم المستخدم"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء أدمن جديد'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdmin;