// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { 
//   Activity, 
//   Users, 
//   ShoppingCart, 
//   DollarSign, 
//   TrendingUp, 
//   Calendar,
//   ArrowRight,
//   BarChart3,
//   Clock
// } from "lucide-react";

// const Index = () => {
//   const quickStats = [
//     {
//       title: "زيارات اليوم",
//       value: "24",
//       change: "+12%",
//       icon: Users,
//       color: "text-primary"
//     },
//     {
//       title: "طلبات جديدة", 
//       value: "8",
//       change: "+25%",
//       icon: ShoppingCart,
//       color: "text-success"
//     },
//     {
//       title: "مبيعات الأسبوع",
//       value: "₹12,450",
//       change: "+8.2%", 
//       icon: DollarSign,
//       color: "text-warning"
//     },
//     {
//       title: "معدل الأداء",
//       value: "94.5%",
//       change: "+5.1%",
//       icon: Activity,
//       color: "text-primary-light"
//     }
//   ];

//   const recentActivities = [
//     "زيارة جديدة للدكتور أحمد محمد",
//     "طلب جديد من صيدلية النور",
//     "تحديث تقييم العميل مصطفى",
//     "مراجعة تقرير المبيعات الشهري"
//   ];

//   return (
//     <div className="space-y-8" style={{ direction: 'rtl' }}>
//       {/* Hero Section */}
//       <div className="relative overflow-hidden rounded-2xl bg-gradient-medical p-8 text-white shadow-medical">
//         <div className="relative z-10">
//           <h1 className="text-4xl font-bold mb-4">
//             مرحباً بك في نظام المندوبين الطبيين
//           </h1>
//           <p className="text-xl mb-6 opacity-90">
//             إدارة شاملة وفعالة لجميع أنشطة المندوبين والزيارات والمبيعات
//           </p>
//           <div className="flex gap-4">
//             <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
//               <BarChart3 className="ml-2 w-5 h-5" />
//               عرض التقارير
//             </Button>
//             <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
//               <Users className="ml-2 w-5 h-5" />
//               إدارة الزيارات
//             </Button>
//           </div>
//         </div>
//         <div className="absolute top-0 left-0 w-full h-full opacity-10">
//           <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
//           <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
//         </div>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {quickStats.map((stat, index) => (
//           <Card key={index} className="p-6 bg-gradient-card shadow-card-medical hover:shadow-medical transition-all duration-300 border-0">
//             <div className="flex items-center justify-between">
//               <div className="space-y-2">
//                 <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
//                 <div className="flex items-center gap-2">
//                   <p className="text-3xl font-bold text-foreground">{stat.value}</p>
//                   <Badge variant="secondary" className="text-xs bg-success/10 text-success border-0">
//                     {stat.change}
//                   </Badge>
//                 </div>
//               </div>
//               <div className={`p-4 rounded-xl bg-primary/10 ${stat.color}`}>
//                 <stat.icon className="w-7 h-7" />
//               </div>
//             </div>
//           </Card>
//         ))}
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Recent Activities */}
//         <div className="lg:col-span-2">
//           <Card className="p-6 bg-gradient-card shadow-card-medical border-0">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <Clock className="w-5 h-5 text-primary" />
//                 <h3 className="text-xl font-semibold">الأنشطة الأخيرة</h3>
//               </div>
//               <Button variant="ghost" size="sm">
//                 عرض الكل
//                 <ArrowRight className="mr-2 w-4 h-4" />
//               </Button>
//             </div>
//             <div className="space-y-4">
//               {recentActivities.map((activity, index) => (
//                 <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
//                   <div className="w-2 h-2 bg-primary rounded-full"></div>
//                   <span className="font-medium flex-1">{activity}</span>
//                   <span className="text-sm text-muted-foreground">منذ {index + 1} ساعة</span>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         </div>

//         {/* Quick Actions */}
//         <Card className="p-6 bg-gradient-card shadow-card-medical border-0">
//           <div className="flex items-center gap-3 mb-6">
//             <TrendingUp className="w-5 h-5 text-primary" />
//             <h3 className="text-xl font-semibold">إجراءات سريعة</h3>
//           </div>
//           <div className="space-y-3">
//             <Button className="w-full justify-start bg-primary hover:bg-primary-dark text-white">
//               <Users className="ml-2 w-5 h-5" />
//               زيارة جديدة
//             </Button>
//             <Button variant="outline" className="w-full justify-start">
//               <ShoppingCart className="ml-2 w-5 h-5" />
//               طلب جديد
//             </Button>
//             <Button variant="outline" className="w-full justify-start">
//               <BarChart3 className="ml-2 w-5 h-5" />
//               تقرير يومي
//             </Button>
//             <Button variant="outline" className="w-full justify-start">
//               <Calendar className="ml-2 w-5 h-5" />
//               جدولة موعد
//             </Button>
//           </div>
//         </Card>
//       </div>

//       {/* Progress Overview */}
//       <Card className="p-6 bg-gradient-card shadow-card-medical border-0">
//         <div className="flex items-center gap-3 mb-6">
//           <BarChart3 className="w-5 h-5 text-primary" />
//           <h3 className="text-xl font-semibold">نظرة عامة على الأداء</h3>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="space-y-3">
//             <div className="flex justify-between items-center">
//               <span className="text-sm font-medium">هدف الزيارات الشهرية</span>
//               <span className="text-sm text-muted-foreground">78%</span>
//             </div>
//             <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
//               <div className="w-3/4 h-full bg-gradient-medical transition-all duration-300"></div>
//             </div>
//           </div>
//           <div className="space-y-3">
//             <div className="flex justify-between items-center">
//               <span className="text-sm font-medium">هدف المبيعات</span>
//               <span className="text-sm text-muted-foreground">85%</span>
//             </div>
//             <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
//               <div className="w-5/6 h-full bg-gradient-medical transition-all duration-300"></div>
//             </div>
//           </div>
//           <div className="space-y-3">
//             <div className="flex justify-between items-center">
//               <span className="text-sm font-medium">رضا العملاء</span>
//               <span className="text-sm text-muted-foreground">92%</span>
//             </div>
//             <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
//               <div className="w-11/12 h-full bg-gradient-medical transition-all duration-300"></div>
//             </div>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default Index;
import React from 'react'

function Index() {
  return (
    <div>Index</div>
  )
}

export default Index