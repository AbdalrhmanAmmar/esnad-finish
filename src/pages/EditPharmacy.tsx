import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Pencil, Loader2 } from 'lucide-react';
import { getPharmacyById, updatePharmacy, AddPharmacyData } from '@/api/Pharmacies';
import toast from 'react-hot-toast';

const EditPharmacy = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState<AddPharmacyData>({
    customerSystemDescription: '',
    area: '',
    city: '',
    district: ''
  });

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
        if (!id) return;
        const res = await getPharmacyById(id);
        if (res?.success && res?.data) {
          const p = res.data;
          setFormData({
            customerSystemDescription: p.customerSystemDescription || '',
            area: p.area || '',
            city: p.city || '',
            district: p.district || ''
          });
        }
      } catch (error: any) {
        console.error('Error loading pharmacy:', error);
        toast.error(error.message || 'حدث خطأ أثناء تحميل بيانات الصيدلية');
      } finally {
        setIsFetching(false);
      }
    };
    fetchPharmacy();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!formData.customerSystemDescription || !formData.area || !formData.city || !formData.district) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setIsLoading(true);
    try {
      await updatePharmacy(id, {
        customerSystemDescription: formData.customerSystemDescription,
        area: formData.area,
        city: formData.city,
        district: formData.district
      });
      toast.success('تم تعديل بيانات الصيدلية بنجاح');
      navigate('/management/data/pharmacies');
    } catch (error: any) {
      console.error('Error updating pharmacy:', error);
      toast.error(error.message || 'حدث خطأ أثناء تعديل الصيدلية');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl" style={{ direction: 'rtl' }}>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/management/data/pharmacies')}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة إلى إدارة الصيدليات
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Pencil className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">تعديل بيانات الصيدلية</h1>
            <p className="text-muted-foreground">قم بتحديث بيانات الصيدلية المطلوبة</p>
          </div>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-xl text-foreground">بيانات الصيدلية</CardTitle>
          <CardDescription className="text-muted-foreground">
            عدل الحقول أدناه ثم احفظ التغييرات
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customerSystemDescription" className="text-sm font-medium text-foreground">
                    اسم الصيدلية *
                  </Label>
                  <Input
                    id="customerSystemDescription"
                    name="customerSystemDescription"
                    type="text"
                    value={formData.customerSystemDescription}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم الصيدلية"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-foreground">
                    المدينة *
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم المدينة"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="text-sm font-medium text-foreground">
                    المنطقة *
                  </Label>
                  <Input
                    id="area"
                    name="area"
                    type="text"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم المنطقة"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-medium text-foreground">
                    الحي *
                  </Label>
                  <Input
                    id="district"
                    name="district"
                    type="text"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم الحي"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Pencil className="ml-2 h-4 w-4" />
                      حفظ التعديلات
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/management/data/pharmacies')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPharmacy;
