import { useState, useEffect } from 'react';
import { useLocation, useRouter } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CreditCard, Shield, ArrowLeft, CheckCircle } from 'lucide-react';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface PaymentFormProps {
  invoiceId: string;
  amount: number;
  paymentType: 'full' | 'partial';
  onSuccess: () => void;
}

function PaymentForm({ invoiceId, amount, paymentType, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Create payment intent
    apiRequest(`/api/invoices/${invoiceId}/pay`, 'POST', {
      amount,
      paymentType
    })
      .then(res => res.json())
      .then(data => {
        setClientSecret(data.clientSecret);
      })
      .catch(error => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to initialize payment',
          variant: 'destructive'
        });
      });
  }, [invoiceId, amount, paymentType, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    const card = elements.getElement(CardElement);
    if (!card) {
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      }
    });

    if (error) {
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive'
      });
    } else if (paymentIntent?.status === 'succeeded') {
      toast({
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully.',
      });
      onSuccess();
    }

    setLoading(false);
  };

  const cardOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <CardElement options={cardOptions} />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Secure Payment</h4>
            <p className="text-sm text-blue-700">
              Your payment information is encrypted and secure.
            </p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing Payment...
          </div>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ₹{amount.toLocaleString()}
          </>
        )}
      </Button>
    </form>
  );
}

export default function InvoicePayment() {
  const [location] = useLocation();
  const [, navigate] = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();

  // Extract invoice ID from URL
  const invoiceId = location.split('/').pop();

  useEffect(() => {
    if (invoiceId) {
      apiRequest('GET', `/api/invoices/${invoiceId}`)
        .then(res => res.json())
        .then(setInvoice)
        .catch(error => {
          toast({
            title: 'Error',
            description: 'Failed to load invoice details',
            variant: 'destructive'
          });
          navigate('/');
        });
    }
  }, [invoiceId, navigate, toast]);

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your payment has been processed successfully.
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const outstandingAmount = Number(invoice.totalAmount) - Number(invoice.paidAmount);
  const paymentAmount = paymentType === 'full' ? outstandingAmount : Number(customAmount);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600 mt-2">Complete your invoice payment</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Invoice Number:</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium">{invoice.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">₹{Number(invoice.totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Amount:</span>
                <span className="font-medium text-green-600">₹{Number(invoice.paidAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Outstanding:</span>
                <span className="font-bold text-red-600">₹{outstandingAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!stripePublicKey ? (
                <div className="text-center py-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-900">Payment Configuration Required</h4>
                        <p className="text-sm text-yellow-700">
                          Stripe integration is not configured. Please contact support.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    invoiceId={invoice.id}
                    amount={paymentAmount}
                    paymentType={paymentType}
                    onSuccess={() => setPaymentSuccess(true)}
                  />
                </Elements>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}