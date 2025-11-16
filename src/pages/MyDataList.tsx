import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useMedicalRepStore } from '@/stores/medicalRepStore';
import { 
  getMedicalRepData, 
  MedicalRepUser, 
  MedicalRepProduct, 
  MedicalRepDoctor, 
  MedicalRepStats 
} from '@/api/MedicalRep';
import { 
  User, 
  Package, 
  Stethoscope, 
  Search, 
  Phone, 
  MapPin, 
  Building, 
  Tag,
  DollarSign,
  Users,
  TrendingUp,
  Filter,
  RefreshCw
} from 'lucide-react';

const MyDataList: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { setData } = useMedicalRepStore();
  
  const [userData, setUserData] = useState<MedicalRepUser | null>(null);
  const [products, setProducts] = useState<MedicalRepProduct[]>([]);
  const [doctors, setDoctors] = useState<MedicalRepDoctor[]>([]);
  const [stats, setStats] = useState<MedicalRepStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [productSearch, setProductSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await getMedicalRepData(user._id);
      
      if (response.success) {
        setUserData(response.data.user);
        setProducts(response.data.products);
        setDoctors(response.data.doctors);
        setStats(response.data.stats);
        // حفظ البيانات في الـ store
        setData(response.data.doctors, response.data.products);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                         product.code.toLowerCase().includes(productSearch.toLowerCase());
    const matchesBrand = !selectedBrand || product.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                         doctor.organizationName.toLowerCase().includes(doctorSearch.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const uniqueBrands = [...new Set(products.map(p => p.brand))];
  const uniqueSpecialties = [...new Set(doctors.map(d => d.specialty))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">قائمة بياناتي</h1>
          <p className="text-muted-foreground mt-1">عرض شامل لبيانات المندوب الطبي</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          تحديث البيانات
        </Button>
      </div>

      {/* User Info Card */}
      {userData && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {userData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <p className="text-sm text-muted-foreground">@{userData.username}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">الدور</p>
                  <Badge variant="secondary">{userData.role}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">فريق المنتجات</p>
                  <Badge variant="outline">{userData.teamProducts}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">المنطقة</p>
                  <Badge variant="outline">{userData.teamArea}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  <Badge variant="default" className="bg-green-500">نشط</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الأطباء</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalDoctors}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">نوع الوصول</p>
                  <p className="text-lg font-semibold">
                    {stats.isAllProducts ? 'جميع المنتجات' : 'منتجات محددة'}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            المنتجات ({filteredProducts.length})
          </TabsTrigger>
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            الأطباء ({filteredDoctors.length})
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                قائمة المنتجات
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في المنتجات..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">جميع العلامات التجارية</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">كود: {product.code}</p>
                          </div>
                          <Badge variant="outline">{product.type}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">{product.price} د.ل</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            <span className="text-sm">{product.brand}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            <span className="text-sm">{product.company}</span>
                          </div>
                        </div>
                        
                        {/* رسائل المنتج */}
                        {product.messages && product.messages.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-primary">رسائل المنتج:</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {product.messages.map((message: any, index: number) => (
                                <div key={index} className="bg-muted/50 p-2 rounded text-xs">
                                  <div className="font-medium text-primary">{message.tag}</div>
                                  <div className="text-muted-foreground mt-1">{message.text}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t">
                          <Badge variant="secondary" className="text-xs">
                            {product.teamProducts}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد منتجات تطابق البحث</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                قائمة الأطباء
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في الأطباء..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">جميع التخصصات</option>
                  {uniqueSpecialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{doctor.name}</h3>
                            <Badge variant="outline">{doctor.specialty}</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span className="text-sm">{doctor.phone}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            <span className="text-sm">{doctor.organizationName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-sm">{doctor.city} - {doctor.area}</span>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <Badge variant="secondary" className="text-xs">
                            {doctor.teamArea}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredDoctors.length === 0 && (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا يوجد أطباء يطابقون البحث</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyDataList;