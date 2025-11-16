import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import { Check, X, Edit3, Save, Loader2 } from 'lucide-react';
import { FinalOrderData, UpdateFinalOrderData, updateFinalOrder } from '../../api/OrdersCollection';
import { useToast } from '../../hooks/use-toast';

interface OrderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: FinalOrderData | null;
  onOrderUpdated: () => void;
}

export const OrderEditModal: React.FC<OrderEditModalProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (order) {
      const quantities: { [key: string]: number } = {};
      order.orderDetails.forEach(item => {
        quantities[item._id] = item.quantity;
      });
      setEditedQuantities(quantities);
    }
  }, [order]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      setEditedQuantities(prev => ({
        ...prev,
        [itemId]: newQuantity
      }));
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!order) return;

    setIsLoading(true);
    try {
      const updateData: UpdateFinalOrderData = {
        FinalOrderStatusValue: status
      };

      await updateFinalOrder(order.orderId, updateData);
      
      toast({
        title: "تم التحديث بنجاح",
        description: status === 'approved' ? "تم قبول الطلبية" : "تم رفض الطلبية",
        variant: "default"
      });

      onOrderUpdated();
      onClose();
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث حالة الطلبية",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!order) return;

    setIsLoading(true);
    try {
      const orderDetails = order.orderDetails.map(item => ({
        product: item.product,
        quantity: editedQuantities[item._id] || item.quantity
      }));

      const updateData: UpdateFinalOrderData = {
        orderDetails
      };

      await updateFinalOrder(order.orderId, updateData);
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث كميات المنتجات",
        variant: "default"
      });

      onOrderUpdated();
      onClose();
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث الكميات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!order) return 0;
    return order.orderDetails.reduce((total, item) => {
      const quantity = editedQuantities[item._id] || item.quantity;
      return total + (item.price * quantity);
    }, 0);
  };

  const hasChanges = () => {
    if (!order) return false;
    return order.orderDetails.some(item => 
      editedQuantities[item._id] !== item.quantity
    );
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right">
            تعديل الطلبية #{order.orderId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* معلومات الطلبية */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-semibold">اسم المندوب:</Label>
                <p>{order.salesRepName}</p>
              </div>
              <div>
                <Label className="font-semibold">اسم الصيدلية:</Label>
                <p>{order.pharmacyName}</p>
              </div>
              <div>
                <Label className="font-semibold">تاريخ الزيارة:</Label>
                <p>{new Date(order.visitDate).toLocaleDateString('ar-EG')}</p>
              </div>
              <div>
                <Label className="font-semibold">الحالة الحالية:</Label>
                <Badge 
                  variant={order.FinalOrderStatusValue === 'approved' ? 'default' : 
                          order.FinalOrderStatusValue === 'rejected' ? 'destructive' : 'secondary'}
                >
                  {order.FinalOrderStatusValue === 'approved' ? 'مقبولة' :
                   order.FinalOrderStatusValue === 'rejected' ? 'مرفوضة' : 'في الانتظار'}
                </Badge>
              </div>
            </div>
          </div>

          {/* أزرار القبول والرفض أو رسالة عدم قابلية التعديل */}
          {order.FinalOrderStatusValue === 'approved' || order.FinalOrderStatusValue === 'rejected' ? (
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-lg font-semibold text-muted-foreground">غير قابل للتعديل</p>
              <p className="text-sm text-muted-foreground mt-1">
                هذه الطلبية {order.FinalOrderStatusValue === 'approved' ? 'مقبولة' : 'مرفوضة'} ولا يمكن تعديلها
              </p>
            </div>
          ) : (
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => handleStatusUpdate('approved')}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Check className="w-4 h-4 ml-2" />}
                قبول الطلبية
              </Button>
              <Button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={isLoading}
                variant="destructive"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <X className="w-4 h-4 ml-2" />}
                رفض الطلبية
              </Button>
            </div>
          )}

          {/* تفاصيل المنتجات */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">تفاصيل المنتجات:</Label>
            <div className="space-y-3">
              {order.orderDetails.map((item) => (
                <div key={item._id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <Label className="font-medium">{item.productName}</Label>
                      <p className="text-sm text-muted-foreground">كود: {item.productCode}</p>
                    </div>
                    <div>
                      <Label className="text-sm">السعر:</Label>
                      <p className="font-medium">{item.price.toFixed(2)} د.ل</p>
                    </div>
                    <div>
                      <Label className="text-sm">الكمية:</Label>
                      {order.FinalOrderStatusValue === 'approved' || order.FinalOrderStatusValue === 'rejected' ? (
                        <p className="font-medium">{item.quantity}</p>
                      ) : (
                        <Input
                          type="number"
                          min="1"
                          value={editedQuantities[item._id] || item.quantity}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      )}
                    </div>
                    <div>
                      <Label className="text-sm">المجموع:</Label>
                      <p className="font-medium">
                        {((editedQuantities[item._id] || item.quantity) * item.price).toFixed(2)} د.ل
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* المجموع الكلي */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-bold">المجموع الكلي:</Label>
              <span className="text-xl font-bold text-primary">
                {calculateTotal().toFixed(2)} د.ل
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {order.FinalOrderStatusValue === 'approved' || order.FinalOrderStatusValue === 'rejected' ? 'إغلاق' : 'إلغاء'}
          </Button>
          {!(order.FinalOrderStatusValue === 'approved' || order.FinalOrderStatusValue === 'rejected') && (
            <Button 
              onClick={handleSaveChanges} 
              disabled={isLoading || !hasChanges()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
              حفظ التغييرات
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};