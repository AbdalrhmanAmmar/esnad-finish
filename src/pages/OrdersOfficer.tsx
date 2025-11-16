import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getFinalOrders, FinalOrderData } from '@/api/OrdersOfficer';
import { 
  Package, 
  User, 
  Calendar, 
  MapPin, 
  Hash, 
  DollarSign, 
  Search,
  RefreshCw,
  FileText,
  ShoppingCart
} from 'lucide-react';

const OrdersOfficer: React.FC = () => {
  const [orders, setOrders] = useState<FinalOrderData[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<FinalOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getFinalOrders();
      setOrders(response.data);
      setFilteredOrders(response.data);
      toast({
        title: 'تم تحديث البيانات',
        description: `تم جلب ${response.count} طلب بنجاح`,
      });
    } catch (error) {
      toast({
        title: 'خطأ في جلب البيانات',
        description: 'حدث خطأ أثناء جلب الطلبات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order => 
      order.pharmacyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.salesRepName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' as const },
      approved: { label: 'مقبول', variant: 'default' as const },
      rejected: { label: 'مرفوض', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getFinalStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'في الانتظار', variant: 'outline' as const },
      completed: { label: 'مكتمل', variant: 'default' as const },
      cancelled: { label: 'ملغي', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateOrderTotal = (orderDetails: FinalOrderData['orderDetails']) => {
    return orderDetails.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalQuantity = (orderDetails: FinalOrderData['orderDetails']) => {
    return orderDetails.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">محصل الطلبيات</h1>
            <p className="text-muted-foreground">إدارة ومتابعة الطلبات النهائية</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في الطلبات (الصيدلية، المندوب، رقم الطلب)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{filteredOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">القيمة الإجمالية</p>
                <p className="text-2xl font-bold">
                  {filteredOrders.reduce((total, order) => total + calculateOrderTotal(order.orderDetails), 0).toLocaleString()} ج.م
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
              <p className="text-muted-foreground">لم يتم العثور على أي طلبات تطابق معايير البحث</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.orderId} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center space-x-2 space-x-reverse">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span>طلب رقم: {order.orderId}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(order.visitDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <User className="h-4 w-4" />
                        <span>{order.salesRepName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(order.orderStatus)}
                    {getFinalStatusBadge(order.FinalOrderStatusValue)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Pharmacy Info */}
                <div className="flex items-center space-x-2 space-x-reverse p-3 bg-muted/50 rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{order.pharmacyName}</span>
                </div>
                
                {/* Order Details */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2 space-x-reverse">
                    <Package className="h-4 w-4" />
                    <span>تفاصيل الطلب ({order.orderDetails.length} منتج)</span>
                  </h4>
                  
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {order.orderDetails.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-background border rounded">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">كود: {item.productCode}</p>
                          </div>
                          <div className="text-left space-y-1">
                            <p className="text-sm font-medium">الكمية: {item.quantity}</p>
                            <p className="text-xs text-muted-foreground">{item.price} ج.م × {item.quantity}</p>
                          </div>
                          <div className="text-left ml-4">
                            <p className="font-bold text-sm">{(item.price * item.quantity).toLocaleString()} ج.م</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                
                <Separator />
                
                {/* Order Summary */}
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center space-x-4 space-x-reverse text-sm">
                    <span>إجمالي الكمية: <strong>{getTotalQuantity(order.orderDetails)}</strong></span>
                    <span>عدد المنتجات: <strong>{order.orderDetails.length}</strong></span>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-primary">
                      {calculateOrderTotal(order.orderDetails).toLocaleString()} ج.م
                    </p>
                    <p className="text-xs text-muted-foreground">القيمة الإجمالية</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersOfficer;