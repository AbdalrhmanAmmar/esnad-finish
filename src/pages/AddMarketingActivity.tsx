import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Activity } from 'lucide-react';
import { createMarketingActivity } from '@/api/MarketingActivities';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface MarketingActivityForm {
  english: string;
  arabic: string;
  isActive: boolean;
}

const AddMarketingActivity: React.FC = () => {
  const [formData, setFormData] = useState<MarketingActivityForm>({
    english: '',
    arabic: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof MarketingActivityForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.english.trim() || !formData.arabic.trim()) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await createMarketingActivity(formData);
      
      if (response.success) {
        toast({
          title: 'تم الإنشاء بنجاح',
          description: 'تم إنشاء النشاط التسويقي بنجاح',
          variant: 'default'
        });
        navigate('/management/marketing-activities');
      } else {
        toast({
          title: 'خطأ في الإنشاء',
          description: response.message || 'حدث خطأ أثناء إنشاء النشاط التسويقي',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'خطأ في الإنشاء',
        description: error.message || 'حدث خطأ أثناء إنشاء النشاط التسويقي',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/management/marketing-activities');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">إضافة نشاط تسويقي جديد</h1>
            <p className="text-muted-foreground">إنشاء نشاط تسويقي جديد في النظام</p>
          </div>
        </div>
        <Button onClick={handleGoBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات النشاط التسويقي</CardTitle>
          <CardDescription>
            املأ البيانات التالية لإنشاء نشاط تسويقي جديد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="english">الاسم الإنجليزي *</Label>
                <Input
                  id="english"
                  type="text"
                  placeholder="أدخل الاسم الإنجليزي للنشاط التسويقي"
                  value={formData.english}
                  onChange={(e) => handleInputChange('english', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="arabic">الاسم العربي *</Label>
                <Input
                  id="arabic"
                  type="text"
                  placeholder="أدخل الاسم العربي للنشاط التسويقي"
                  value={formData.arabic}
                  onChange={(e) => handleInputChange('arabic', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">نشط</Label>
              <span className="text-sm text-muted-foreground">
                {formData.isActive ? 'النشاط مفعل' : 'النشاط غير مفعل'}
              </span>
            </div>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse">
              <Button type="button" variant="outline" onClick={handleGoBack}>
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 ml-2" />
                {loading ? 'جاري الحفظ...' : 'حفظ النشاط'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMarketingActivity;