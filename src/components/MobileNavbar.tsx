import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  Home, 
  ShoppingCart, 
  Pill, 
  DollarSign, 
  Building2, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  User, 
  CalendarPlus,
  UserCheck,
  Stars,
  Package
} from 'lucide-react';

interface MobileNavItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color?: string;
}

export function MobileNavbar() {
  const { user } = useAuthStore();
  const location = useLocation();

  // Get filtered navigation items based on user role
  const getMobileNavItems = (): MobileNavItem[] => {
    if (user?.role === "ORDERS OFFICERS") {
      return [
        { 
          id: "orders-collector", 
          title: "محصل الطلبيات", 
          url: "/orders-collector",
          icon: ShoppingCart, 
          color: "text-orange-500"
        },
        { 
          id: "profile", 
          title: "الملف الشخصي", 
          url: "/profile", 
          icon: User, 
          color: "text-blue-500" 
        }
      ];
    }

    if (user?.role === "SALES SUPERVISOR" || user?.role === "FINANCIAL MANAGER" || user?.role === "ASSITANT" || user?.role === "GENERAL MANAGER") {
      return [
        { 
          id: "dashboards", 
          title: "لوحة التحكم", 
          url: "/dashboards/admin",
          icon: Pill, 
          color: "text-teal-500"
        },
        { 
          id: "money-collection", 
          title: "تحصيل المال", 
          url: "/financial-collector/money-collection", 
          icon: DollarSign,
          color: "text-green-500"
        },
        { 
          id: "orders-collection", 
          title: "تحصيل الطلبيات", 
          url: "/financial-collector/orders-collection", 
          icon: ShoppingCart,
          color: "text-orange-500"
        },
        { 
          id: "profile", 
          title: "الملف الشخصي", 
          url: "/profile", 
          icon: User, 
          color: "text-blue-500" 
        }
      ];
    }

    if (user?.role === "FINANCIAL OFFICER") {
      return [
        { 
          id: "dashboards", 
          title: "لوحة التحكم", 
          url: "/dashboards/admin",
          icon: Pill, 
          color: "text-teal-500"
        },
        { 
          id: "money-collection", 
          title: "تحصيل المال", 
          url: "/financial-collector/money-collection", 
          icon: DollarSign,
          color: "text-green-500"
        },
        { 
          id: "orders-collection", 
          title: "تحصيل الطلبيات", 
          url: "/financial-collector/orders-collection", 
          icon: ShoppingCart,
          color: "text-orange-500"
        },
        { 
          id: "profile", 
          title: "الملف الشخصي", 
          url: "/profile", 
          icon: User, 
          color: "text-blue-500" 
        }
      ];
    }

    if (user?.role === "SALES_REP" || user?.role === "SALES REP") {
      return [
        {
          id: "visits-pharmacy-reports",
          title: "زيارات الصيدليات",
          url: "/visits/pharmacy",
          icon: Pill,
          color: "text-pink-500"
        },
        { 
          id: "dashboards", 
          title: "لوحة التحكم", 
          url: "/dashboards/pharmacies",
          icon: BarChart3, 
          color: "text-teal-500"
        },
        { 
          id: "sales-clients", 
          title: "عملاء المبيعات", 
          url: "/sales-clients", 
          icon: UserCheck, 
          color: "text-blue-600" 
        },
        { 
          id: "profile", 
          title: "الملف الشخصي", 
          url: "/profile", 
          icon: User, 
          color: "text-blue-500" 
        }
      ];
    }

    if (user?.role === "MEDICAL REP" || user?.role === "medical rep") {
      return [
        { 
          id: "create-visit", 
          title: "تسجيل زيارة", 
          url: "/create-visit", 
          icon: CalendarPlus,
          color: "text-green-500"
        },
        { 
          id: "clinic-analytics", 
          title: "لوحة التحكم", 
          url: "/analytics/clinics", 
          icon: Building2,
          color: "text-purple-500"
        },
        { 
          id: "sample-request", 
          title: "طلب عينات", 
          url: "/sample-request", 
          icon: Package,
          color: "text-orange-500"
        },
        { 
          id: "profile", 
          title: "الملف الشخصي", 
          url: "/profile", 
          icon: User, 
          color: "text-blue-500" 
        }
      ];
    }

    if (user?.role === "ADMIN") {
      return [
        { 
          id: "home", 
          title: "الرئيسية", 
          url: "/", 
          icon: Home, 
          color: "text-blue-500" 
        },
        { 
          id: "admin-dashboard", 
          title: "لوحة التحكم", 
          url: "/dashboards/admin", 
          icon: BarChart3,  
          color: "text-teal-500"
        },
        { 
          id: "sample-requests", 
          title: "طلبات العينات", 
          url: "/admin/sample-requests", 
          icon: Package,
          color: "text-purple-500"
        },
        { 
          id: "profile", 
          title: "الملف الشخصي", 
          url: "/profile", 
          icon: User, 
          color: "text-blue-500" 
        }
      ];
    }

    if (user?.role === "SUPERVISOR") {
      return [
        { 
          id: "clinic-analytics", 
          title: "لوحة التحكم", 
          url: "/analytics/clinics/supervisor", 
          icon: Building2,
          color: "text-purple-500"
        },
        { 
          id: "sample-requests", 
          title: "طلبات العينات", 
          url: "/supervisor/sample-requests", 
          icon: Package,
          color: "text-orange-500"
        },
        { 
          id: "medical-coach", 
          title: "تقييم المندوب", 
          url: "/Medical-coah", 
          icon: Stars, 
          color: "text-yellow-500" 
        },
        { 
          id: "profile", 
          title: "الملف الشخصي", 
          url: "/profile", 
          icon: User, 
          color: "text-blue-500" 
        }
      ];
    }

    // Default fallback
    return [
      { 
        id: "home", 
        title: "الرئيسية", 
        url: "/", 
        icon: Home, 
        color: "text-blue-500" 
      },
      { 
        id: "profile", 
        title: "الملف الشخصي", 
        url: "/profile", 
        icon: User, 
        color: "text-blue-500" 
      }
    ];
  };

  const navItems = getMobileNavItems();
  const isActive = (path: string) => location.pathname === path;

  // Only show on mobile screens
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50  bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.url);
          const IconComponent = item.icon;
          
          return (
            <NavLink
              key={item.id}
              to={item.url}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200
                min-w-0 flex-1 max-w-[80px]
                ${active 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              <IconComponent 
                size={20} 
                className={`
                  mb-1 transition-colors duration-200
                  ${active 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : item.color || 'text-gray-500 dark:text-gray-400'
                  }
                `}
              />
              <span className={`
                text-xs font-medium text-center leading-tight truncate w-full
                ${active 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400'
                }
              `}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}