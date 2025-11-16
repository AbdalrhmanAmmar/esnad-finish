import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Building, Phone, User, Calendar, Package, TrendingUp, ShoppingCart, Activity, DollarSign, Clock } from 'lucide-react';
import { getDoctorComprehensiveData } from '@/api/Doctors';
import { DoctorComprehensiveData, ComprehensiveDoctorInfo, ComprehensiveVisit, ComprehensiveStatistics } from '@/api/DoctorDetails';
import { toast } from 'sonner';



const DoctorCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState<DoctorComprehensiveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDoctorData(id);
    }
  }, [id]);

  const fetchDoctorData = async (doctorId: string) => {
    try {
      setLoading(true);
      const response = await getDoctorComprehensiveData(doctorId);
      setDoctorData(response);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast.error('فشل في جلب بيانات الطبيب');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل بيانات الطبيب...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!doctorData || !doctorData.success) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">لم يتم العثور على بيانات الطبيب</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { doctor, visits, approvedProductRequests, approvedMarketingActivities, statistics } = doctorData.data;
  console.log(doctorData.data)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate(-1)} variant="outline" size="sm">
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">بطاقة الطبيب</h1>
      </div>

      {/* Doctor Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            معلومات الطبيب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">الاسم</p>
              <p className="font-medium">{doctor.name}</p>
            </div>
            {doctor.specialty && (
              <div>
                <p className="text-sm text-muted-foreground">التخصص</p>
                <p className="font-medium">{doctor.specialty}</p>
              </div>
            )}
            {doctor.organizationType && (
              <div>
                <p className="text-sm text-muted-foreground">نوع المؤسسة</p>
                <p className="font-medium">{doctor.organizationType}</p>
              </div>
            )}
            {doctor.organizationName && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">اسم المؤسسة</p>
                <p className="font-medium flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {doctor.organizationName}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">المدينة</p>
              <p className="font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {doctor.location?.city}
              </p>
            </div>
            {doctor.location?.area && (
              <div>
                <p className="text-sm text-muted-foreground">المنطقة</p>
                <p className="font-medium">{doctor.location.area}</p>
              </div>
            )}
            {doctor.location?.district && (
              <div>
                <p className="text-sm text-muted-foreground">الحي</p>
                <p className="font-medium">{doctor.location.district}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">العلامة التجارية</p>
              <Badge variant="secondary">{doctor.brand}</Badge>
            </div>
            {doctor.segment && (
              <div>
                <p className="text-sm text-muted-foreground">الشريحة</p>
                <Badge variant="outline">{doctor.segment}</Badge>
              </div>
            )}
            {doctor.telNumber && (
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {doctor.telNumber}
                </p>
              </div>
            )}
            {doctor.profile && (
              <div>
                <p className="text-sm text-muted-foreground">الملف الشخصي</p>
                <p className="font-medium">{doctor.profile}</p>
              </div>
            )}
            {doctor.targetFrequency && (
              <div>
                <p className="text-sm text-muted-foreground">تكرار الزيارة المستهدف</p>
                <p className="font-medium">{doctor.targetFrequency}</p>
              </div>
            )}
            {doctor.teamProducts && (
              <div>
                <p className="text-sm text-muted-foreground">فريق المنتجات</p>
                <p className="font-medium">{doctor.teamProducts}</p>
              </div>
            )}
            {doctor.teamArea && (
              <div>
                <p className="text-sm text-muted-foreground">فريق المنطقة</p>
                <p className="font-medium">{doctor.teamArea}</p>
              </div>
            )}
            {doctor.keyOpinionLeader !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">قائد رأي رئيسي</p>
                <Badge variant={doctor.keyOpinionLeader ? "default" : "secondary"}>
                  {doctor.keyOpinionLeader ? "نعم" : "لا"}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الزيارات</p>
                <p className="text-2xl font-bold text-primary">{statistics.totalVisits}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العينات</p>
                <p className="text-2xl font-bold text-green-600">{statistics.totalSamples}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المنتجات الفريدة</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.uniqueProducts}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الزيارات الأخيرة</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.recentVisits}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="visits" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visits" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            تاريخ الزيارات
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            طلبات المنتجات
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            الأنشطة التسويقية
          </TabsTrigger>
        </TabsList>

        {/* Visits Tab */}
        <TabsContent value="visits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                تاريخ الزيارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visits.length > 0 ? (
                <div className="space-y-4">
                  {visits.slice(0, 10).map((visit) => (
                    <div key={visit._id} className="border rounded-lg p-4 space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-800 dark:text-blue-200">
                            {new Date(visit.visitDate).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              calendar: 'gregory'
                            })}
                          </span>
                          {visit.visitTime && (
                            <span className="text-sm text-muted-foreground">
                              - {visit.visitTime}
                            </span>
                          )}
                        </div>
                        <Badge variant={visit.visitStatus === 'completed' ? 'default' : 'secondary'}>
                          {visit.visitStatus === 'completed' ? 'مكتملة' : visit.visitStatus}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">المندوب الطبي:</p>
                            <p className="font-medium">{visit.medicalRep.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {visit.visitType}
                          </Badge>
                        </div>
                      </div>

                      {visit.products && visit.products.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-2">المنتجات والرسائل:</p>
                          <div className="space-y-2">
                            {visit.products.map((product, index) => (
                              <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-sm">{product.productName}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    كود: {product.productCode}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                                  <div>
                                    <span className="font-medium">الكمية:</span> {product.samplesCount}
                                  </div>
                                  <div>
                                    <span className="font-medium">العلامة:</span> {product.brand}
                                  </div>
                                  <div>
                                    <span className="font-medium">السعر:</span> {product.price} د.ل
                                  </div>
                                </div>
                                {product.messages && product.messages.length > 0 && (
                                  <div className="mt-2 pt-2 border-t">
                                    <p className="text-xs text-muted-foreground mb-1">الرسالة المستخدمة:</p>
                                    {product.messages.map((message, msgIndex) => (
                                      message.tag === `رسالة المنتج${product.messageId}` && (
                                        <p key={msgIndex} className="text-xs bg-blue-50 dark:bg-blue-950/30 p-2 rounded text-blue-800 dark:text-blue-200">
                                          {message.text}
                                        </p>
                                      )
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {visit.notes && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">ملاحظات:</p>
                          <p className="text-sm">{visit.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {visits.length > 10 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        عرض 10 من أصل {visits.length} زيارة
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد زيارات مسجلة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Requests Tab */}
        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                طلبات المنتجات المعتمدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvedProductRequests.length > 0 ? (
                <div className="space-y-4">
                  {approvedProductRequests.slice(0, 5).map((request) => (
                    <div key={request.requestId} className="border rounded-lg p-4 space-y-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-800 dark:text-green-200">
                            {request.product.name}
                          </span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                          {request.status === 'approved' ? 'معتمد' : request.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">تاريخ الطلب:</p>
                            <p className="font-medium">
                              {new Date(request.requestDate).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                calendar: 'gregory'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">الكمية:</p>
                            <p className="font-medium">{request.quantity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">المندوب:</p>
                            <p className="font-medium">{request.medicalRep.name}</p>
                          </div>
                        </div>
                      </div>

                      {request.deliveryDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">تاريخ التسليم:</p>
                            <p className="font-medium">
                              {new Date(request.deliveryDate).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                calendar: 'gregory'
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            كود: {request.product.code}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {request.product.brand}
                          </Badge>
                        </div>
                      </div>

                      {request.notes && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">ملاحظات:</p>
                          <p className="text-sm">{request.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {approvedProductRequests.length > 5 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        عرض 5 من أصل {approvedProductRequests.length} طلب
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد طلبات منتجات معتمدة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing Activities Tab */}
        <TabsContent value="marketing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                الأنشطة التسويقية المعتمدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvedMarketingActivities.length > 0 ? (
                <div className="space-y-4">
                  {approvedMarketingActivities.slice(0, 5).map((activity) => (
                    <div key={activity.activityId} className="border rounded-lg p-4 space-y-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold text-purple-800 dark:text-purple-200">
                            نشاط تسويقي
                          </span>
                        </div>
                        <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                          {activity.status === 'approved' ? 'معتمد' : activity.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">التكلفة:</p>
                            <p className="font-medium">{activity.cost} د.ل</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">المنشئ:</p>
                            <p className="font-medium">{activity.createdBy.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">تاريخ النشاط:</p>
                            <p className="font-medium">
                              {new Date(activity.activityDate).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                calendar: 'gregory'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">تاريخ الطلب:</p>
                          <p className="font-medium">
                            {new Date(activity.requestDate).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              calendar: 'gregory'
                            })}
                          </p>
                        </div>
                      </div>

                      {activity.notes && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">ملاحظات:</p>
                          <p className="text-sm">{activity.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {approvedMarketingActivities.length > 5 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        عرض 5 من أصل {approvedMarketingActivities.length} نشاط
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد أنشطة تسويقية معتمدة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorCard;