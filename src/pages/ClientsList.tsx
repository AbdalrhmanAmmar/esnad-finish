import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Stethoscope,
  Pill,
  Search,
  MapPin,
  Building2,
  User,
  Package,
  MessageSquare,
  Filter,
  RefreshCw,
  AlertCircle,
  Store
} from 'lucide-react';
import toast from 'react-hot-toast';


interface User {
  _id: string;
  username: string;
  teamArea: string;
  teamProducts: string;
}

interface Doctor {
  _id: string;
  drName: string;
  specialty: string;
  city: string;
  teamProducts: string;
  teamArea: string;
  organizationName: string;
}

interface Message {
  text: string;
  tag: string;
  lang: string;
}

interface Product {
  _id: string;
  CODE: string;
  BRAND: string;
  COMPANY: string;
  PRICE: number;
  PRODUCT: string;
  PRODUCT_TYPE: string;
  messages: Message[];
  teamProducts: string;
  createdAt: string;
  updatedAt: string;
}

interface Pharmacy {
  _id: string;
  customerSystemDescription: string;
  area: string;
  city: string;
  district: string;
}

interface ApiResponse {
  success: boolean;
  user: User;
  doctors: Doctor[];
  products: Product[];
  pharmacies: Pharmacy[];
}

const ClientsList: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('doctors');

  // استخدام ID المؤقت المحدد
  const userId = '68bc56c2b86e0e8507b2a0e9';

  const fetchUserResources = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/teamproducts/${userId}/resources`);
      const result = await response.json();
      
      setData(result);
      toast.success('تم تحميل البيانات بنجاح');
    } catch (error) {
      console.error('Error fetching user resources:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserResources();
  }, []);

  const filteredDoctors = data?.doctors.filter(doctor => {
    const matchesSearch = doctor.drName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || doctor.teamProducts === selectedTeam;
    return matchesSearch && matchesTeam;
  }) || [];

  const filteredProducts = data?.products.filter(product => {
    const matchesSearch = product.PRODUCT.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.BRAND.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.COMPANY.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || product.teamProducts === selectedTeam;
    return matchesSearch && matchesTeam;
  }) || [];

  const filteredPharmacies = (data?.pharmacies || []).filter((pharmacy) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pharmacy.customerSystemDescription?.toLowerCase().includes(searchLower) ||
      pharmacy.area?.toLowerCase().includes(searchLower) ||
      pharmacy.city?.toLowerCase().includes(searchLower) ||
      pharmacy.district?.toLowerCase().includes(searchLower)
    );
  });

  const getTeamColor = (team: string) => {
    switch (team) {
      case 'TEAM A': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'TEAM B': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'TEAM C': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-6 flex items-center justify-center" dir="rtl">
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">جاري تحميل البيانات...</h2>
            <p className="text-gray-600 dark:text-gray-300">يرجى الانتظار</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900 p-6 flex items-center justify-center" dir="rtl">
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">خطأ في تحميل البيانات</h2>
            <p className="text-gray-600 dark:text-gray-300">تعذر الوصول إلى البيانات</p>
            <Button onClick={fetchUserResources} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            قائمة العملاء
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            إدارة الأطباء والمنتجات المخصصة للفريق
          </p>
        </div>

        {/* User Info Card */}
        <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              معلومات المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">اسم المستخدم</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.user.username}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">منطقة الفريق</p>
                <Badge variant="outline" className="text-sm">{data.user.teamArea}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">فريق المنتجات</p>
                <Badge className={getTeamColor(data.user.teamProducts)}>{data.user.teamProducts}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter Section */}
        <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في الأطباء والمنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">جميع الفرق</option>
                  <option value="TEAM A">TEAM A</option>
                  <option value="TEAM B">TEAM B</option>
                  <option value="TEAM C">TEAM C</option>
                </select>
              </div>
              <Button onClick={fetchUserResources} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                تحديث
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              الأطباء ({filteredDoctors.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              المنتجات ({filteredProducts.length})
            </TabsTrigger>
            <TabsTrigger value="pharmacies" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              الصيدليات ({filteredPharmacies.length})
            </TabsTrigger>
          </TabsList>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-4">
            {filteredDoctors.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">لا توجد أطباء</h3>
                  <p className="text-gray-600 dark:text-gray-300">لم يتم العثور على أطباء مطابقين للبحث</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor._id} className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-blue-600" />
                          {doctor.drName}
                        </CardTitle>
                        <Badge className={getTeamColor(doctor.teamProducts)}>
                          {doctor.teamProducts}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {doctor.specialty}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Building2 className="w-4 h-4 text-green-600" />
                        <span>{doctor.organizationName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span>{doctor.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>{doctor.teamArea}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            {filteredProducts.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">لا توجد منتجات</h3>
                  <p className="text-gray-600 dark:text-gray-300">لم يتم العثور على منتجات مطابقة للبحث</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product._id} className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Pill className="w-5 h-5 text-green-600" />
                          {product.PRODUCT}
                        </CardTitle>
                        <Badge className={getTeamColor(product.teamProducts)}>
                          {product.teamProducts}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {product.BRAND} - {product.COMPANY}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">الكود:</span>
                        <Badge variant="outline">{product.CODE}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">السعر:</span>
                        <span className="font-semibold text-green-600">{product.PRICE} ج.م</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">النوع:</span>
                        <Badge variant="secondary">{product.PRODUCT_TYPE}</Badge>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          الرسائل ({product.messages.length})
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {product.messages.map((message, index) => (
                            <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                              <p className="text-xs font-medium text-blue-800 dark:text-blue-300">{message.tag}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{message.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pharmacies Tab */}
          <TabsContent value="pharmacies" className="space-y-4">
            {filteredPharmacies.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">لا توجد صيدليات</h3>
                  <p className="text-gray-600 dark:text-gray-300">لم يتم العثور على صيدليات مطابقة للبحث</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPharmacies.map((pharmacy) => (
                  <Card key={pharmacy._id} className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Store className="w-5 h-5 text-orange-600" />
                        {pharmacy.customerSystemDescription}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span>{pharmacy.area}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>{pharmacy.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{pharmacy.district}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientsList;