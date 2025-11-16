import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import toast from 'react-hot-toast';
import { addProduct, AddProductData } from '@/api/Products';
import { ArrowRight, Package, Save, X } from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddProductData>({
    CODE: '',
    PRODUCT: '',
    PRODUCT_TYPE: '',
    BRAND: '',
    TEAM: '',
    teamProducts: '',
    COMPANY: '',
    messages: ['', '', ''] // الرسائل الثلاث
  });

  const handleInputChange = (field: keyof AddProductData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMessageChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      messages: prev.messages?.map((msg, i) => i === index ? value : msg) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.CODE || !formData.PRODUCT) {
      toast.error('كود المنتج واسم المنتج مطلوبان');
      return;
    }

    setLoading(true);
    
    // Show loading toast
    const loadingToast = toast.loading('جاري إضافة المنتج...');
    
    try {
      // تحويل الرسائل إلى التنسيق الصحيح
      const dataToSend = {
        ...formData,
        messages: formData.messages?.filter(msg => msg.trim() !== '').map(msg => ({
          text: msg,
          lang: 'ar' // يمكن تحديد اللغة حسب المحتوى لاحقاً
        })) || []
      };
      
      const result = await addProduct(dataToSend);
      
      if (result.success) {
        toast.success(result.message || 'تم إضافة المنتج بنجاح', {
          id: loadingToast,
        });
        
        // Navigate immediately after success
        navigate('/management/data/products');
      } else {
        toast.error(result.error || 'حدث خطأ أثناء إضافة المنتج', {
          id: loadingToast,
        });
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع', {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>إدارة البيانات</span>
          <ArrowRight className="h-4 w-4" />
          <span>إدارة المنتجات</span>
          <ArrowRight className="h-4 w-4" />
          <span>إضافة منتج جديد</span>
        </div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          إضافة منتج جديد
        </h1>
        <p className="text-muted-foreground mt-2">
          أدخل بيانات المنتج الجديد في النموذج أدناه
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات المنتج</CardTitle>
          <CardDescription>
            جميع الحقول المطلوبة مميزة بعلامة (*)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* كود المنتج */}
              <div className="space-y-2">
                <Label htmlFor="code" className="text-right">
                  كود المنتج *
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="أدخل كود المنتج"
                  value={formData.CODE}
                  onChange={(e) => handleInputChange('CODE', e.target.value)}
                  className="text-right"
                  required
                />
              </div>

              {/* اسم المنتج */}
              <div className="space-y-2">
                <Label htmlFor="product" className="text-right">
                  اسم المنتج *
                </Label>
                <Input
                  id="product"
                  type="text"
                  placeholder="أدخل اسم المنتج"
                  value={formData.PRODUCT}
                  onChange={(e) => handleInputChange('PRODUCT', e.target.value)}
                  className="text-right"
                  required
                />
              </div>

              {/* نوع المنتج */}
              <div className="space-y-2">
                <Label htmlFor="productType" className="text-right">
                  نوع المنتج
                </Label>
                <Input
                  id="productType"
                  type="text"
                  placeholder="أدخل نوع المنتج"
                  value={formData.PRODUCT_TYPE}
                  onChange={(e) => handleInputChange('PRODUCT_TYPE', e.target.value)}
                  className="text-right"
                />
              </div>

              {/* العلامة التجارية */}
              <div className="space-y-2">
                <Label htmlFor="brand" className="text-right">
                  العلامة التجارية
                </Label>
                <Input
                  id="brand"
                  type="text"
                  placeholder="أدخل العلامة التجارية"
                  value={formData.BRAND}
                  onChange={(e) => handleInputChange('BRAND', e.target.value)}
                  className="text-right"
                />
              </div>

              {/* الشركة */}
              <div className="space-y-2">
                <Label htmlFor="company" className="text-right">
                  الشركة
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="أدخل اسم الشركة"
                  value={formData.COMPANY}
                  onChange={(e) => handleInputChange('COMPANY', e.target.value)}
                  className="text-right"
                />
              </div>

              {/* الفريق */}
              <div className="space-y-2">
                <Label htmlFor="team" className="text-right">
                  الفريق
                </Label>
                <Input
                  id="team"
                  type="text"
                  placeholder="أدخل اسم الفريق"
                  value={formData.TEAM}
                  onChange={(e) => handleInputChange('TEAM', e.target.value)}
                  className="text-right"
                />
              </div>

              {/* فريق المنتجات */}
              <div className="space-y-2">
                <Label htmlFor="teamProducts" className="text-right">
                  فريق المنتجات
                </Label>
                <Input
                  id="teamProducts"
                  type="text"
                  placeholder="أدخل فريق المنتجات"
                  value={formData.teamProducts}
                  onChange={(e) => handleInputChange('teamProducts', e.target.value)}
                  className="text-right"
                />
              </div>
            </div>

            {/* الرسائل */}
            <div className="space-y-4">
              <Label className="text-right text-lg font-semibold">رسائل المنتج</Label>
              <div className="grid grid-cols-1 gap-4">
                {formData.messages?.map((message, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`message-${index}`} className="text-right">
                      الرسالة {index + 1}
                    </Label>
                    <Textarea
                      id={`message-${index}`}
                      placeholder={`أدخل الرسالة ${index + 1}`}
                      value={message}
                      onChange={(e) => handleMessageChange(index, e.target.value)}
                      className="text-right min-h-[80px]"
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/management/data/products')}
                disabled={loading}
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    جاري الحفظ...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ المنتج
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;