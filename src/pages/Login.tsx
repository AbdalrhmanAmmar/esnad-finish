import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';
import { useMedicalRepStore } from '@/stores/medicalRepStore';
import { loginUser } from '@/api/api';
import { getMedicalRepData } from '@/api/MedicalRep';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuthStore();
  const { setData } = useMedicalRepStore();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await loginUser(username.trim(), password);
      
      if (response.success) {
        console.log('Login response:', response);
        console.log('User data:', response.data.user);
        console.log('Token:', response.data.token);
        
        // Store user data and token
        login(response.data.user, response.data.token);
        
        // Check if data was stored
        console.log('Auth store after login:', { user, isAuthenticated });
        
        // If user is a medical rep, load their data automatically
        if (response.data.user.role === 'MEDICAL REP' || response.data.user.role === 'medical rep') {
          try {
            const medicalRepData = await getMedicalRepData(response.data.user._id);
            if (medicalRepData.success) {
              setData(medicalRepData.data.doctors, medicalRepData.data.products);
              toast.success('تم تسجيل الدخول وتحميل البيانات بنجاح!');
            } else {
              toast.success('تم تسجيل الدخول بنجاح!');
              toast.error('فشل في تحميل البيانات، يرجى زيارة صفحة بياناتي');
            }
          } catch (error) {
            console.error('Error loading medical rep data:', error);
            toast.success('تم تسجيل الدخول بنجاح!');
            toast.error('فشل في تحميل البيانات، يرجى زيارة صفحة بياناتي');
          }
        } else {
          toast.success('تم تسجيل الدخول بنجاح!');
        }
        
        // Redirect to profile page
        navigate('/profile', { replace: true });
      } else {
        setError(response.message || 'فشل في تسجيل الدخول');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'حدث خطأ أثناء تسجيل الدخول');
      toast.error(error.message || 'فشل في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-4">
            <LogIn className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            تسجيل الدخول
          </h1>
          <p className="text-muted-foreground">
            مرحباً بك في نظام إدارة المندوبين الطبيين
          </p>
        </div>

        {/* Login Card */}
        <Card className="border shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-card-foreground">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              أدخل بيانات الدخول الخاصة بك
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-right text-foreground font-medium">
                  اسم المستخدم
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 pr-4 h-12 border-input focus:border-primary focus:ring-primary text-right"
                    placeholder="أدخل اسم المستخدم"
                    disabled={isLoading}
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-right text-foreground font-medium">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-input focus:border-primary focus:ring-primary text-right"
                    placeholder="أدخل كلمة المرور"
                    disabled={isLoading}
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <LogIn className="w-5 h-5" />
                    <span>تسجيل الدخول</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 نظام إدارة المندوبين الطبيين. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;