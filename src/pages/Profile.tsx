import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Shield,
  Users,
  MapPin,
  Calendar,
  Clock,
  Edit,
  Settings,
  LogOut,
  Crown,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { getSupervisorTeam, SupervisorTeamMember } from '@/api/Supervisor';
import { useToast } from '@/hooks/use-toast';
import ChangePassword from './ChangePassword';

const Profile = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<SupervisorTeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [open, SetOpen] = useState(false)

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchTeamMembers = async () => {
    if (!user || (user.role !== 'SUPERVISOR' && user.role !== 'SALES_SUPERVISOR')) {
      return;
    }

    setLoadingTeam(true);
    try {
       const response = await getSupervisorTeam(user._id);
       if (response.success) {
         setTeamMembers(response.data.team.members);
       } else {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل بيانات الفريق',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل بيانات الفريق',
        variant: 'destructive',
      });
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleropenModal=()=>{
    SetOpen(true)
  }

  useEffect(() => {
    fetchTeamMembers();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">لا توجد بيانات مستخدم</h2>
          <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول أولاً</p>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MEDICAL REP':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SUPERVISOR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTeamColor = (team: string) => {
    switch (team) {
      case 'TEAM A':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TEAM B':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'TEAM C':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory'
    });
  };

   
  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}`;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">الملف الشخصي</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">إدارة معلوماتك الشخصية وإعداداتك</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button onClick={handleropenModal} variant="outline" size="sm" className="gap-2 w-full sm:w-auto bg-indigo-600 text-white">
              <Edit className="h-4 w-4" />
              تعديل كلمة المرور
            </Button>
   
            <Button variant="destructive" size="sm" className="gap-2 w-full sm:w-auto" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 order-1 lg:order-none">
          <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="pt-4 sm:pt-6">
              <div className="relative inline-block mb-4">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto border-4 border-white shadow-lg">
                  <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                {user.firstName} {user.lastName !== '-' ? user.lastName : ''}
              </h2>
              
              <p className="text-muted-foreground mb-3 text-sm sm:text-base">@{user.username}</p>
              
              <div className="flex flex-col gap-2 items-center">
                <Badge className={`${getRoleColor(user.role)} font-medium px-3 py-1 text-xs sm:text-sm`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
                
                {user.isActive && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 font-medium px-3 py-1 text-xs sm:text-sm">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    نشط
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Information */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-none">
          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">الاسم الأول</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm sm:text-base">{user.firstName}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">الاسم الأخير</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm sm:text-base">{user.lastName !== '-' ? user.lastName : 'غير محدد'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">اسم المستخدم</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm sm:text-base">{user.username}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">معرف المستخدم</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-mono text-xs sm:text-sm break-all">{user._id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                معلومات العمل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">المنتجات</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <Badge className={`${getTeamColor(user.teamProducts)} font-medium text-xs sm:text-sm`}>
                      <Users className="h-3 w-3 mr-1" />
                      {user.teamProducts}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">المنطقة</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 font-medium text-xs sm:text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user.teamArea}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Information */}
          {user.supervisor && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  معلومات المشرف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <Avatar className="h-12 w-12 border-2 border-purple-200 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold">
                      {getInitials(user.supervisor.firstName, user.supervisor.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center sm:text-right">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">
                      {user.supervisor.firstName} {user.supervisor.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{user.supervisor.username}</p>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs mt-1">
                      {user.supervisor.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members - Only for Supervisors */}
          {(user.role === 'SUPERVISOR' || user.role === 'SALES_SUPERVISOR') && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    أعضاء الفريق
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {teamMembers.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTeam ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : teamMembers.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {teamMembers.map((member) => (
                      <div key={member._id} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-3 bg-muted rounded-lg border">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0 text-center sm:text-right">
                          <h4 className="font-medium text-foreground text-sm sm:text-base">
                            {member.firstName} {member.lastName !== '-' ? member.lastName : ''}
                          </h4>
                          <p className="text-sm text-muted-foreground break-all">@{member.username}</p>
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mt-1">
                            <Badge className={`${getRoleColor(member.role)} text-xs`}>
                              {member.role}
                            </Badge>
                            {member.isActive && (
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600">نشط</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm sm:text-base">لا يوجد أعضاء في الفريق</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Account Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                معلومات الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    تاريخ الإنشاء
                  </label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    آخر تحديث
                  </label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ChangePassword open={open} onOpenChange={SetOpen} />
    </div>
  );
};

export default Profile;