import React from "react";
import {
  Home, 
  BarChart3, 
  FileText, 
  Users, 
  ShoppingCart,
  DollarSign,
  Star,
  Settings,
  UserCog,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Building2,
  Pill,
  ClipboardList,
  UserPlus,
  Calendar,
  CalendarPlus,
  FolderOpen,
  Package,
  CreditCard,
  Receipt,
  UserCheck,
  Stethoscope,
  Activity,
  Database,
  ShoppingBag,
  UserMinus,
  MessageSquare,
  LogOut,
  User,
  TrendingUp,
  BookA,
  CalendarDays,
  Stars,
  DollarSignIcon
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  // { id: "home", title: "الصفحة الرئيسية", url: "/", icon: Home, color: "text-blue-500" },
  // { id: "Ai", title: "اعدادات الذكاء الصناعي", url: "/Ai", icon: Moon, color: "text-gray-500" },
  // { 
  //   id: "dashboards", 
  //   title: "لوحات التحكم", 
  //   icon: BarChart3, 
  //   color: "text-teal-500",
  //   subItems: [
  //     { id: "clinic-analytics", title: "تحليلات العيادات المتقدمة", url: "/analytics/clinics", icon: Building2 },
  //     { id: "clinic-dashboard", title: "لوحة تحكم العيادات", url: "/dashboards/clinics", icon: Building2 },
  //     { id: "pharmacy-dashboard", title: "لوحة تحكم الصيدليات", url: "/dashboards/pharmacies", icon: Pill },
  //     { id: "admin-dashboard", title: "لوحة تحكم الأدمن", url: "/dashboards/admin", icon: Settings, requiredRoles: ["ADMIN", "admin", "SYSTEM_ADMIN"] }
  //   ]
  // },
  // { 
  //   id: "reports", 
  //   title: "التقارير", 
  //   icon: FileText, 
  //   color: "text-green-500",
  //   subItems: [
  //     { id: "clinic-reports", title: "تقرير العيادات", url: "/reports/clinics", icon: Building2 },
  //     { id: "pharmacy-reports", title: "تقرير الصيدليات", url: "/reports/pharmacies", icon: Pill }
  //   ]
  // },
  // {
  //   id:"visits-pharmacy-reports",
  //   title: " زيارات الصيدليات",
  //   url: "visits/pharmacy",
  //   icon: Pill,
  //   color: "text-pink-500"
  // },
  // { 
  //   id: "visits", 
  //   title: "الزيارات", 
  //   icon: Users, 
  //   color: "text-purple-500",
  //   subItems: [
  //     { id: "clinic-visit", title: "تسجيل زيارة عيادة", url: "/visits/clinic", icon: Stethoscope },
  //     { id: "pharmacy-visit", title: "تسجيل زيارة صيدلية", url: "/visits/pharmacy", icon: Pill }
  //   ]
  // },
  // { id: "clients", title: "قائمة العملاء", url: "/clients", icon: Users, color: "text-cyan-500" },
  // { id: "sales-clients", title: "عملاء المبيعات", url: "/sales-clients", icon: UserCheck, color: "text-blue-600", requiredRoles: ["SALES REP"] },
  // { 
  //   id: "orders", 
  //   title: "الطلبات", 
  //   icon: ShoppingCart, 
  //   color: "text-orange-500",
  //   subItems: [
  //     { id: "sample-order", title: "طلب عينات", url: "/sample-form", icon: Package },
  //     { id: "sample-request", title: "نموذج طلب عينات", url: "/sample-request", icon: Package, requiredRoles: ["MEDICAL REP", "medical rep"] },
  //     { id: "marketing-order", title: "نموذج طلب تسويقي", url: "/marketing-request", icon: TrendingUp }
  //   ]
  // },
  // { 
  //   id: "collections", 
  //   title: "التحصيلات", 
  //   icon: DollarSign, 
  //   color: "text-emerald-500",
  //   subItems: [
  //     { id: "financial-collection", title: "تحصيل مالي", url: "/collections/financial", icon: CreditCard },
  //     { id: "order-collection", title: "تحصيل طلب", url: "/collections/orders", icon: Receipt }
  //   ]
  // },
  // { 
  //   id: "financial-collector", 
  //   title: "المحصل المالي", 
  //   icon: Receipt, 
  //   color: "text-green-600",
  //   requiredRoles: ["ADMIN", "SYSTEM_ADMIN", "FINANCIAL OFFICER"],
  //   subItems: [
  //     { id: "money-collection", title: "تحصيل المال", url: "/financial-collector/money-collection", icon: DollarSign },
  //     { id: "orders-collection", title: "تحصيل الطلبيات", url: "/financial-collector/orders-collection", icon: ShoppingCart },
  //     { id: "financial-orders-collection", title: "مجموعة الطلبات المالية", url: "/financial-collector/financial-orders-collection", icon: BarChart3 }
  //   ]
  // },
  // { 
  //   id: "evaluations", 
  //   title: "التقييمات", 
  //   icon: Star, 
  //   color: "text-yellow-500",
  //   subItems: [
  //     { id: "rep-evaluation", title: "تقييم مندوب الزيارات", url: "/evaluations/representatives", icon: UserCheck }
  //   ]
  // },
];

const managementItems = [
  // { 
  //   id: "management", 
  //   title: "الإدارة العامة", 
  //   icon: Settings, 
  //   color: "text-gray-500",
  //   requiredRoles: ["ADMIN"],
  //   subItems: [
  //     { id: "work-days", title: "إدارة أيام العمل", url: "/work-day-calender", icon: Calendar },
  //     { id: "documents", title: "رفع المنتجات", url: "/management/documents", icon: FolderOpen },
  //     { id: "product-messages", title: "رفع رسائل المنتجات", url: "/management/product-messages", icon: MessageSquare },
  //     { id: "doctors-upload", title: "رفع ملفات الأطباء", url: "/management/doctors-upload", icon: Stethoscope },
  //     { id: "pharmacies-upload", title: "رفع ملفات الصيدليات", url: "/management/pharmacies-upload", icon: Pill },
  //     { id: "users-upload", title: "رفع ملفات المستخدمين", url: "/management/users-upload", icon: Users },
  //     { id: "marketing-activities-upload", title: "رفع الأنشطة التسويقية", url: "/management/marketing-activities-upload", icon: Activity, requiredRoles: ["ADMIN", "SYSTEM_ADMIN"] },
  //     { id: "lost-orders", title: "إدارة الطلبيات المفقودة", url: "/management/lost-orders", icon: Package },
  //     { id: "site-analytics", title: "إحصائيات الموقع", url: "/management/site-analytics", icon: TrendingUp, requiredRoles: ["SYSTEM_ADMIN"] },
  //     {
  //       id: "data-management",
  //       title: "إدارة البيانات",
  //       icon: Database,
  //       subItems: [
  //         { id: "products-management", title: "إدارة المنتجات", url: "/management/data/products", icon: ShoppingBag },
  //         { id: "doctors-management", title: "إدارة الأطباء", url: "/management/data/doctors", icon: UserMinus },
  //         { id: "pharmacies-management", title: "إدارة الصيدليات", url: "/management/data/pharmacies", icon: Pill },
  //         { id: "employees-management", title: "إدارة الموظفين", url: "/management/employees", icon: Users, requiredRoles: ["ADMIN"] },
  //         { id: "marketing-activities-management", title: "إدارة الأنشطة التسويقية", url: "/management/marketing-activities", icon: Activity, requiredRoles: ["ADMIN", "SYSTEM_ADMIN"] }
  //       ]
  //     }
  //   ]
  // },
  // { id: "profile", title: "الملف الشخصي", url: "/profile", icon: User, color: "text-blue-500" },
  // { id: "my-data", title: "قائمة بياناتي", url: "/my-data", icon: ClipboardList, color: "text-green-500", requiredRoles: ["MEDICAL REP", "medical rep"] },
  // { 
  //   id: "users", 
  //   title: "إدارة المستخدمين", 
  //   icon: UserCog, 
  //   color: "text-indigo-500",
  //   subItems: [
  //     { id: "create-visit", title: "تسجيل زيارة عادية", url: "/create-visit", icon: CalendarPlus, requiredRoles: ["MEDICAL REP", "medical rep"] },
  //     { id: "add-user", title: "إضافة مستخدم", url: "/users/add", icon: UserPlus },
  //     { id: "create-admin", title: "إنشاء أدمن جديد", url: "/management/create-admin", icon: User, requiredRoles: ["SYSTEM_ADMIN"] },
  //     { id: "all-admins", title: "جميع الأدمن", url: "/management/all-admins", icon: Users, requiredRoles: ["SYSTEM_ADMIN"] }
  //   ]
  // },
];

export function AppSidebar() {
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  // Auto-close sidebar on mobile when navigating to a new page
  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  const isActive = (path: string) => currentPath === path;
  
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/login');
  };

  // Filter items based on user role
  const getFilteredMenuItems = () => {
    if (user?.role === "ORDERS OFFICERS") {
      return [
        { 
          id: "orders-collector", 
          title: "محصل الطلبيات", 
          url: "/orders-collector",
          icon: ShoppingCart, 
          color: "text-orange-500"
        },
      ];
    }
    if (user?.role === "SALES SUPERVISOR" || user?.role === "FINANCIAL MANAGER" || user?.role === "ASSITANT" || user?.role === "GENERAL MANAGER") {
      return  [
               { 
          id: "dashboards", 
          title: "لوحة تحكم الصيدليات", 
          url: "/dashboards/admin",
          icon: Pill, 
          color: "text-teal-500"
        },
        
   
            { id: "money-collection", title: "تحصيل المال", url: "/financial-collector/money-collection", icon: DollarSign },
            { id: "orders-collection", title: "تحصيل الطلبيات", url: "/financial-collector/orders-collection", icon: ShoppingCart },
               { 
          id: "orders-collector", 
          title: "محصل الطلبيات", 
          url: "/orders-collector",
          icon: ShoppingCart, 
          color: "text-orange-500"
        },
         { id: "profile", title: "الملف الشخصي", url: "/profile", icon: User, color: "text-blue-500" },
      
      
      ];
    }
    
    if (user?.role === "FINANCIAL OFFICER") {
      return [
                      { 
          id: "dashboards", 
          title: "لوحة تحكم الصيدليات", 
          url: "/dashboards/admin",
          icon: Pill, 
          color: "text-teal-500"
        },
   
            { id: "money-collection", title: "تحصيل المال", url: "/financial-collector/money-collection", icon: DollarSign },
            { id: "orders-collection", title: "تحصيل الطلبيات", url: "/financial-collector/orders-collection", icon: ShoppingCart }
      
      ];
    }
    
    if (user?.role === "SYSTEM_ADMIN") {
      return [
      ];
    }
    
    if (user?.role === "SALES_REP" || user?.role === "SALES REP") {
      return [
        {
          id:"visits-pharmacy-reports",
          title: "زيارات الصيدليات",
          url: "/visits/pharmacy",
          icon: Pill,
          color: "text-pink-500"
        },
        { 
          id: "dashboards", 
          title: "لوحة تحكم الصيدليات", 
          url: "/dashboards/pharmacies",
          icon: Pill, 
          color: "text-teal-500"
        },
        { id: "sales-clients", title: "عملاء المبيعات", url: "/sales-clients", icon: UserCheck, color: "text-blue-600" },
        
      ];
    }
    if (user?.role === "SALES SUPERVISOR") {
      return [
        { 
          id: "pharmacy-dashboard", 
          title: "لوحة تحكم الصيدليات", 
          url: "/dashboards/pharmacies",
          icon: Pill, 
          color: "text-teal-500"
        }
      ];
    }
    
    if (user?.role === "MEDICAL REP" || user?.role === "medical rep") {
      return [
                          { id: "create-visit", title: "تسجيل زيارة عادية", url: "/create-visit", icon: CalendarPlus, requiredRoles: ["MEDICAL REP", "medical rep"] },

        
       
            { id: "clinic-analytics", title: "لوحه تحكم العيادات", url: "/analytics/clinics", icon: Building2 },
            { id: "medical-sales", title: "لوحه تحكم المبيعات", url: "/analytics/medical-sales", icon: DollarSignIcon },
          
        
        { 
          id: "reports", 
          title: "التقارير", 
          icon: FileText, 
          color: "text-green-500",
          subItems: [
            // { id: "clinic-reports", title: "تقرير العيادات", url: "/reports/clinics", icon: Building2 },
            { id: "sample-reports", title: "تقرير العينات", url: "/reports/samples/medical-rep", icon: Package },
            { id: "marketing-reports", title: " الأنشطة التسويقية", url: "/reports/marketing/medical-rep", icon: TrendingUp }
          ]
        },
        { 
          id: "orders", 
          title: "الطلبات", 
          icon: ShoppingCart, 
          color: "text-orange-500",
          subItems: [

            { id: "sample-request", title: "نموذج طلب عينات", url: "/sample-request", icon: Package, requiredRoles: ["MEDICAL REP", "medical rep"] },
            { id: "marketing-order", title: "نموذج طلب تسويقي", url: "/marketing-request", icon: TrendingUp, requiredRoles: ["MEDICAL REP", "medical rep"] }
          ]
        },
                    { id: "my-data", title: "قائمة بياناتي", url: "/my-data", icon: ClipboardList },
                    { id: "work-day", title: "قائمة أيام العمل", url: "/work-day", icon: CalendarDays },

      ];
    }
    
    if (user?.role === "ADMIN") {
      return [
        { id: "home", title: "الصفحة الرئيسية", url: "/", icon: Home, color: "text-blue-500" },

        { 
          id: "admin-dashboard", 
          title: "لوحة تحكم الصيدليات", 
          url: "/dashboards/admin", 
          icon: BarChart3,  
          color: "text-teal-500"
        },
        { 
          id: "requests-list", 
          title: "قائمة الطلبات", 
          icon: ClipboardList, 
          color: "text-purple-500",
          subItems: [
            { id: "sample-requests", title: "طلبات العينات", url: "/admin/sample-requests", icon: Package }
          ]
        },
        { id: "product-search", title: "باحث المنتجات", url: "/product-details", icon: Package, color: "text-indigo-500" },
        { id: "product-search", title: "دفتر الوصولات", url: "/ReceipBooks-manager", icon: BookA, color: "text-tomato-500" },
         { 
    id: "management", 
    title: "الإدارة العامة", 
    icon: Settings, 
    color: "text-gray-500",
    requiredRoles: ["ADMIN"],
    subItems: [
      { id: "work-days", title: "إدارة أيام العمل", url: "/work-day-calender", icon: Calendar },
      { id: "documents", title: "رفع المنتجات", url: "/management/documents", icon: FolderOpen },
      { id: "product-messages", title: "رفع رسائل المنتجات", url: "/management/product-messages", icon: MessageSquare },
      { id: "doctors-upload", title: "رفع ملفات الأطباء", url: "/management/doctors-upload", icon: Stethoscope },
      { id: "pharmacies-upload", title: "رفع ملفات الصيدليات", url: "/management/pharmacies-upload", icon: Pill },
      { id: "users-upload", title: "رفع ملفات المستخدمين", url: "/management/users-upload", icon: Users },
      { id: "marketing-activities-upload", title: "رفع الأنشطة التسويقية", url: "/management/marketing-activities-upload", icon: Activity, requiredRoles: ["ADMIN", "SYSTEM_ADMIN"] },
      { id: "lost-orders", title: "إدارة الطلبيات المفقودة", url: "/management/lost-orders", icon: Package },
      { id: "site-analytics", title: "إحصائيات الموقع", url: "/management/site-analytics", icon: TrendingUp, requiredRoles: ["SYSTEM_ADMIN"] },
      {
        id: "data-management",
        title: "إدارة البيانات",
        icon: Database,
        subItems: [
          { id: "products-management", title: "إدارة المنتجات", url: "/management/data/products", icon: ShoppingBag },
          { id: "doctors-management", title: "إدارة الأطباء", url: "/management/data/doctors", icon: UserMinus },
          { id: "pharmacies-management", title: "إدارة الصيدليات", url: "/management/data/pharmacies", icon: Pill },
          { id: "employees-management", title: "إدارة الموظفين", url: "/management/employees", icon: Users, requiredRoles: ["ADMIN"] },
          { id: "marketing-activities-management", title: "إدارة الأنشطة التسويقية", url: "/management/marketing-activities", icon: Activity, requiredRoles: ["ADMIN", "SYSTEM_ADMIN"] }
        ]
      }
    ]
  },
  { id: "profile", title: "الملف الشخصي", url: "/profile", icon: User, color: "text-blue-500" },
  { id: "my-data", title: "قائمة بياناتي", url: "/my-data", icon: ClipboardList, color: "text-green-500", requiredRoles: ["MEDICAL REP", "medical rep"] },
  { 
    id: "users", 
    title: "إدارة المستخدمين", 
    icon: UserCog, 
    color: "text-indigo-500",
    subItems: [
      { id: "add-user", title: "إضافة مستخدم", url: "/users/add", icon: UserPlus },
      { id: "create-admin", title: "إنشاء أدمن جديد", url: "/management/create-admin", icon: User, requiredRoles: ["SYSTEM_ADMIN"] },
      { id: "all-admins", title: "جميع الأدمن", url: "/management/all-admins", icon: Users, requiredRoles: ["SYSTEM_ADMIN"] }
    ]
  },

      ];
    }
    
    if (user?.role === "SUPERVISOR") {
      return [
          { id: "clinic-analytics", title: "لوحه تحكم العيادات", url: "/dashboards/clinics/supervisor", icon: Building2 },

        { 
          id: "requests-list", 
          title: "قائمة الطلبات", 
          icon: ClipboardList, 
          color: "text-purple-500",
          subItems: [
            { id: "sample-requests", title: "طلبات العينات", url: "/supervisor/sample-requests", icon: Package },
            { id: "marketing-requests", title: "طلبات النشاط التسويقي", url: "/supervisor/marketing-requests", icon: TrendingUp }
          ]
        },
        { id: "medical-coach", title: "تقييم المندوب", url: "/Medical-coah", icon: Stars, color: "text-yellow-500" },

        { id: "profile", title: "الملف الشخصي", url: "/profile", icon: User, color: "text-blue-500" }
      ];
    }
   
   
    
    return menuItems;
  };

  const getFilteredManagementItems = () => {
    if (user?.role === "SALES_REP" || user?.role === "SALES REP") {
      return [
        { id: "profile", title: "الملف الشخصي", url: "/profile", icon: User, color: "text-blue-500" }
      ];
    }
       if (user?.role === "SALES SUPERVISOR") {
      return  [
   
       
      
      ];
    }
    
    if (user?.role === "ORDERS OFFICERS") {
      return [
        { id: "profile", title: "الملف الشخصي", url: "/profile", icon: User, color: "text-blue-500" }
      ];
    }
    
    if (user?.role === "FINANCIAL OFFICER") {
      return [];
    }
    
    if (user?.role === "SYSTEM_ADMIN") {
      return [
        { 
          id: "management", 
          title: "الإدارة العامة", 
          icon: Settings, 
          color: "text-gray-500",
          subItems: [
            { id: "site-analytics", title: "إحصائيات الموقع", url: "/management/site-analytics", icon: TrendingUp, requiredRoles: ["SYSTEM_ADMIN"] }
          ]
        },
        { 
          id: "users", 
          title: "إدارة المستخدمين", 
          icon: UserCog, 
          color: "text-indigo-500",
          subItems: [
            { id: "create-admin", title: "إنشاء أدمن جديد", url: "/management/create-admin", icon: User, requiredRoles: ["SYSTEM_ADMIN"] },
            { id: "all-admins", title: "جميع عملائي (الادمن)", url: "/management/all-admins", icon: Users, requiredRoles: ["SYSTEM_ADMIN"] }
          ]
        },
        
      ];
    }
    
    
    
    return managementItems;
  };

  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">ES</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <img src="/Images/logo.svg" alt="Esnad Logo" className="h-8 w-auto" />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-12 w-12 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 bg-[#ff6347]"
          >
            {isCollapsed ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
          </Button>
        </div>
        
        {/* User Info */}
        {user && !isCollapsed && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarMenu className="space-y-2">
            {getFilteredMenuItems().map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.id);
              const active = item.url ? isActive(item.url) : false;


              
              return (
                <SidebarMenuItem key={item.id}>
                  {hasSubItems ? (
                    <>
                      <SidebarMenuButton 
                        onClick={() => toggleExpanded(item.id)}
                        className={`
                          w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg
                          transition-all duration-200 group relative cursor-pointer 
                          ${theme === 'dark'
                            ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                            : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                          }
                        `}
                      >
                        <item.icon 
                          size={20} 
                          className={`flex-shrink-0 transition-colors ${item.color}`}
                        />
                        {!isCollapsed && (
                          <>
                            <span className="font-medium text-right flex-1 truncate">
                              {item.title}
                            </span>
                            <ChevronDown 
                              size={16} 
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className={`
                            absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm 
                            rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                            pointer-events-none whitespace-nowrap z-50
                          `}>
                            {item.title}
                          </div>
                        )}
                      </SidebarMenuButton>
                      
                      {isExpanded && !isCollapsed && (
                        <div className="mr-6 mt-1 space-y-1">
                          {item.subItems.filter((subItem) => {
                            // التحقق من الأدوار المطلوبة
                            if (subItem.requiredRoles && user) {
                              return subItem.requiredRoles.includes(user.role);
                            }
                            return true;
                          }).map((subItem) => {
                            const subActive = subItem.url ? isActive(subItem.url) : false;
                            const hasNestedSubItems = subItem.subItems && subItem.subItems.length > 0;
                            const isNestedExpanded = expandedItems.includes(subItem.id);
                            
                            return (
                              <div key={subItem.id}>
                                {hasNestedSubItems ? (
                                  <>
                                    <SidebarMenuButton 
                                      onClick={() => toggleExpanded(subItem.id)}
                                      className={`
                                        w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                        transition-all duration-200 group relative cursor-pointer
                                        ${theme === 'dark'
                                          ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                        }
                                      `}
                                    >
                                      <subItem.icon 
                                        size={32} 
                                        className="flex-shrink-0 transition-colors text-gray-500"
                                      />
                                      <span className="text-sm font-medium text-right flex-1 truncate">
                                        {subItem.title}
                                      </span>
                                      <ChevronDown 
                                        size={14} 
                                        className={`transition-transform duration-200 ${isNestedExpanded ? 'rotate-180' : ''}`}
                                      />
                                    </SidebarMenuButton>
                                    
                                    {isNestedExpanded && (
                                      <div className="mr-4 mt-1 space-y-1">
                                        {subItem.subItems.map((nestedItem) => {
                                          const nestedActive = isActive(nestedItem.url);
                                          return (
                                            <SidebarMenuButton key={nestedItem.id} asChild>
                                              <NavLink 
                                                to={nestedItem.url} 
                                                end 
                                                className={`
                                                  w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                                  transition-all duration-200 group relative
                                                  ${nestedActive 
                                                    ? `${theme === 'dark'
                                                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                                                        : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                                                      }` 
                                                    : `${theme === 'dark'
                                                        ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                                      }`
                                                  }
                                                `}
                                              >
                                                <nestedItem.icon 
                                                  size={14} 
                                                  className={`
                                                    flex-shrink-0 transition-colors
                                                    ${nestedActive ? 'text-white' : 'text-gray-400'}
                                                  `}
                                                />
                                                <span className="text-xs font-medium text-right flex-1 truncate">
                                                  {nestedItem.title}
                                                </span>
                                              </NavLink>
                                            </SidebarMenuButton>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <SidebarMenuButton asChild>
                                    <NavLink 
                                      to={subItem.url} 
                                      end 
                                      className={`
                                        w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                        transition-all duration-200 group relative
                                        ${subActive 
                                          ? `${theme === 'dark'
                                              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                                              : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                                            }` 
                                          : `${theme === 'dark'
                                              ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                            }`
                                        }
                                      `}
                                    >
                                      <subItem.icon 
                                        size={16} 
                                        className={`
                                          flex-shrink-0 transition-colors
                                          ${subActive ? 'text-white' : 'text-gray-500'}
                                        `}
                                      />
                                      <span className="text-sm font-medium text-right flex-1 truncate">
                                        {subItem.title}
                                      </span>
                                    </NavLink>
                                  </SidebarMenuButton>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={`
                          w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg
                          transition-all duration-200 group relative py-4
                          ${active 
                            ? `${theme === 'dark'
                                ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                                : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                              }` 
                            : `${theme === 'dark'
                                ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                              }`
                          }
                        `}
                      >
                        <item.icon 
                          size={20} 
                          className={`
                            flex-shrink-0 transition-colors
                            ${active ? 'text-white' : item.color}
                          `}
                        />
                        {!isCollapsed && (
                          <span className="font-medium text-right flex-1 truncate">
                            {item.title}
                          </span>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className={`
                            absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm 
                            rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                            pointer-events-none whitespace-nowrap z-50
                          `}>
                            {item.title}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {!isCollapsed && user?.role === "ADMIN" && "الإدارة"}
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-2">
            {getFilteredManagementItems().map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.id);
              const active = item.url ? isActive(item.url) : false;
              
              return (
                <SidebarMenuItem key={item.id}>
                  {hasSubItems ? (
                    <>
                      <SidebarMenuButton 
                        onClick={() => toggleExpanded(item.id)}
                        className={`
                          w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg
                          transition-all duration-200 group relative cursor-pointer
                          ${theme === 'dark'
                            ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                            : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                          }
                        `}
                      >
                        <item.icon 
                          size={20} 
                          className={`flex-shrink-0 transition-colors ${item.color}`}
                        />
                        {!isCollapsed && (
                          <>
                            <span className="font-medium text-right flex-1 truncate">
                              {item.title}
                            </span>
                            <ChevronDown 
                              size={16} 
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className={`
                            absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm 
                            rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                            pointer-events-none whitespace-nowrap z-50
                          `}>
                            {item.title}
                          </div>
                        )}
                      </SidebarMenuButton>
                      
                      {isExpanded && !isCollapsed && (
                        <div className="mr-6 mt-1 space-y-1">
                          {item.subItems.map((subItem) => {
                            const subActive = subItem.url ? isActive(subItem.url) : false;
                            const hasNestedSubItems = subItem.subItems && subItem.subItems.length > 0;
                            const isNestedExpanded = expandedItems.includes(subItem.id);
                            
                            return (
                              <div key={subItem.id}>
                                {hasNestedSubItems ? (
                                  <>
                                    <SidebarMenuButton 
                                      onClick={() => toggleExpanded(subItem.id)}
                                      className={`
                                        w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                        transition-all duration-200 group relative cursor-pointer
                                        ${theme === 'dark'
                                          ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                        }
                                      `}
                                    >
                                      <subItem.icon 
                                        size={16} 
                                        className="flex-shrink-0 transition-colors text-gray-500"
                                      />
                                      <span className="text-sm font-medium text-right flex-1 truncate">
                                        {subItem.title}
                                      </span>
                                      <ChevronDown 
                                        size={14} 
                                        className={`transition-transform duration-200 ${isNestedExpanded ? 'rotate-180' : ''}`}
                                      />
                                    </SidebarMenuButton>
                                    
                                    {isNestedExpanded && (
                                      <div className="mr-4 mt-1 space-y-1">
                                        {subItem.subItems.map((nestedItem) => {
                                          const nestedActive = isActive(nestedItem.url);
                                          return (
                                            <SidebarMenuButton key={nestedItem.id} asChild>
                                              <NavLink 
                                                to={nestedItem.url} 
                                                end 
                                                className={`
                                                  w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                                  transition-all duration-200 group relative
                                                  ${nestedActive 
                                                    ? `${theme === 'dark'
                                                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                                                        : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                                                      }` 
                                                    : `${theme === 'dark'
                                                        ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                                      }`
                                                  }
                                                `}
                                              >
                                                <nestedItem.icon 
                                                  size={14} 
                                                  className={`
                                                    flex-shrink-0 transition-colors
                                                    ${nestedActive ? 'text-white' : 'text-gray-400'}
                                                  `}
                                                />
                                                <span className="text-xs font-medium text-right flex-1 truncate">
                                                  {nestedItem.title}
                                                </span>
                                              </NavLink>
                                            </SidebarMenuButton>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <SidebarMenuButton asChild>
                                    <NavLink 
                                      to={subItem.url} 
                                      end 
                                      className={`
                                        w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                        transition-all duration-200 group relative
                                        ${subActive 
                                          ? `${theme === 'dark'
                                              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                                              : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                                            }` 
                                          : `${theme === 'dark'
                                              ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                            }`
                                        }
                                      `}
                                    >
                                      <subItem.icon 
                                        size={16} 
                                        className={`
                                          flex-shrink-0 transition-colors
                                          ${subActive ? 'text-white' : 'text-gray-500'}
                                        `}
                                      />
                                      <span className="text-sm font-medium text-right flex-1 truncate">
                                        {subItem.title}
                                      </span>
                                    </NavLink>
                                  </SidebarMenuButton>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={`
                          w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg
                          transition-all duration-200 group relative
                          ${active 
                            ? `${theme === 'dark'
                                ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg py-3' 
                                : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md py-3'
                              }` 
                            : `${theme === 'dark'
                                ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                              }`
                          }
                        `}
                      >
                        <item.icon 
                          size={20} 
                          className={`
                            flex-shrink-0 transition-colors
                            ${active ? 'text-white' : item.color}
                          `}
                        />
                        {!isCollapsed && (
                          <span className="font-medium text-right flex-1 truncate">
                            {item.title}
                          </span>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className={`
                            absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm 
                            rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                            pointer-events-none whitespace-nowrap z-50
                          `}>
                            {item.title}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`
            w-full flex items-center space-x-3 rtl:space-x-reverse p-3 
            rounded-lg transition-colors
            ${theme === 'dark' 
              ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
            }
          `}
          size="default"
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-amber-500" />
          ) : (
            <Moon size={20} className="text-blue-500" />
          )}
          {!isCollapsed && (
            <span className="font-medium">
              {theme === "dark" ? "الوضع المضيء" : "الوضع المظلم"}
            </span>
          )}
        </Button>
        
        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`
            w-full flex items-center space-x-3 rtl:space-x-reverse p-3 
            rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
          `}
          size="default"
        >
          <LogOut size={20} className="text-red-500" />
          {!isCollapsed && (
            <span className="font-medium">
              تسجيل الخروج
            </span>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}