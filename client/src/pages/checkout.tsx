import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CustomerLayout from "@/components/layout/customer-layout";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// Use placeholder Stripe key for development - replace with real key for production
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder';
const stripePromise = loadStripe(stripeKey);

const CheckoutForm = ({ order }: { order: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your payment! Your order has been confirmed.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>
      
      <Button 
        type="submit" 
        disabled={!stripe || !elements}
        size="lg"
        className="w-full bg-primary-500 hover:bg-primary-600"
      >
        <i className="fas fa-lock mr-2"></i>
        Pay Securely - ₹{Number(order.totalAmount).toLocaleString()}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { orderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [clientSecret, setClientSecret] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId && isAuthenticated,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: Number(order?.totalAmount || 0),
        orderId: order?.id || "",
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (order && order?.paymentStatus === 'pending') {
      createPaymentMutation.mutate();
    }
  }, [order]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (orderLoading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-6xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.location.href = "/orders"}>
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </CustomerLayout>
    );
  }

  if (order.paymentStatus === 'paid') {
    return (
      <CustomerLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <i className="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Already Completed</h3>
            <p className="text-gray-600 mb-6">This order has already been paid for.</p>
            <Button onClick={() => window.location.href = "/orders"}>
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </CustomerLayout>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDurationDays = (startDate: string | Date, endDate: string | Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!clientSecret) {
    return (
      <CustomerLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary - {order.orderNumber}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <Badge variant="secondary">{order.status}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Duration:</span>
                  <span>{formatDate(order.startDate)} - {formatDate(order.endDate)} ({getDurationDays(order.startDate, order.endDate)} days)</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>₹{Number(order.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading Payment */}
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {createPaymentMutation.isPending ? "Initializing Payment..." : "Preparing Checkout"}
              </h3>
              <p className="text-gray-600">Please wait while we set up your secure payment.</p>
            </CardContent>
          </Card>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => window.location.href = "/orders"}>
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Orders
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Details - {order.orderNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <Badge variant="secondary">{order.status}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rental Period:</span>
                    <span className="text-right">
                      {formatDate(order.startDate)} - {formatDate(order.endDate)}
                      <br />
                      <small className="text-gray-600">({getDurationDays(order.startDate, order.endDate)} days)</small>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.orderItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ₹{Number(item.unitRate).toLocaleString()}
                        </div>
                      </div>
                      <div className="font-medium">
                        ₹{Number(item.totalAmount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.pickupAddress && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Pickup Address</h5>
                    <p className="text-sm text-gray-600">{order.pickupAddress}</p>
                  </div>
                )}
                {order.returnAddress && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Return Address</h5>
                    <p className="text-sm text-gray-600">{order.returnAddress}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.orderItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product.name} (×{item.quantity})</span>
                      <span>₹{Number(item.totalAmount).toLocaleString()}</span>
                    </div>
                  ))}
                  {order.securityDeposit && Number(order.securityDeposit) > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span>Security Deposit (Refundable)</span>
                        <span>₹{Number(order.securityDeposit).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{Number(order.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm order={order} />
            </Elements>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
