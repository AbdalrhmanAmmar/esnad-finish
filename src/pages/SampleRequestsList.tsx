import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { getSampleRequests, SampleRequest } from '@/api/SampleRequests';
import { Loader2, Plus, Eye, Calendar, Package, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SampleRequestsList: React.FC = () => {
  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSampleRequests();
  }, []);

  const loadSampleRequests = async () => {
    try {
      setIsLoading(true);
      
      const result = await getSampleRequests();
      if (result.success && result.data) {
        setRequests(result.data);
      }
    } catch (error: any) {
      console.error('Error loading sample requests:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحميل طلبات العينات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' as const },
      approved: { label: 'موافق عليه', variant: 'default' as const },
      rejected: { label: 'مرفوض', variant: 'destructive' as const },
      delivered: { label: 'تم التسليم', variant: 'default' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>جاري تحميل طلبات العينات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">طلبات العينات</h1>
          <p className="text-muted-foreground mt-2">إدارة ومتابعة طلبات العينات الخاصة بك</p>
        </div>
        <Button onClick={() => navigate('/sample-request-form')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          طلب عينة جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            قائمة الطلبات
          </CardTitle>
          <CardDescription>
            إجمالي الطلبات: {requests.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد طلبات عينات</h3>
              <p className="text-muted-foreground mb-4">لم تقم بإنشاء أي طلبات عينات بعد</p>
              <Button onClick={() => navigate('/sample-request-form')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إنشاء طلب جديد
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تاريخ الطلب</TableHead>
                    <TableHead>تاريخ التسليم</TableHead>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الطبيب</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(request.requestDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(request.deliveryDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {typeof request.product === 'object' ? 
                            `${request.product.code} - ${request.product.name}` : 
                            request.product
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {typeof request.doctor === 'object' ? 
                            request.doctor.drName : 
                            request.doctor
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.quantity}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status || 'pending')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/sample-requests/${request._id}`)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            عرض
                          </Button>
                          {request.notes && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              ملاحظات
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SampleRequestsList;