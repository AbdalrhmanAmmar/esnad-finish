import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, User, MapPin, Package, FileText, TrendingUp, Activity, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { searchByProductCode, ProductSearchResponse } from '@/api/product-automation';



const ProductDetailsView: React.FC = () => {
  const [productCode, setProductCode] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!productCode.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await searchByProductCode(productCode);
      setSearchResults(results);
    } catch (error: any) {
      console.error('خطأ في البحث:', error);
      // يمكن إضافة toast notification هنا لإظهار الخطأ للمستخدم
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample data - in real app this would come from props or API
  const sampleProductData: ProductSearchResponse = {
    success: true,
    message: "تم العثور على 8 نتيجة للمنتج: AQUAX DEO CREAM",
    data: {
      productInfo: {
        id: "68bf3764b86e0e8507b2c8d3",
        name: "AQUAX DEO CREAM",
        code: "70",
        category: "P"
      },
      visitDoctorForms: [
        {
          visitId: "68c8e6ab8a0938f98189d916",
          visitDate: "2025-09-17T04:24:58.000Z",
          medicalRep: { name: "ibtihal tobruk" },
          doctor: {
            name: "إيمان محمد",
            specialty: "ممارس جلديه",
            brand: "مجموعة ACNE",
            city: "طبرق",
            area: "طبرق"
          },
          product: {
            name: "AQUAX DEO CREAM",
            samplesCount: 45,
            messageId: "1"
          },
          notes: "",
          status: "pending"
        },
        {
          visitId: "68c749bda71c80ad39292727",
          visitDate: "2025-09-15T23:02:46.000Z",
          medicalRep: { name: "aya bergaey" },
          doctor: {
            name: "عائشه عيساوي",
            specialty: "ممارس جلديه",
            brand: "مجموعة ACNE",
            city: "طرابلس الجنوب",
            area: "أبوسليم"
          },
          product: {
            name: "AQUAX DEO CREAM",
            samplesCount: 10,
            messageId: "0"
          },
          notes: "",
          status: "pending"
        }
      ],
      simpleFormRequests: [
        {
          requestId: "68c113980d6bd8ed1ea6b6bc",
          requestDate: "2025-09-10T09:00:00.000Z",
          deliveryDate: "2025-09-15T09:00:00.000Z",
          medicalRep: { name: "mohammed -east east" },
          doctor: {
            name: "عادل جاب الله",
            specialty: "ممارس جلديه",
            city: "البيضا",
            area: "البيضا"
          },
          product: {
            name: "AQUAX DEO CREAM",
            quantity: 20
          },
          status: "مرفوض",
          notes: "مطلوب تسليم سريع للدكتور"
        }
      ],
      pharmacyVisitRequests: [
        {
          requestId: "68cbdfa6fa998dfaf5976113",
          visitDate: "2025-09-17T00:00:00.000Z",
          medicalRep: { name: "hussein shuaib" },
          pharmacy: {
            name: "صيدلية هشام",
            city: "طرابلس الجنوب",
            area: "أبوسليم"
          },
          product: {
            name: "AQUAX DEO CREAM",
            quantity: 1
          },
          orderStatus: "مقبول",
          finalOrderStatus: "مقبول نهائياً",
          hasCollection: false,
          collectionAmount: 0,
          notes: ""
        },
        {
          requestId: "68cbfc3e303b70dbd90a343a",
          visitDate: "2025-09-17T00:00:00.000Z",
          medicalRep: { name: "moaz alsheikh" },
          pharmacy: {
            name: "صيدلية لين",
            city: "طرابلس الجنوب",
            area: "صلاح الدين"
          },
          product: {
            name: "AQUAX DEO CREAM",
            quantity: 3
          },
          orderStatus: "مقبول",
          finalOrderStatus: "مرفوض نهائياً",
          hasCollection: false,
          collectionAmount: 0,
          notes: ""
        },
        {
          requestId: "68cc20703e6145177c50268e",
          visitDate: "2025-09-17T00:00:00.000Z",
          medicalRep: { name: "moaz alsheikh" },
          pharmacy: {
            name: "صيدلية زاره",
            city: "طرايلس الشرق",
            area: "عين زارة"
          },
          product: {
            name: "AQUAX DEO CREAM",
            quantity: 100
          },
          orderStatus: "في الانتظار",
          finalOrderStatus: "غير محدد",
          hasCollection: false,
          collectionAmount: 0,
          notes: ""
        },
        {
          requestId: "68c7485fa71c80ad392926d7",
          visitDate: "2025-09-15T00:00:00.000Z",
          medicalRep: { name: "hussein shuaib" },
          pharmacy: {
            name: "صيدلية رويال",
            city: "طرابلس الجنوب",
            area: "أبوسليم"
          },
          product: {
            name: "AQUAX DEO CREAM",
            quantity: 7
          },
          orderStatus: "مقبول",
          finalOrderStatus: "مقبول نهائياً",
          hasCollection: false,
          collectionAmount: 0,
          notes: "test"
        },
        {
          requestId: "68c75457a71c80ad3929283b",
          visitDate: "2025-09-13T00:00:00.000Z",
          medicalRep: { name: "cash cash" },
          pharmacy: {
            name: "صيدلية المشارق",
            city: "مصراته",
            area: "مصراته - وليد"
          },
          product: {
            name: "AQUAX DEO CREAM",
            quantity: 5
          },
          orderStatus: "مقبول",
          finalOrderStatus: "مقبول نهائياً",
          hasCollection: false,
          collectionAmount: 0,
          notes: ""
        }
      ],
      summary: {
        totalDoctorVisits: 2,
        totalSimpleRequests: 1,
        totalPharmacyRequests: 5,
        totalSamples: 55,
        totalQuantityRequested: 136
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مقبول نهائياً':
      case 'مقبول':
        return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white';
      case 'مرفوض نهائياً':
      case 'مرفوض':
        return 'bg-gradient-to-r from-red-500 to-rose-600 text-white';
      case 'في الانتظار':
      case 'pending':
        return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
      case 'غير محدد':
        return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ar });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Search Section */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Search className="w-6 h-6" />
              البحث عن المنتج
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">كود المنتج</label>
                <Input
                  type="text"
                  placeholder="أدخل كود المنتج..."
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={!productCode.trim() || isLoading}
                className="px-8 py-2 h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {isLoading ? 'جاري البحث...' : 'بحث'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {searchResults && (
          <>
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-xl border border-white/20">
            <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {searchResults.data.productInfo.name}
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {searchResults.message}
          </p>
        </div>

        {/* Product Info Card */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Activity className="w-6 h-6" />
              معلومات المنتج
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{searchResults.data.productInfo.code}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">كود المنتج</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{searchResults.data.productInfo.category}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">الفئة</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{searchResults.data.productInfo.id.slice(-6)}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">معرف المنتج</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: 'زيارات الأطباء', value: searchResults.data.summary.totalDoctorVisits, icon: User, color: 'from-blue-500 to-cyan-600' },
            { label: 'طلبات العينات', value: searchResults.data.summary.totalSimpleRequests, icon: FileText, color: 'from-green-500 to-emerald-600' },
            { label: 'طلبات الصيدليات', value: searchResults.data.summary.totalPharmacyRequests, icon: MapPin, color: 'from-purple-500 to-violet-600' },
            { label: 'إجمالي العينات', value: searchResults.data.summary.totalSamples, icon: Package, color: 'from-orange-500 to-red-600' },
            { label: 'الكمية المطلوبة', value: searchResults.data.summary.totalQuantityRequested, icon: TrendingUp, color: 'from-pink-500 to-rose-600' }
          ].map((stat, index) => (
            <Card key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} mb-4 shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Doctor Visits */}
        {searchResults.data.visitDoctorForms.length > 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <User className="w-6 h-6" />
                زيارات الأطباء ({searchResults.data.visitDoctorForms.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6">
                {searchResults.data.visitDoctorForms.map((visit, index) => (
                  <div key={visit.visitId} className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-blue-200 dark:border-slate-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-slate-800 dark:text-white">{formatDate(visit.visitDate)}</span>
                      </div>
                      <Badge className={getStatusColor(visit.status)}>
                        {visit.status === 'pending' ? 'في الانتظار' : visit.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">معلومات الطبيب</h4>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          <div><strong>الاسم:</strong> {visit.doctor.name}</div>
                          <div><strong>التخصص:</strong> {visit.doctor.specialty}</div>
                          <div><strong>العلامة التجارية:</strong> {visit.doctor.brand}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">الموقع</h4>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          <div><strong>المدينة:</strong> {visit.doctor.city}</div>
                          <div><strong>المنطقة:</strong> {visit.doctor.area}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">تفاصيل الزيارة</h4>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          <div><strong>المندوب:</strong> {visit.medicalRep.name}</div>
                          <div><strong>عدد العينات:</strong> {visit.product.samplesCount}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simple Requests */}
        {searchResults.data.simpleFormRequests.length > 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <FileText className="w-6 h-6" />
                طلبات العينات ({searchResults.data.simpleFormRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6">
                {searchResults.data.simpleFormRequests.map((request, index) => (
                  <div key={request.requestId} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-green-200 dark:border-slate-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-slate-800 dark:text-white">{formatDate(request.requestDate)}</span>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">معلومات الطبيب</h4>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          <div><strong>الاسم:</strong> {request.doctor.name}</div>
                          <div><strong>التخصص:</strong> {request.doctor.specialty}</div>
                          <div><strong>المدينة:</strong> {request.doctor.city}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">تفاصيل الطلب</h4>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          <div><strong>المندوب:</strong> {request.medicalRep.name}</div>
                          <div><strong>الكمية:</strong> {request.product.quantity}</div>
                          <div><strong>تاريخ التسليم:</strong> {formatDate(request.deliveryDate)}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">ملاحظات</h4>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {request.notes || 'لا توجد ملاحظات'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pharmacy Requests */}
        {searchResults.data.pharmacyVisitRequests.length > 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <MapPin className="w-6 h-6" />
                طلبات الصيدليات ({searchResults.data.pharmacyVisitRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6">
                {searchResults.data.pharmacyVisitRequests.map((request, index) => (
                  <div key={request.requestId} className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-purple-200 dark:border-slate-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-semibold text-slate-800 dark:text-white">{formatDate(request.visitDate)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(request.orderStatus)}>
                          {request.orderStatus}
                        </Badge>
                        <Badge className={getStatusColor(request.finalOrderStatus)}>
                          {request.finalOrderStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">معلومات الصيدلية</h4>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          <div><strong>الاسم:</strong> {request.pharmacy.name}</div>
                          <div><strong>المدينة:</strong> {request.pharmacy.city}</div>
                          <div><strong>المنطقة:</strong> {request.pharmacy.area}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">تفاصيل الطلب</h4>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          <div><strong>المندوب:</strong> {request.medicalRep.name}</div>
                          <div><strong>الكمية:</strong> {request.product.quantity}</div>
                          <div><strong>مبلغ التحصيل:</strong> {request.collectionAmount} د.ل</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">ملاحظات</h4>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {request.notes || 'لا توجد ملاحظات'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        </>
        )}

        {!searchResults && (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-600">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">ابحث عن منتج</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center">أدخل كود المنتج في الحقل أعلاه لعرض التفاصيل والإحصائيات</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsView;