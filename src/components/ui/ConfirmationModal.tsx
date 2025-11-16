import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'approve' | 'reject';
  isLoading?: boolean;
  requestDetails?: {
    _id: string;
    doctor?: {
      drName: string;
      organizationName: string;
    };
    activityType?: {
      arabic: string;
      name: string;
    };
    cost?: number;
    notes: string;
    createdBy?: {
      firstName: string;
      lastName: string;
      username: string;
    };
    status: string;
  } | null;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  isLoading = false,
  requestDetails
}) => {
  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
    }
    
    switch (type) {
      case 'approve':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'reject':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'approve':
        return 'default';
      case 'reject':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getTitle = () => {
    return type === 'approve' ? 'تأكيد الموافقة' : 'تأكيد الرفض';
  };

  const getDescription = () => {
    return type === 'approve' 
      ? 'هل أنت متأكد من موافقتك على هذا الطلب؟'
      : 'هل أنت متأكد من رفضك لهذا الطلب؟';
  };

  const getConfirmText = () => {
    return type === 'approve' ? 'موافق' : 'رفض';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <DialogTitle className="text-lg font-semibold">{getTitle()}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {requestDetails && (
          <div className="space-y-3 py-4 border-t border-b">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">الطبيب:</span>
                <p className="font-medium">{requestDetails.doctor?.drName || 'غير محدد'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">المندوب:</span>
                <p className="font-medium">
                  {requestDetails.createdBy ? 
                    `${requestDetails.createdBy.firstName} ${requestDetails.createdBy.lastName}` : 
                    'غير محدد'
                  }
                </p>
              </div>
            </div>
            
            <div>
              <span className="font-medium text-muted-foreground text-sm">نوع النشاط:</span>
              <p className="font-medium">{requestDetails.activityType?.arabic || 'غير محدد'}</p>
            </div>
            
            <div>
              <span className="font-medium text-muted-foreground text-sm">التكلفة:</span>
              <Badge variant="outline" className="font-medium">
                {requestDetails.cost || 0} د.ل
              </Badge>
            </div>
            
            {requestDetails.notes && (
              <div>
                <span className="font-medium text-muted-foreground text-sm">الملاحظات:</span>
                <p className="text-sm bg-muted p-2 rounded-md mt-1">
                  {requestDetails.notes}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              getConfirmText()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;