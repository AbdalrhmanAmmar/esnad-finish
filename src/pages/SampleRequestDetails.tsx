import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { getSampleRequestById, SampleRequest } from '@/api/SampleRequests';
import { Loader2, ArrowLeft, Calendar, Package, User, FileText, Hash, Clock } from 'lucide-react';

const SampleRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<SampleRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSampleRequest(id);
    }
  }, [id]);

  const loadSampleRequest = async (requestId: string) => {
    try {
      setIsLoading(true);
      const data = await getSampleRequestById(requestId);
      setRequest(data);
    } catch (error: any) {
      console.error('Error loading sample request:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحميل تفاصيل طلب العينة",
        variant: "destructive",
      });
      navigate('/sample-requests');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'موافق عليه', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      rejected: { label: 'مرفوض', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      delivered: { label: 'تم التسليم', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>جاري تحميل تفاصيل الطلب...</span>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">طلب العينة غير موجود</h3>
          <p className="text-muted-foreground mb-4">لم يتم العثور على طلب العينة المطلوب</p>
          <Button onClick={() => navigate('/sample-requests')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة للقائمة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/sample-requests')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تفاصيل طلب العينة</h1>
            <p className="text-muted-foreground mt-1">رقم الطلب: {request._id}</p>
          </div>
        </div>
        {getStatusBadge(request.status || 'pending')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* معلومات الطلب الأساسية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              معلومات الطلب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">تاريخ الطلب:</span>
              </div>
              <span>{formatDate(request.requestDate)}</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">تاريخ التسليم المطلوب:</span>
              </div>
              <span>{formatDate(request.deliveryDate)}</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">الكمية:</span>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">{request.quantity}</Badge>
            </div>
            
            {request.createdAt && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">تاريخ الإنشاء:</span>
                  </div>
                  <span className="text-sm">{formatDateTime(request.createdAt)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* معلومات المنتج والطبيب */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              تفاصيل المنتج والطبيب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">المنتج:</span>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                {typeof request.product === 'object' ? (
                  <div>
                    <p className="font-semibold">{request.product.name}</p>
                    <p className="text-sm text-muted-foreground">كود المنتج: {request.product.code}</p>
                    {request.product.brand && (
                      <p className="text-sm text-muted-foreground">العلامة التجارية: {request.product.brand}</p>
                    )}
                  </div>
                ) : (
                  <p>{request.product}</p>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">الطبيب:</span>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                {typeof request.doctor === 'object' ? (
                  <div>
                    <p className="font-semibold">{request.doctor.drName}</p>
                    {request.doctor.specialty && (
                      <p className="text-sm text-muted-foreground">التخصص: {request.doctor.specialty}</p>
                    )}
                    {request.doctor.organizationName && (
                      <p className="text-sm text-muted-foreground">المؤسسة: {request.doctor.organizationName}</p>
                    )}
                  </div>
                ) : (
                  <p>{request.doctor}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الملاحظات */}
      {request.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              الملاحظات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{request.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* معلومات المندوب */}
      {request.medicalRep && typeof request.medicalRep === 'object' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              معلومات المندوب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold">
                {request.medicalRep.firstName} {request.medicalRep.lastName}
              </p>
              <p className="text-sm text-muted-foreground">اسم المستخدم: {request.medicalRep.username}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SampleRequestDetails;