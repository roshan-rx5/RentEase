import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CustomerLayout from "@/components/layout/customer-layout";
import BookingForm from "@/components/forms/booking-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ProductWithCategory } from "@shared/schema";

export default function CustomerBooking() {
  const { productId } = useParams<{ productId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [bookingData, setBookingData] = useState<any>(null);

  // Parse URL parameters for pre-selected dates
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedDates = {
    from: urlParams.get('startDate') ? new Date(urlParams.get('startDate')!) : undefined,
    to: urlParams.get('endDate') ? new Date(urlParams.get('endDate')!) : undefined,
  };

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

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["/api/products", productId],
    enabled: !!productId && isAuthenticated,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order created successfully! Proceeding to payment...",
      });
      setLocation(`/checkout/${order.id}`);
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
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (productLoading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </CustomerLayout>
    );
  }

  if (!product) {
    return (
      <CustomerLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-6xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation("/catalog")}>
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Catalog
            </Button>
          </CardContent>
        </Card>
      </CustomerLayout>
    );
  }

  const handleBookingSubmit = (data: any) => {
    setBookingData(data);
    
    // Calculate total amount based on duration and rates
    const duration = Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24));
    let unitRate = 0;
    
    if (duration <= 1 && product?.hourlyRate) {
      // Calculate hourly rate for same day rentals
      const hours = Math.max(1, Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60)));
      unitRate = Number(product.hourlyRate) * hours;
    } else if (duration <= 7 && product?.dailyRate) {
      unitRate = Number(product.dailyRate) * duration;
    } else if (duration <= 30 && product?.weeklyRate) {
      const weeks = Math.ceil(duration / 7);
      unitRate = Number(product.weeklyRate) * weeks;
    } else if (product?.monthlyRate) {
      const months = Math.ceil(duration / 30);
      unitRate = Number(product.monthlyRate) * months;
    } else if (product?.dailyRate) {
      unitRate = Number(product.dailyRate) * duration;
    }

    const totalAmount = unitRate * data.quantity;
    const securityDeposit = product?.securityDeposit ? Number(product.securityDeposit) : 0;

    const orderData = {
      startDate: data.startDate,
      endDate: data.endDate,
      totalAmount: totalAmount + securityDeposit,
      securityDeposit,
      pickupAddress: data.pickupAddress,
      returnAddress: data.returnAddress,
      notes: data.notes,
      items: [{
        productId: product?.id || "",
        quantity: data.quantity,
        unitRate,
        totalAmount,
      }],
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setLocation("/catalog")}>
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Catalog
        </Button>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{product?.name}</CardTitle>
                <p className="text-gray-600 mt-2">{product?.description}</p>
                {product?.category && (
                  <Badge variant="secondary" className="mt-2">
                    {product?.category?.name}
                  </Badge>
                )}
              </div>
              <Badge 
                variant={product?.availableQuantity && product.availableQuantity > 0 ? "default" : "destructive"}
              >
                {product?.availableQuantity && product.availableQuantity > 0 
                  ? `${product.availableQuantity} Available` 
                  : "Out of Stock"
                }
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Pricing */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product?.hourlyRate && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{Number(product?.hourlyRate || 0)}
                    </div>
                    <div className="text-sm text-gray-600">per hour</div>
                  </div>
                )}
                {product?.dailyRate && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{Number(product?.dailyRate || 0)}
                    </div>
                    <div className="text-sm text-gray-600">per day</div>
                  </div>
                )}
                {product?.weeklyRate && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{Number(product?.weeklyRate || 0)}
                    </div>
                    <div className="text-sm text-gray-600">per week</div>
                  </div>
                )}
                {product.monthlyRate && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{Number(product.monthlyRate)}
                    </div>
                    <div className="text-sm text-gray-600">per month</div>
                  </div>
                )}
              </div>
              {product.securityDeposit && (
                <>
                  <Separator className="my-4" />
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{Number(product.securityDeposit)}
                    </div>
                    <div className="text-sm text-gray-600">security deposit (refundable)</div>
                  </div>
                </>
              )}
            </div>

            {/* Booking Form */}
            <BookingForm
              product={product}
              onSubmit={handleBookingSubmit}
              isLoading={createOrderMutation.isPending}
              preSelectedDates={preSelectedDates}
            />
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
