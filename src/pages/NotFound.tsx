import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full p-8 bg-gradient-card shadow-card-medical border-0 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-medical rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">404</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">الصفحة غير موجودة</h1>
          <p className="text-muted-foreground" style={{ direction: 'rtl' }}>
            عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها إلى مكان آخر
          </p>
        </div>
        
        <div className="space-y-3">
          <Button asChild className="w-full bg-primary hover:bg-primary-dark text-white">
            <Link to="/" style={{ direction: 'rtl' }}>
              <Home className="ml-2 w-4 h-4" />
              العودة للصفحة الرئيسية
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link to="/dashboards" style={{ direction: 'rtl' }}>
              <ArrowRight className="ml-2 w-4 h-4" />
              لوحة التحكم
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
