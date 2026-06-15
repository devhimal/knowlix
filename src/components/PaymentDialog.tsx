import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Loader2, CreditCard, Building2, Wallet, Zap } from 'lucide-react';
import { toast } from "sonner"; 
import { usePayment } from '../context/PaymentContext'; 
import { useAuth } from '../context/AuthContext'; 

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId?: string;
  resourceName?: string;
  amount?: number;
  sellerId?: string;
  sellerEmail?: string;
  mode?: 'resource' | 'subscription';
}

const SUBSCRIPTION_PLANS = [
  { id: 'monthly', name: 'Monthly Plan', price: 299, duration: '1 Month', description: 'Perfect for quick exam prep' },
  { id: 'semester', name: 'Semester Plan', price: 999, duration: '6 Months', description: 'Best for full semester coverage' },
  { id: 'annual', name: 'Annual Plan', price: 1599, duration: '12 Months', description: 'Maximum value for serious students' },
];

export const PaymentDialog = ({
  open,
  onOpenChange,
  resourceId,
  resourceName,
  amount: initialAmount,
  sellerId,
  sellerEmail,
  mode = 'subscription',
}: PaymentDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'bank'>('esewa');
  const [selectedPlan, setSelectedPlan] = useState<any>(SUBSCRIPTION_PLANS[1]); 
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    accountHolder: '',
    bankName: '',
  });

  const { purchaseResource, initiateSubscription } = usePayment();
  const { user } = useAuth();

  const finalAmount = mode === 'resource' ? (initialAmount || 0) : selectedPlan.price;

  const handlePayment = async () => {
    if (!user || !user.email) { 
      toast.error("User email is not available. Please log in again.");
      return;
    }

    setProcessing(true);
    setPaymentStatus('idle');

    try {
      let result;
      if (mode === 'resource' && resourceId && resourceName) {
        result = await purchaseResource( 
          resourceId,
          resourceName,
          sellerId || '',
          sellerEmail || '',
          finalAmount,
          paymentMethod,
          user.id,
          user.email
        );
      } else {
        result = await initiateSubscription(
          selectedPlan.id,
          finalAmount,
          paymentMethod,
          user.id,
          user.email
        );

        if (result.success) {
          
          
          
          

          
          
          
          
          
          
          
          console.log("Simulating subscription update for user:", user.id);
        }
      }

      if (result.success) {
        setPaymentStatus('success');
        setTransactionId(result.transactionId || '');
        setTimeout(() => {
          onOpenChange(false);
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'resource' ? 'Purchase Resource' : 'Upgrade to Premium'}</DialogTitle>
          <DialogDescription>
            {mode === 'resource'
              ? `Complete payment to access "${resourceName}"`
              : 'Get unlimited access to all resources, books, and premium features.'}
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === 'idle' && (
          <div className="space-y-6">
            {}
            {mode === 'subscription' && (
              <div className="space-y-3">
                <Label>Select a Plan</Label>
                <div className="grid gap-3">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPlan.id === plan.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-gray-900">{plan.name}</div>
                          <div className="text-xs text-gray-500">{plan.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">NPR {plan.price}</div>
                          <div className="text-[10px] text-gray-400">{plan.duration}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'resource' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Resource</span>
                  <span className="text-sm font-medium">{resourceName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-lg font-bold text-blue-600">NPR {finalAmount}</span>
                </div>
              </div>
            )}

            {}
            <div>
              <Label className="mb-3 block">Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="grid grid-cols-3 gap-2">
                  {}
                  <label className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'esewa' ? 'border-[#60A05B] bg-green-50' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                    <RadioGroupItem value="esewa" id="esewa" className="sr-only" />
                    <Wallet className={`h-6 w-6 mb-1 ${paymentMethod === 'esewa' ? 'text-[#60A05B]' : 'text-gray-400'}`} />
                    <span className="text-xs font-medium">eSewa</span>
                  </label>

                  {}
                  <label className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'khalti' ? 'border-[#5C2D91] bg-purple-50' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                    <RadioGroupItem value="khalti" id="khalti" className="sr-only" />
                    <CreditCard className={`h-6 w-6 mb-1 ${paymentMethod === 'khalti' ? 'text-[#5C2D91]' : 'text-gray-400'}`} />
                    <span className="text-xs font-medium">Khalti</span>
                  </label>

                  {}
                  <label className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'bank' ? 'border-[#3b82f6] bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                    <RadioGroupItem value="bank" id="bank" className="sr-only" />
                    <Building2 className={`h-6 w-6 mb-1 ${paymentMethod === 'bank' ? 'text-[#3b82f6]' : 'text-gray-400'}`} />
                    <span className="text-xs font-medium">Bank</span>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {}
            <div className="pt-2">
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full h-12 text-lg font-semibold"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>{mode === 'resource' ? `Pay NPR ${finalAmount}` : `Subscribe for NPR ${finalAmount}`}</>
                )}
              </Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={processing} className="w-full mt-2 text-gray-500">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {}
        {paymentStatus === 'success' && (
          <div className="py-8 text-center">
            <div className="relative mb-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <Zap className="h-6 w-6 text-yellow-400 absolute bottom-0 right-1/2 translate-x-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {mode === 'resource' ? 'Purchase Successful!' : 'Welcome to Premium!'}
            </h3>
            <p className="text-gray-600 mb-6">
              {mode === 'resource'
                ? 'Your payment has been processed. You can now access the resource.'
                : `You are now a ${selectedPlan.name} member. Enjoy unlimited access!`}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Transaction ID:</span>
                <span className="font-mono font-medium text-gray-900">{transactionId}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Date:</span>
                <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Start Exploring
            </Button>
          </div>
        )}

        {}
        {paymentStatus === 'failed' && (
          <div className="py-8 text-center">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment. Please check your balance and try again.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setPaymentStatus('idle')} className="flex-1">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};