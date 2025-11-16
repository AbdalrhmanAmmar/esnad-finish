import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Package, MapPin, Building2, User, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { getSalesRepResources, SalesRepResourcesResponse } from '@/api/salesClients';

const SalesClients = () => {
  const [data, setData] = useState<SalesRepResourcesResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        const response = await getSalesRepResources(user._id);
        setData(response.data);
      } catch (error: any) {
        toast({
          title: 'خطأ',
          description: error.message || 'فشل في جلب البيانات',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id, toast]);

  const filteredProducts = data?.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredPharmacies = data?.pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.city.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">لا توجد بيانات متاحة</h2>
          <p className="text-muted-foreground">تعذر تحميل بيانات عملاء المبيعات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">عملاء المبيعات</h1>
          <p className="text-muted-foreground mt-1">
            مرحباً {data.user.name} - {data.user.role}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{data.user.area}</span>
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">منتج متاح</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الصيدليات</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalPharmacies}</div>
            <p className="text-xs text-muted-foreground">صيدلية في منطقتك</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التغطية</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.totalPharmacies > 0 ? Math.round((data.stats.totalProducts / data.stats.totalPharmacies) * 100) / 100 : 0}
            </div>
            <p className="text-xs text-muted-foreground">منتج لكل صيدلية</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث في المنتجات والصيدليات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">المنتجات ({filteredProducts.length})</TabsTrigger>
          <TabsTrigger value="pharmacies">الصيدليات ({filteredPharmacies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge variant="outline">{product.code}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">السعر:</span>
                    <span className="font-semibold">{product.price} د.ل</span>
                  </div>
                  {product.brand && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">العلامة التجارية:</span>
                      <span className="text-sm">{product.brand}</span>
                    </div>
                  )}
                  {product.company && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">الشركة:</span>
                      <span className="text-sm">{product.company}</span>
                    </div>
                  )}
                  {product.messages.length > 0 && (
                    <Badge variant="secondary" className="w-full justify-center">
                      {product.messages.length} رسالة
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">لم يتم العثور على منتجات تطابق البحث</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pharmacies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPharmacies.map((pharmacy) => (
              <Card key={pharmacy._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>{pharmacy.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{pharmacy.area}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">المدينة:</span>
                    <span className="text-sm">{pharmacy.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">المنطقة:</span>
                    <span className="text-sm">{pharmacy.district}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredPharmacies.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد صيدليات</h3>
              <p className="text-muted-foreground">لم يتم العثور على صيدليات تطابق البحث</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesClients;