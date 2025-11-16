import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Building2, Calendar as CalendarIcon, Package, DollarSign, Image as ImageIcon, User, ClipboardList, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { getPharmacyCardById } from '@/api/PharmcayCard';

const statusBadge = (status?: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

interface OrderItem {
  _id?: string;
  quantity?: number;
  product?: {
    PRODUCT?: string;
    BRAND?: string;
    CODE?: string;
    PRICE?: number;
    name?: string;
    brand?: string;
    code?: string;
  };
  price?: number;
}

interface PharmacyCardData {
  _id?: string;
  visitDate?: string;
  createdAt?: string;
  FinalOrderStatusValue?: string;
  pharmacy?: {
    customerSystemDescription?: string;
    name?: string;
    city?: string;
    area?: string;
    district?: string;
  };
  orderDetails?: OrderItem[];
  visitDetails?: {
    notes?: string;
    visitImage?: string;
  };
  introductoryVisit?: boolean;
  draftDistribution?: boolean;
  hasOrder?: boolean;
  sequenceStatus?: string;
  orderStatus?: string;
  collectionDetails?: {
    amount?: number;
    receiptNumber?: string;
    collectionStatus?: string;
    receiptImage?: string;
  };
  hasCollection?: boolean;
  additionalNotes?: string;
  createdBy?: {
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    teamArea?: string;
    teamProducts?: string;
    area?: string[] | string;
  };
}

const PharmacyCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<PharmacyCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCard(id);
    }
  }, [id]);

  const fetchCard = async (cardId: string) => {
    try {
      setLoading(true);
      const res = await getPharmacyCardById(cardId);
      if (res.success) {
        console.log(res.data)
        setCard(res.data);
      } else {
        toast.error(res.message || 'فشل في جلب بيانات بطاقة الصيدلية');
      }
    } catch (err: any) {
      console.error('Error fetching pharmacy card:', err);
      toast.error(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const items = card?.orderDetails || [];
    const totalQty = items.reduce((sum: number, item: OrderItem) => sum + (item?.quantity || 0), 0);
    const totalVal = items.reduce((sum: number, item: OrderItem) => {
      const price = item?.product?.PRICE ?? item?.price ?? 0;
      return sum + price * (item?.quantity || 0);
    }, 0);
    return { totalQty, totalVal };
  }, [card]);

  if (loading) {
    return (
      <div className="container mx-auto p-6" style={{ direction: 'rtl' }}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل بيانات بطاقة الصيدلية...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container mx-auto p-6" style={{ direction: 'rtl' }}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <p className="text-destructive">لم يتم العثور على بيانات بطاقة الصيدلية</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const visitDate = card?.visitDate ? format(new Date(card.visitDate), 'yyyy-MM-dd', { locale: ar }) : '-';
  const createdAt = card?.createdAt ? format(new Date(card.createdAt), 'yyyy-MM-dd', { locale: ar }) : '-';

  return (
    <div className="container mx-auto p-6 space-y-6" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate(-1)} variant="outline" size="sm">
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">بطاقة الصيدلية</h1>
      </div>

      {/* Top overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الزيارة</p>
                <p className="font-bold text-blue-900 dark:text-blue-100">{visitDate}</p>
              </div>
              <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي قيمة الطلب</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{totals.totalVal.toFixed(0)}</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">دينار ليبي</p>
              </div>
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الكمية</p>
                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{totals.totalQty}</p>
              </div>
              <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 border-rose-200 dark:border-rose-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الحالة النهائية</p>
                <Badge className={statusBadge(card?.FinalOrderStatusValue)}>{card?.FinalOrderStatusValue || '-'}</Badge>
              </div>
              {card?.FinalOrderStatusValue === 'approved' ? (
                <CheckCircle2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pharmacy and meta info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            معلومات الصيدلية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">الاسم</p>
              <p className="font-medium">{card?.pharmacy?.customerSystemDescription || card?.pharmacy?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المدينة</p>
              <p className="font-medium flex items-center gap-1"><MapPin className="h-4 w-4" />{card?.pharmacy?.city || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المنطقة</p>
              <p className="font-medium">{card?.pharmacy?.area || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الحي</p>
              <p className="font-medium">{card?.pharmacy?.district || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
              <p className="font-medium">{createdAt}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رقم البطاقة</p>
              <p className="font-medium">{card?._id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="visit" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="visit">تفاصيل الزيارة</TabsTrigger>
          <TabsTrigger value="order">تفاصيل الطلب</TabsTrigger>
          <TabsTrigger value="collection">التحصيل المالي</TabsTrigger>
          <TabsTrigger value="summary">ملخص</TabsTrigger>
          <TabsTrigger value="createdBy">المنشئ</TabsTrigger>
        </TabsList>

        <TabsContent value="visit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" /> تفاصيل الزيارة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ملاحظات الزيارة</p>
                  <p className="font-medium">{card?.visitDetails?.notes || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">صورة الزيارة</p>
                  {card?.visitDetails?.visitImage ? (
                    <div className="relative rounded-lg overflow-hidden border">
                      <img src={card.visitDetails.visitImage} alt="صورة الزيارة" className="w-full h-64 object-cover" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground"><ImageIcon className="h-4 w-4" /> لا توجد صورة</div>
                  )}
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">زيارة تعريفية</p>
                  <Badge variant="outline">{card?.introductoryVisit ? 'نعم' : 'لا'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">توزيع مسودة</p>
                  <Badge variant="outline">{card?.draftDistribution ? 'نعم' : 'لا'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">يوجد طلب</p>
                  <Badge variant="outline">{card?.hasOrder ? 'نعم' : 'لا'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">حالة التسلسل</p>
                  <Badge variant="outline">{card?.sequenceStatus === 'correct' ? 'صحيح' : 'غير صحيح'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" /> تفاصيل الطلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              {card?.orderDetails?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 text-right">المنتج</th>
                        <th className="py-2 px-3 text-right">الماركة</th>
                        <th className="py-2 px-3 text-right">الكود</th>
                        <th className="py-2 px-3 text-right">السعر</th>
                        <th className="py-2 px-3 text-right">الكمية</th>
                        <th className="py-2 px-3 text-right">المجموع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {card.orderDetails.map((item: OrderItem) => {
                        const name = item?.product?.PRODUCT || item?.product?.name || '-';
                        const brand = item?.product?.BRAND || item?.product?.brand || '-';
                        const code = item?.product?.CODE || item?.product?.code || '-';
                        const price = item?.product?.PRICE ?? item?.price ?? 0;
                        const qty = item?.quantity || 0;
                        const total = price * qty;
                        return (
                          <tr key={item?._id || code} className="border-b">
                            <td className="py-2 px-3">{name}</td>
                            <td className="py-2 px-3">{brand}</td>
                            <td className="py-2 px-3">{code}</td>
                            <td className="py-2 px-3">{price}</td>
                            <td className="py-2 px-3">{qty}</td>
                            <td className="py-2 px-3 font-medium">{total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">لا توجد تفاصيل طلب</p>
              )}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <Badge className={statusBadge(card?.orderStatus)}>حالة الطلب: {card?.orderStatus || '-'}</Badge>
                  <Badge className={statusBadge(card?.FinalOrderStatusValue)}>الحالة النهائية: {card?.FinalOrderStatusValue || '-'}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">الإجمالي</p>
                  <p className="text-lg font-bold">{totals.totalVal.toFixed(0)} د.ل</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> التحصيل المالي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">مبلغ التحصيل</p>
                  <p className="text-xl font-bold">{card?.collectionDetails?.amount ?? 0} د.ل</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">رقم الإيصال</p>
                  <p className="font-medium">{card?.collectionDetails?.receiptNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">حالة التحصيل</p>
                  <Badge className={statusBadge(card?.collectionDetails?.collectionStatus)}>
                    {card?.collectionDetails?.collectionStatus || 'غير متوفر'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">صورة الإيصال</p>
                  {card?.collectionDetails?.receiptImage ? (
                    <div className="relative rounded-lg overflow-hidden border">
                      <img src={card.collectionDetails.receiptImage} alt="صورة الإيصال" className="w-full h-64 object-cover" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground"><ImageIcon className="h-4 w-4" /> لا توجد صورة</div>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">يوجد تحصيل؟</p>
                <Badge variant="outline">{card?.hasCollection ? 'نعم' : 'لا'}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>ملخص</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">عدد العناصر</p>
                <p className="text-xl font-bold">{card?.orderDetails?.length || 0}</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">إجمالي الكمية</p>
                <p className="text-xl font-bold">{totals.totalQty}</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">إجمالي القيمة</p>
                <p className="text-xl font-bold">{totals.totalVal.toFixed(0)} د.ل</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">ملاحظات إضافية</p>
                <p className="font-medium">{card?.additionalNotes || '-'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="createdBy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> معلومات المنشئ
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">اسم المستخدم</p>
                <p className="font-medium">{card?.createdBy?.username || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الاسم</p>
                <p className="font-medium">{card?.createdBy?.firstName || '-'} {card?.createdBy?.lastName || ''}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الدور</p>
                <Badge variant="outline">{card?.createdBy?.role || '-'}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">فريق المنطقة</p>
                <p className="font-medium">{card?.createdBy?.teamArea || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">فريق المنتجات</p>
                <p className="font-medium">{card?.createdBy?.teamProducts || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المناطق</p>
                <p className="font-medium">
                  {Array.isArray(card?.createdBy?.area) 
                    ? card.createdBy.area.join('، ') 
                    : card?.createdBy?.area || '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PharmacyCard;