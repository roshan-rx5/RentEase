import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Zap } from "lucide-react";
import { format } from "date-fns";
import LiveAvailability from "./live-availability";

interface QuickRentWidgetProps {
  product: any;
  className?: string;
}

export default function QuickRentWidget({ product, className = "" }: QuickRentWidgetProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const quickRentMutation = useMutation({
    mutationFn: async () => {
      if (!startDate || !endDate) {
        throw new Error("Please select rental dates");
      }

      const orderData = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalAmount: calculateTotal(),
        items: [{
          productId: product.id,
          quantity: quantity,
          unitRate: product.dailyRate || 0,
          totalAmount: calculateItemTotal()
        }]
      };

      const response = await apiRequest("/api/orders", "POST", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order Created Successfully!",
        description: `Order ${order.orderNumber} has been created. Proceed to payment.`,
      });
      
      // Redirect to checkout
      window.location.href = `/checkout/${order.id}`;
    },
    onError: (error: any) => {
      toast({
        title: "Order Creation Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateItemTotal = () => {
    const days = calculateDays();
    const rate = parseFloat(product.dailyRate || "0");
    return days * rate * quantity;
  };

  const calculateTotal = () => {
    const itemTotal = calculateItemTotal();
    const deposit = parseFloat(product.securityDeposit || "0");
    return itemTotal + deposit;
  };

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <Zap className="h-8 w-8 text-blue-500 mx-auto" />
            <h4 className="font-medium">Quick Rent</h4>
            <p className="text-sm text-gray-600">Sign in to rent instantly</p>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              size="sm"
              className="w-full"
            >
              Sign In to Rent
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium">Quick Rent</h4>
              <Badge variant="secondary" className="text-xs">
                Fast Booking
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Simple" : "Advanced"}
            </Button>
          </div>

          {/* Live Availability */}
          <LiveAvailability 
            productId={product.id}
            startDate={startDate}
            endDate={endDate}
          />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const nextDay = new Date();
                nextDay.setDate(nextDay.getDate() + 2);
                setStartDate(tomorrow);
                setEndDate(nextDay);
              }}
            >
              <Clock className="h-3 w-3 mr-1" />
              Tomorrow
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                const weekEnd = new Date();
                weekEnd.setDate(weekEnd.getDate() + 14);
                setStartDate(nextWeek);
                setEndDate(weekEnd);
              }}
            >
              <Clock className="h-3 w-3 mr-1" />
              Next Week
            </Button>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-xs">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                    size="sm"
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {startDate ? format(startDate, "MMM dd") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-xs">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                    size="sm"
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {endDate ? format(endDate, "MMM dd") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Quantity and Advanced Options */}
          {isExpanded && (
            <div className="space-y-3 pt-3 border-t">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-xs">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.availableQuantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {/* Price Calculation */}
          {startDate && endDate && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Rental ({calculateDays()} days)</span>
                <span>₹{calculateItemTotal().toLocaleString()}</span>
              </div>
              {product.securityDeposit && parseFloat(product.securityDeposit) > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Security Deposit</span>
                  <span>₹{parseFloat(product.securityDeposit).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-2 border-t">
                <span>Total</span>
                <span>₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Rent Button */}
          <Button
            onClick={() => quickRentMutation.mutate()}
            disabled={!startDate || !endDate || quickRentMutation.isPending}
            className="w-full"
            size="sm"
          >
            {quickRentMutation.isPending ? (
              <>
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-2" />
                Creating Order...
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-2" />
                Rent Now - ₹{calculateTotal().toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}