import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CustomerLayout from "@/components/layout/customer-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Grid3X3, Heart, Calendar as CalendarIcon, Minus, Plus, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import type { ProductWithCategory } from "@shared/schema";

export default function CustomerBooking() {
  const { productId } = useParams<{ productId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Parse URL parameters for pre-selected dates
  const urlParams = new URLSearchParams(window.location.search);
  const [fromDate, setFromDate] = useState<Date | undefined>(
    urlParams.get('startDate') ? new Date(urlParams.get('startDate')!) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    urlParams.get('endDate') ? new Date(urlParams.get('endDate')!) : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const { data: product, isLoading: productLoading } = useQuery<ProductWithCategory>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("/api/orders", "POST", orderData);
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Added to Cart",
        description: "Item added to your cart successfully!",
      });
      setLocation(`/orders`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate rental duration and total price
  const duration = fromDate && toDate ? 
    Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const dailyRate = parseFloat(product?.dailyRate || "0");
  const subtotal = duration * dailyRate * quantity;
  const taxes = subtotal * 0.1; // 10% tax
  const total = subtotal + taxes;

  const handleAddToCart = () => {
    if (!fromDate || !toDate) {
      toast({
        title: "Missing Dates",
        description: "Please select rental start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (duration <= 0) {
      toast({
        title: "Invalid Duration",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      productId,
      quantity,
      startDate: fromDate.toISOString(),
      endDate: toDate.toISOString(),
      totalAmount: total,
    };

    addToCartMutation.mutate(orderData);
  };

  const handleWishlistToggle = () => {
    setIsInWishlist(!isInWishlist);
    toast({
      title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
      description: isInWishlist ? "Item removed from your wishlist" : "Item added to your wishlist",
    });
  };

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
            <Grid3X3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation("/catalog")}>
              Back to Catalog
            </Button>
          </CardContent>
        </Card>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <button onClick={() => setLocation("/catalog")} className="hover:text-gray-700">
                All Products
              </button>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Product Image and Details */}
          <div className="space-y-6">
            {/* Product Image */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <Grid3X3 className="h-16 w-16 mx-auto mb-2" />
                      <p className="text-sm">No image available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add to Wishlist */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleWishlistToggle}
              data-testid="add-to-wishlist-button"
            >
              <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              {isInWishlist ? "Remove from" : "Add to"} wish list
            </Button>

            {/* Product Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Product descriptions</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>{product.description || "No description available"}</p>
                  <p>••••</p>
                  <p>••••</p>
                  <p>••••</p>
                </div>
                <Button variant="link" className="p-0 h-auto text-sm mt-2">
                  Read More &gt;
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Product Info and Booking */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  ₹ {dailyRate.toFixed(2)}
                </span>
                <span className="text-gray-600">( ₹{dailyRate.toFixed(2)} / per unit )</span>
              </div>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From :
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!fromDate && "text-muted-foreground"}`}
                      data-testid="from-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "dd/MM/yyyy") : "DD/MM/YYYY"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  to :
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!toDate && "text-muted-foreground"}`}
                      data-testid="to-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "dd/MM/yyyy") : "DD/MM/YYYY"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                data-testid="quantity-decrease"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-medium text-lg w-8 text-center" data-testid="quantity-display">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                data-testid="quantity-increase"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button 
                className="ml-auto"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || !fromDate || !toDate}
                data-testid="add-to-cart-button"
              >
                <Heart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Coupon Code */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Apply Coupon</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  data-testid="coupon-input"
                />
                <Button variant="default" data-testid="apply-coupon-button">
                  Apply
                </Button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Terms & condition</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>••••</p>
                <p>••••</p>
                <p>••••</p>
              </div>
            </div>

            {/* Share */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Share :</h4>
              {/* Social share buttons can be added here */}
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}