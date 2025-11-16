import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { CalendarPlus, Stethoscope, Building2, Package, TrendingUp, FileText, Home, Users, ClipboardList, LineChart, MapPin } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

export default function MedicalRepHomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    document.dir = "rtl";
  }, []);

  const quickActions = [
    { title: "تسجيل زيارة", icon: CalendarPlus, onClick: () => navigate("/create-visit") },
    { title: "تقارير التسويق", icon: TrendingUp, onClick: () => navigate("/reports/marketing/medical-rep") },
    { title: "تقارير العينات", icon: Package, onClick: () => navigate("/reports/samples/medical-rep") },
    { title: "بياناتي", icon: ClipboardList, onClick: () => navigate("/my-data") },
  ];

  const resources = [
    { title: "إدارة الأطباء", description: "بحث وتصفية ومتابعة الأطباء", icon: Stethoscope, onClick: () => navigate("/doctors-management") },
    { title: "إدارة الصيدليات", description: "بحث وتصفية ومتابعة الصيدليات", icon: Building2, onClick: () => navigate("/pharmacies-management") },
    { title: "التقييم والمتابعة", description: "عرض تقارير وتقييم الأداء", icon: LineChart, onClick: () => navigate("/Medical-coah") },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">مرحباً {user?.firstName} 👋</h1>
          <p className="text-muted-foreground mt-1">لوحة تحكم المندوب الطبي</p>
        </div>
        <Badge variant="outline" className="hidden sm:flex items-center gap-2">
          <Home className="h-4 w-4" />
          الصفحة الرئيسية
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Button variant="ghost" className="w-full justify-start gap-3" onClick={action.onClick}>
                <action.icon className="h-5 w-5 text-primary" />
                {action.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>نظرة عامة سريعة</CardTitle>
            <CardDescription>ملخص لأنشطتك الأخيرة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">زيارات الأسبوع</span>
                </div>
                <div className="text-2xl font-bold">—</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="font-medium">العينات الموزعة</span>
                </div>
                <div className="text-2xl font-bold">—</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">طلبات التسويق</span>
                </div>
                <div className="text-2xl font-bold">—</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">المناطق المستهدفة</span>
                </div>
                <div className="text-2xl font-bold">—</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>روابط سريعة</CardTitle>
            <CardDescription>الوصول إلى الصفحات الأكثر استخداماً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resources.map((item) => (
                <Button key={item.title} variant="secondary" className="w-full justify-start gap-3" onClick={item.onClick}>
                  <item.icon className="h-5 w-5" />
                  <div className="flex flex-col text-right">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </Button>
              ))}
            </div>
            <Separator className="my-4" />
            <Button className="w-full" onClick={() => navigate("/marketing-request")}>طلب نشاط تسويقي</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}