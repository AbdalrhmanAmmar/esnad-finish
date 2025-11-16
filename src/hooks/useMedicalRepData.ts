// hooks/useMedicalRepData.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useMedicalRepStore } from '@/stores/medicalRepStore';
import { getMedicalRepData } from '@/api/MedicalRep';
import { useToast } from '@/hooks/use-toast';

export const useMedicalRepData = () => {
  const { user } = useAuthStore();
  const { setData, setLoading, doctors, products, lastFetched, isLoading } = useMedicalRepStore();
  const { toast } = useToast();

  const fetchData = async (forceRefresh = false) => {
    if (!user?._id) return;

    // إذا البيانات موجودة ولم يمر 5 دقائق، لا نحتاج إعادة التحميل
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (!forceRefresh && lastFetched && lastFetched > fiveMinutesAgo) {
      return;
    }

    try {
      setLoading(true);
      const response = await getMedicalRepData(user._id);
      
      if (response.success) {
        setData(response.data.doctors, response.data.products);
      } else {
        throw new Error(response.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching medical rep data:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل البيانات',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id]);

  return {
    doctors,
    products,
    isLoading,
    fetchData: () => fetchData(true),
    hasData: doctors.length > 0 || products.length > 0
  };
};