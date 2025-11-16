import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, LockKeyhole, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { changePassword } from '@/api/auth';

interface ChangePasswordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    // بسيط: طول + تنوع الأحرف
    let score = 0;
    if (newPassword.length >= 8) score += 30;
    if (/[A-Z]/.test(newPassword)) score += 20;
    if (/[a-z]/.test(newPassword)) score += 20;
    if (/[0-9]/.test(newPassword)) score += 15;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 15;
    return Math.min(score, 100);
  }, [newPassword]);

  const strengthLabel = useMemo(() => {
    if (passwordStrength >= 80) return { label: 'قوية', color: 'text-green-700' };
    if (passwordStrength >= 50) return { label: 'متوسطة', color: 'text-yellow-700' };
    if (passwordStrength > 0) return { label: 'ضعيفة', color: 'text-red-700' };
    return { label: '—', color: 'text-muted-foreground' };
  }, [passwordStrength]);

  const hasErrors = useMemo(() => {
    const errors: string[] = [];
    if (!oldPassword) errors.push('يرجى إدخال كلمة المرور القديمة');
    if (!newPassword) errors.push('يرجى إدخال كلمة المرور الجديدة');
    if (newPassword && newPassword.length < 8) errors.push('كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف');
    if (newPassword === oldPassword && newPassword.length > 0) errors.push('كلمة المرور الجديدة لا يجب أن تطابق القديمة');
    if (!confirmPassword) errors.push('يرجى تأكيد كلمة المرور الجديدة');
    if (newPassword && confirmPassword && newPassword !== confirmPassword) errors.push('تأكيد كلمة المرور غير متطابق');
    return { has: errors.length > 0, list: errors };
  }, [oldPassword, newPassword, confirmPassword]);

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors.has) {
      toast({
        title: 'تحقق من الحقول',
        description: 'يرجى تصحيح الأخطاء الموضحة أدناه',
        variant: 'destructive',
      });
      return;
    }
    try {
      setLoading(true);
      const response = await changePassword({
        currentPassword: oldPassword,
        newPassword: newPassword,
      });

      if (response?.success) {
        toast({
          title: 'تم التحديث بنجاح',
          description: response.message || 'تم تغيير كلمة المرور بنجاح',
        });
        resetForm();
        onOpenChange(false);
      } else {
        toast({
          title: 'فشل العملية',
          description: response?.message || 'تعذر تغيير كلمة المرور',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({ title: 'خطأ', description: err?.message || 'فشل تغيير كلمة المرور', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" style={{ direction: 'rtl' }}>
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <LockKeyhole className="h-5 w-5" />
              تعديل كلمة المرور
            </DialogTitle>
            <DialogDescription className="text-indigo-100">
              يرجى إدخال كلمة المرور القديمة ثم الجديدة وتأكيدها
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-white/30">آمن ومشفّر</Badge>
            <ShieldCheck className="h-4 w-4 opacity-80" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          {/* كلمة السر القديمة */}
          <div className="space-y-2">
            <Label htmlFor="oldPassword" className="text-sm font-semibold">كلمة المرور القديمة</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="أدخل كلمة المرور القديمة"
                className="pr-10"
              />
              <button type="button" className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowOld((v) => !v)}>
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* كلمة السر الجديدة */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-semibold">كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                className="pr-10"
              />
              <button type="button" className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew((v) => !v)}>
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* مؤشر قوة كلمة المرور */}
            <div className="mt-2">
              <Progress value={passwordStrength} className="h-2" />
              <p className={`text-xs mt-1 ${strengthLabel.color}`}>قوة كلمة المرور: {strengthLabel.label}</p>
              <p className="text-xs text-muted-foreground">
                المتطلبات: 8 أحرف على الأقل وتشمل حروف كبيرة وصغيرة وأرقام ورمز
              </p>
            </div>
          </div>

          {/* تأكيد كلمة السر الجديدة */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold">تأكيد كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أدخل تأكيد كلمة المرور"
                className="pr-10"
              />
              <button type="button" className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirm((v) => !v)}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* الأخطاء */}
          {hasErrors.has && (
            <div className="rounded-md bg-red-50 text-red-700 p-3 text-sm space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                يرجى تصحيح الأخطاء التالية:
              </div>
              <ul className="list-disc pr-5">
                {hasErrors.list.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => handleClose(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700">
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePassword;