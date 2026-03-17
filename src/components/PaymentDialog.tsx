import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Loader2, CreditCard, Building2, Wallet } from 'lucide-react';
import { usePayment } from '../context/PaymentContext';
import { useAuth } from '../context/AuthContext';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: number;
  resourceName: string;
  amount: number;
  sellerId: string;
  sellerEmail: string;
}

export const PaymentDialog = ({
  open,
  onOpenChange,
  resourceId,
  resourceName,
  amount,
  sellerId,
  sellerEmail,
}: PaymentDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'bank'>('esewa');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    accountHolder: '',
    bankName: '',
  });

  const { initiatePayment } = usePayment();
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) return;

    setProcessing(true);
    setPaymentStatus('idle');

    try {
      const result = await initiatePayment(
        resourceId,
        resourceName,
        sellerId,
        sellerEmail,
        amount,
        paymentMethod,
        user.id,
        user.email
      );

      if (result.success) {
        setPaymentStatus('success');
        setTransactionId(result.transactionId || '');
        setTimeout(() => {
          onOpenChange(false);
          // Reset state after closing
          setTimeout(() => {
            setPaymentStatus('idle');
            setTransactionId('');
          }, 300);
        }, 3000);
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
    } finally {
      setProcessing(false);
    }
  };

  const resetDialog = () => {
    setPaymentMethod('esewa');
    setPaymentStatus('idle');
    setTransactionId('');
    setBankDetails({ accountNumber: '', accountHolder: '', bankName: '' });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Resource</DialogTitle>
          <DialogDescription>
            Complete payment to access "{resourceName}"
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === 'idle' && (
          <div className="space-y-6">
            {/* Amount Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Resource</span>
                <span className="text-sm font-medium">{resourceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-lg font-bold text-blue-600">NPR {amount}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <Label className="mb-3 block">Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="space-y-3">
                  {/* eSewa */}
                  <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: paymentMethod === 'esewa' ? '#60A05B' : '#e5e7eb' }}>
                    <RadioGroupItem value="esewa" id="esewa" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-green-100 p-2 rounded">
                        <Wallet className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">eSewa</div>
                        <div className="text-xs text-gray-500">Digital wallet payment</div>
                      </div>
                    </div>
                  </label>

                  {/* Khalti */}
                  <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: paymentMethod === 'khalti' ? '#5C2D91' : '#e5e7eb' }}>
                    <RadioGroupItem value="khalti" id="khalti" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-purple-100 p-2 rounded">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">Khalti</div>
                        <div className="text-xs text-gray-500">Mobile & web wallet</div>
                      </div>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: paymentMethod === 'bank' ? '#3b82f6' : '#e5e7eb' }}>
                    <RadioGroupItem value="bank" id="bank" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-blue-100 p-2 rounded">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-xs text-gray-500">Direct bank payment</div>
                      </div>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Bank Transfer Details (shown when bank is selected) */}
            {paymentMethod === 'bank' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-sm text-blue-900">Enter Bank Details</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="bankName" className="text-sm">Bank Name</Label>
                    <Input
                      id="bankName"
                      placeholder="e.g., Nepal Bank Limited"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountHolder" className="text-sm">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      placeholder="Your name"
                      value={bankDetails.accountHolder}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolder: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber" className="text-sm">Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="Enter account number"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay NPR {amount}</>
                )}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {paymentStatus === 'success' && (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">
              Your payment has been processed successfully.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-1">Transaction ID</div>
              <div className="font-mono text-sm font-medium">{transactionId}</div>
            </div>
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                You can now access the resource from your dashboard
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Failed State */}
        {paymentStatus === 'failed' && (
          <div className="py-8 text-center">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment. Please try again.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setPaymentStatus('idle')} className="flex-1">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
