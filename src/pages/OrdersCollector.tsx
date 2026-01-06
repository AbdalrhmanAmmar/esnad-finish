import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  RefreshCw,
  Edit3,
  TrendingUp,
  Users,
  Store,
  Download,
  List,
  FileSpreadsheet,
} from "lucide-react";
import {
  getSalesReps,
  getPharmacies,
  exportFinalOrdersToExcel,
  exportApprovedProductsOnly, // الدالة الجديدة
  FilteredOrdersParams,
  getFinalOrdersFiltered,
} from "@/api/OrdersCollection";
import { FinalOrderData } from "@/api/OrdersOfficer";
import { useToast } from "@/hooks/use-toast";
import { OrderEditModal } from "@/components/ui/OrderEditModal";
import { Pagination } from "@/components/ui/pagination";
import { OrdersFilter, FilterOptions } from "@/components/ui/OrdersFilter";
import { useAuthStore } from "@/stores/authStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrdersCollector: React.FC = () => {
  const { user } = useAuthStore();
  const isOrderOfficerRole = user?.role === "ORDERS OFFICERS";
  const [orders, setOrders] = useState<FinalOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<FinalOrderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    status: "all",
    salesRep: "all",
    pharmacy: "all",
    startDate: null,
    endDate: null,
  });
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
    totalValue: 0,
  });

  const [exportLoading, setExportLoading] = useState(false);
  const [exportApprovedLoading, setExportApprovedLoading] = useState(false); // حالة تحميل التصدير الجديد
  const { toast } = useToast();

  const calculateOrderTotal = (orderDetails: FinalOrderData["orderDetails"]) => {
    return orderDetails.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const fetchOrders = useCallback(
    async (page: number = 1, currentFilters: FilterOptions = filters) => {
      try {
        setLoading(true);

        const apiParams: FilteredOrdersParams = {
          page,
          limit: itemsPerPage,
          ...(currentFilters.search && { search: currentFilters.search }),
          ...(currentFilters.status &&
            currentFilters.status !== "all" && {
              status: currentFilters.status as "pending" | "approved" | "rejected",
            }),
          ...(currentFilters.salesRep &&
            currentFilters.salesRep !== "all" && { salesRep: currentFilters.salesRep }),
          ...(currentFilters.pharmacy &&
            currentFilters.pharmacy !== "all" && { pharmacy: currentFilters.pharmacy }),
          ...(currentFilters.startDate && {
            startDate: currentFilters.startDate.toISOString().split("T")[0],
          }),
          ...(currentFilters.endDate && {
            endDate: currentFilters.endDate.toISOString().split("T")[0],
          }),
        };

        let response = await getFinalOrdersFiltered(apiParams);
        if (!response.success) {
          response = await getFinalOrdersFiltered({ page, limit: itemsPerPage });
        }

        const ordersData: FinalOrderData[] = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData);

        setPagination({
          currentPage: response.currentPage ?? page,
          totalPages: response.totalPages ?? 1,
          totalCount: response.totalCount ?? ordersData.length,
          hasNextPage: response.hasNextPage ?? page < (response.totalPages ?? 1),
          hasPrevPage: response.hasPrevPage ?? page > 1,
        });

        // حساب الإحصائيات من البيانات المسترجعة
        const stats = ordersData.reduce(
          (acc, order) => {
            const total = calculateOrderTotal(order.orderDetails);
            acc.totalValue += total;
            if (order.FinalOrderStatusValue === "pending") acc.pendingOrders++;
            else if (order.FinalOrderStatusValue === "approved") acc.approvedOrders++;
            else if (order.FinalOrderStatusValue === "rejected") acc.rejectedOrders++;
            return acc;
          },
          {
            totalOrders: response.totalCount ?? ordersData.length,
            pendingOrders: 0,
            approvedOrders: 0,
            rejectedOrders: 0,
            totalValue: 0,
          }
        );
        setStatistics(stats);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "خطأ في تحميل الطلبات",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage, filters, toast]
  );

  const fetchFilterData = async () => {
    try {
      const [salesRepsResponse, pharmaciesResponse] = await Promise.all([
        getSalesReps(),
        getPharmacies(),
      ]);

      if (salesRepsResponse.success) {
        const reps = salesRepsResponse.data.map((rep: any) => ({
          value: [rep.firstName, rep.lastName].filter(Boolean).join(" "),
          label: [rep.firstName, rep.lastName].filter(Boolean).join(" "),
        }));
        setSalesReps(reps);
      }

      if (pharmaciesResponse.success) {
        const pharms = pharmaciesResponse.data.map((ph: any) => ({
          value: ph.customerSystemDescription,
          label: ph.customerSystemDescription,
        }));
        setPharmacies(pharms);
      }
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchOrders(1, filters);
  }, [filters, itemsPerPage]);

  const handleFiltersChange = (newFilters: FilterOptions) => setFilters(newFilters);
  const handlePageChange = (page: number) => fetchOrders(page, filters);
  const handleRefresh = () => fetchOrders(pagination.currentPage, filters);
  const handleItemsPerPageChange = (value: string) => setItemsPerPage(Number(value));

  // دالة التصدير الشامل (القديمة)
  const handleExport = async () => {
    try {
      setExportLoading(true);
      const blob = await exportFinalOrdersToExcel(filters as any);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `الطلبيات_النهائية_${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "✅ تم التصدير بنجاح" });
    } catch (error) {
      toast({ title: "❌ خطأ في التصدير", variant: "destructive" });
    } finally {
      setExportLoading(false);
    }
  };

  // دالة تصدير المنتجات المقبولة فقط (الجديدة)
  const handleExportApprovedOnly = async () => {
    try {
      setExportApprovedLoading(true);
      const params: FilteredOrdersParams = {
        ...(filters.salesRep !== "all" && { salesRep: filters.salesRep }),
        ...(filters.pharmacy !== "all" && { pharmacy: filters.pharmacy }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString().split("T")[0] }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString().split("T")[0] }),
        ...(filters.search && { search: filters.search }),
      };

      const blob = await exportApprovedProductsOnly(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `كشف_المنتجات_المقبولة_${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "✅ تم استخراج المنتجات",
        description: "تم تصدير جميع المنتجات المقبولة بنجاح",
      });
    } catch (error) {
      toast({ title: "❌ خطأ في التصدير التخصصي", variant: "destructive" });
    } finally {
      setExportApprovedLoading(false);
    }
  };

  const handleEditOrder = (order: FinalOrderData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdated = () => fetchOrders(pagination.currentPage, filters);

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            محصل الطلبيات
          </h1>
          <p className="text-muted-foreground mt-1">إدارة الطلبيات المقبولة والمرفوضة</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* الزر الجديد */}
          <Button
            onClick={handleExportApprovedOnly}
            variant="outline"
            disabled={exportApprovedLoading}
            className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <FileSpreadsheet
              className={`h-4 w-4 mr-2 ${exportApprovedLoading ? "animate-pulse" : ""}`}
            />
            تصدير المنتجات المقبولة
          </Button>

          <Button
            onClick={handleExport}
            variant="default"
            disabled={exportLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            تصدير Excel الشامل
          </Button>

          <Button onClick={handleRefresh} variant="ghost" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="إجمالي الطلبات"
          value={pagination.totalCount}
          icon={<Package />}
          color="blue"
        />
        <StatCard
          title="مقبولة"
          value={statistics.approvedOrders}
          icon={<TrendingUp />}
          color="green"
        />
        <StatCard
          title="في الانتظار"
          value={statistics.pendingOrders}
          icon={<Users />}
          color="yellow"
        />
        <StatCard title="مرفوضة" value={statistics.rejectedOrders} icon={<Users />} color="red" />
        <StatCard
          title="القيمة الإجمالية"
          value={`${statistics.totalValue.toLocaleString()} د.ل`}
          icon={<Store />}
          color="purple"
        />
      </div>

      {/* Filters */}
      <OrdersFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        salesReps={salesReps}
        pharmacies={pharmacies}
        isLoading={loading}
      />

      {/* Main List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <List className="h-5 w-5" />
            قائمة الطلبيات
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">عرض:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[70px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((v) => (
                  <SelectItem key={v} value={v.toString()}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">لا توجد نتائج تطابق بحثك</p>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order.orderId} className="p-6 hover:bg-muted/10 transition-colors">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className="font-mono">
                          #{order.orderId.slice(-6).toUpperCase()}
                        </Badge>
                        <Badge
                          className={
                            order.FinalOrderStatusValue === "approved"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : order.FinalOrderStatusValue === "rejected"
                              ? "bg-red-100 text-red-700 hover:bg-red-100"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {order.FinalOrderStatusValue === "approved"
                            ? "✅ مقبول نهائي"
                            : order.FinalOrderStatusValue === "rejected"
                            ? "❌ مرفوض نهائي"
                            : "⏳ قيد المراجعة"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          📅 {new Date(order.visitDate).toLocaleDateString("ar-EG")}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary/60" />
                          <span className="text-sm font-medium">المندوب: {order.salesRepName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-primary/60" />
                          <span className="text-sm font-medium">
                            الصيدلية: {order.pharmacyName}
                          </span>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                        {order.orderDetails.map((item) => (
                          <div
                            key={item._id}
                            className="flex justify-between items-center text-sm border-b border-dashed border-muted-foreground/20 pb-2 last:border-0 last:pb-0"
                          >
                            <span className="font-medium">
                              {item.productName}{" "}
                              <span className="text-xs text-muted-foreground">
                                ({item.productCode})
                              </span>
                            </span>
                            <div className="space-x-4 space-x-reverse">
                              <span>{item.quantity} وحدة</span>
                              <span className="font-bold">
                                {(item.price * item.quantity).toLocaleString()} د.ل
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:w-48 flex flex-col justify-between items-end border-r pr-6 border-muted">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">صافي قيمة الطلب</p>
                        <p className="text-xl font-bold text-primary">
                          {calculateOrderTotal(order.orderDetails).toLocaleString()}{" "}
                          <span className="text-xs">د.ل</span>
                        </p>
                      </div>

                      {isOrderOfficerRole && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                          className="w-full mt-4"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          تعديل القرار
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && orders.length > 0 && pagination.totalPages > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            showInfo={true}
            totalItems={pagination.totalCount}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      <OrderEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
};

// مكون فرعي للبطاقات الإحصائية لتقليل تكرار الكود
const StatCard = ({ title, value, icon, color }: any) => {
  const colors: any = {
    blue: "from-blue-50 to-blue-100 text-blue-600 border-blue-200",
    green: "from-green-50 to-green-100 text-green-600 border-green-200",
    yellow: "from-yellow-50 to-yellow-100 text-yellow-600 border-yellow-200",
    red: "from-red-50 to-red-100 text-red-600 border-red-200",
    purple: "from-purple-50 to-purple-100 text-purple-600 border-purple-200",
  };
  return (
    <Card className={`bg-gradient-to-br ${colors[color]} border shadow-none`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold opacity-70 mb-1">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
        <div className="opacity-20">{React.cloneElement(icon, { size: 32 })}</div>
      </CardContent>
    </Card>
  );
};

export default OrdersCollector;
