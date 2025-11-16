import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, CheckCircle, XCircle, BookOpen, Receipt, TrendingUp, AlertCircle, Download, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// أنواع البيانات
interface Receipt {
  id: string;
  receiptNumber: number;
  amount: number;
  pharmacyName: string;
  repName: string;
  visitDate: string;
  status: 'correct' | 'incorrect';
  reason?: string;
  notes?: string;
}

interface ReceiptBook {
  id: string;
  bookNumber: string;
  startReceiptNumber: number;
  endReceiptNumber: number;
  totalReceipts: number;
  status: 'active' | 'used' | 'cancelled';
  createdAt: string;
  createdBy: string;
  usedReceipts?: number;
  notes?: string;
  repName: string;
}

// دالة مساعدة لتنسيق العملة
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-LY', {
    style: 'currency',
    currency: 'LYD',
    minimumFractionDigits: 2
  }).format(amount);
};

// دالة مساعدة للحصول على لون الحالة
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'correct':
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />صحيح</Badge>;
    case 'incorrect':
      return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />خاطئ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// مكون الجدول المنفصل للوصولات
const ReceiptsTable = ({ receipts }: { receipts: Receipt[] }) => {
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الوصل</TableHead>
            <TableHead>الصيدلية</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>تاريخ الزيارة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>اسم المندوب</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => (
            <TableRow key={receipt.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="font-mono font-medium text-primary">
                  #{receipt.receiptNumber}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{receipt.pharmacyName}</div>
              </TableCell>
              <TableCell>
                <div className="font-bold text-green-600">
                  {formatCurrency(receipt.amount)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-3 h-3" />
                  {formatDate(receipt.visitDate)}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(receipt.status)}
              </TableCell>
              <TableCell>
                {receipt.reason ? (
                  <div className="text-sm text-red-600 max-w-[200px] truncate">
                    {receipt.repName}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  عرض التفاصيل
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {receipts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          لا توجد وصولات متاحة
        </div>
      )}
    </div>
  );
};

const ReceiptBookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // بيانات نموذجية - في التطبيق الحقيقي سيتم جلبها من API
  const book: ReceiptBook = {
    id: id || '1',
    bookNumber: 'BK-2024-001',
    startReceiptNumber: 1001,
    endReceiptNumber: 1100,
    totalReceipts: 100,
    status: 'active',
    createdAt: '2024-01-15',
    createdBy: 'أحمد محمد',
    usedReceipts: 75,
    notes: 'دفتر الفترة الأولى',
    repName: 'محمد أحمد'
  };

  const receipts: Receipt[] = [
    {
      id: '1',
      receiptNumber: 1001,
      amount: 1500,
      pharmacyName: 'صيدلية طبرق',
      repName: 'cash cash',
      visitDate: '2024-01-15',
      status: 'correct'
    },
    {
      id: '2',
      receiptNumber: 1002,
      amount: 2300,
      pharmacyName: 'صيدلية الدواء',
      repName: 'محمد أحمد',
      visitDate: '2024-01-16',
      status: 'correct'
    },
    {
      id: '3',
      receiptNumber: 1003,
      amount: 1800,
      pharmacyName: 'صيدلية الحياة',
      repName: 'محمد أحمد',
      visitDate: '2024-01-17',
      status: 'incorrect',
      reason: 'صورة الوصل غير واضحة'
    },
    {
      id: '4',
      receiptNumber: 1004,
      amount: 3200,
      pharmacyName: 'صيدولة الأمل',
      repName: 'محمد أحمد',
      visitDate: '2024-01-18',
      status: 'correct'
    },
    {
      id: '5',
      receiptNumber: 1005,
      amount: 2700,
      pharmacyName: 'صيدلية الشفاء',
      repName: 'محمد أحمد',
      visitDate: '2024-01-19',
      status: 'incorrect',
      reason: 'المبلغ غير مطابق'
    }
  ];

  const [activeTab, setActiveTab] = useState<'all' | 'correct' | 'incorrect'>('all');

  // تصفية الوصولات حسب الحالة
  const filteredReceipts = receipts.filter(receipt => {
    if (activeTab === 'all') return true;
    return receipt.status === activeTab;
  });

  const correctReceipts = receipts.filter(r => r.status === 'correct');
  const incorrectReceipts = receipts.filter(r => r.status === 'incorrect');

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
  };

  // إحصائيات الوصولات
  const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const correctAmount = correctReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const incorrectAmount = incorrectReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              {book.bookNumber}
            </h1>
            <p className="text-muted-foreground mt-1">تفاصيل دفتر الوصولات والتحصيلات</p>
          </div>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          تصدير التقرير
        </Button>
      </div>

      {/* Book Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معلومات الدفتر</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">رقم الدفتر:</span>
                <span className="font-medium">{book.bookNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">نطاق الأرقام:</span>
                <span className="font-mono font-medium">{book.startReceiptNumber} - {book.endReceiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">إجمالي الوصولات:</span>
                <span className="font-medium">{book.totalReceipts} وصل</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">تاريخ الإنشاء:</span>
                <span className="font-medium">{formatDate(book.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

       

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الدقة</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {receipts.length > 0 ? Math.round((correctReceipts.length / receipts.length) * 100) : 0}%
            </div>
            <div className="text-sm text-purple-600 mt-1">
              {correctReceipts.length} من {receipts.length} وصل صحيح
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الوصولات</CardTitle>
            <Receipt className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{receipts.length}</div>
            <p className="text-xs text-blue-600">جميع الوصولات</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوصولات الصحيحة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{correctReceipts.length}</div>
            <div className="flex justify-between text-xs">
              <span className="text-green-600">{formatCurrency(correctAmount)}</span>
              <span className="text-muted-foreground">{Math.round((correctReceipts.length / receipts.length) * 100)}%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوصولات الخاطئة</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{incorrectReceipts.length}</div>
            <div className="flex justify-between text-xs">
              <span className="text-red-600">{formatCurrency(incorrectAmount)}</span>
              <span className="text-muted-foreground">{Math.round((incorrectReceipts.length / receipts.length) * 100)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receipts Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الوصولات</CardTitle>
          <CardDescription>
            عرض جميع الوصولات المرتبطة بهذا الدفتر مع حالة كل وصل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                جميع الوصولات ({receipts.length})
              </TabsTrigger>
              <TabsTrigger value="correct" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                الصحيحة ({correctReceipts.length})
              </TabsTrigger>
              <TabsTrigger value="incorrect" className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                الخاطئة ({incorrectReceipts.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <ReceiptsTable receipts={filteredReceipts} />
            </TabsContent>
            
            <TabsContent value="correct" className="space-y-4">
              <ReceiptsTable receipts={filteredReceipts} />
            </TabsContent>
            
            <TabsContent value="incorrect" className="space-y-4">
              <ReceiptsTable receipts={filteredReceipts} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <TrendingUp className="w-5 h-5" />
            ملخص الأداء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{receipts.length}</div>
              <div className="text-sm text-orange-700">إجمالي الوصولات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{correctReceipts.length}</div>
              <div className="text-sm text-green-700">وصول صحيح</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{incorrectReceipts.length}</div>
              <div className="text-sm text-red-700">وصول خاطئ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {receipts.length > 0 ? Math.round((correctReceipts.length / receipts.length) * 100) : 0}%
              </div>
              <div className="text-sm text-purple-700">معدل الدقة</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="font-medium">ملاحظات الأداء:</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• معدل الدقة العام: {receipts.length > 0 ? Math.round((correctReceipts.length / receipts.length) * 100) : 0}%</div>
              <div>• إجمالي المبلغ المحصل: {formatCurrency(totalAmount)}</div>
              <div>• متوسط قيمة الوصل: {formatCurrency(receipts.length > 0 ? totalAmount / receipts.length : 0)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptBookDetails;