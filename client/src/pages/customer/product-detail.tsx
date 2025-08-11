import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import CustomerLayout from "@/components/layout/customer-layout";
import RentalCalendar from "@/components/ui/rental-calendar";
import EnhancedBookingForm from "@/components/ui/enhanced-booking-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, ArrowLeft, Plus, Minus, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithCategory } from "@shared/schema";

export default function ProductDetail() {
  const [match, params] = useRoute("/catalog/:id");
  const [, setLocation] = useLocation();
  const [selectedDates, setSelectedDates] = useState<{ from?: Date; to?: Date }>({});
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", params?.id],
    queryFn: () => 
      fetch(`/api/products/${params?.id}`).then(res => res.json()),
    enabled: !!params?.id,
  });

  const calculatePrice = () => {
    if (!selectedDates?.from || !selectedDates?.to || !product) {
      return null;
    }
    
    const duration = Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24));
    
    if (duration <= 1 && product.hourlyRate) {
      const hours = Math.max(1, Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60)));
      return { amount: Number(product.hourlyRate) * hours * quantity, unit: `${hours} hour${hours > 1 ? 's' : ''}`, perUnit: Number(product.hourlyRate) };
    } else if (duration <= 7 && product.dailyRate) {
      return { amount: Number(product.dailyRate) * duration * quantity, unit: `${duration} day${duration > 1 ? 's' : ''}`, perUnit: Number(product.dailyRate) };
    } else if (duration <= 30 && product.weeklyRate) {
      const weeks = Math.ceil(duration / 7);
      return { amount: Number(product.weeklyRate) * weeks * quantity, unit: `${weeks} week${weeks > 1 ? 's' : ''}`, perUnit: Number(product.weeklyRate) };
    } else if (product.monthlyRate) {
      const months = Math.ceil(duration / 30);
      return { amount: Number(product.monthlyRate) * months * quantity, unit: `${months} month${months > 1 ? 's' : ''}`, perUnit: Number(product.monthlyRate) };
    } else if (product.dailyRate) {
      return { amount: Number(product.dailyRate) * duration * quantity, unit: `${duration} day${duration > 1 ? 's' : ''}`, perUnit: Number(product.dailyRate) };
    }
    
    return null;
  };

  const [showBookingForm, setShowBookingForm] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleBookNow = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    
    if (!selectedDates.from || !selectedDates.to) {
      toast({
        title: "Please select rental dates",
        description: "Choose your rental period to continue",
        variant: "destructive",
      });
      return;
    }

    setShowBookingForm(true);
  };

  const handleBookingComplete = (orderId: string) => {
    setLocation(`/checkout/${orderId}`);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted ? "Item removed from your wishlist" : "Item saved to your wishlist",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Rental Product',
      text: `Check out this rental product: ${product?.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Product shared successfully",
        });
      } catch (error) {
        // User cancelled sharing, fallback to copy
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard",
        });
      }
    } else {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Sharing failed",
          description: "Unable to share or copy link",
          variant: "destructive",
        });
      }
    }
  };

  const calculatedPrice = calculatePrice();

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!product) {
    return (
      <CustomerLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
            <Button onClick={() => setLocation("/catalog")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Catalog
            </Button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button onClick={() => setLocation("/catalog")} className="hover:text-blue-600">
              All Products
            </button>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <i className="fas fa-box text-6xl text-gray-400"></i>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleWishlist}>
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {calculatedPrice ? (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    ₹{calculatedPrice.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">
                    (₹{calculatedPrice.perUnit.toLocaleString()} per unit × {quantity} × {calculatedPrice.unit})
                  </div>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {product.hourlyRate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Hourly:</span>
                      <span className="font-medium">₹{Number(product.hourlyRate).toLocaleString()}/hr</span>
                    </div>
                  )}
                  {product.dailyRate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Daily:</span>
                      <span className="font-medium">₹{Number(product.dailyRate).toLocaleString()}/day</span>
                    </div>
                  )}
                  {product.weeklyRate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Weekly:</span>
                      <span className="font-medium">₹{Number(product.weeklyRate).toLocaleString()}/week</span>
                    </div>
                  )}
                  {product.monthlyRate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Monthly:</span>
                      <span className="font-medium">₹{Number(product.monthlyRate).toLocaleString()}/month</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-600">From:</span>
                <input type="date" className="border rounded px-3 py-1" />
                <span className="text-sm text-gray-600">to:</span>
                <input type="date" className="border rounded px-3 py-1" />
              </div>

              <div className="flex items-center space-x-3 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-medium px-4">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.availableQuantity || 1, quantity + 1))}
                  disabled={quantity >= (product.availableQuantity || 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleBookNow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  disabled={!product.availableQuantity || product.availableQuantity <= 0}
                >
                  {isAuthenticated ? "Book Now" : "Sign In to Book"}
                </Button>
              </div>

              {product.category && (
                <Badge variant="secondary" className="mb-4">
                  {product.category.name}
                </Badge>
              )}

              <Badge 
                variant={product.availableQuantity && product.availableQuantity > 0 ? "default" : "destructive"}
                className="mb-4"
              >
                {product.availableQuantity && product.availableQuantity > 0
                  ? `${product.availableQuantity} Available` 
                  : "Out of Stock"
                }
              </Badge>
            </div>

            {/* Rental Period Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Rental Period</CardTitle>
              </CardHeader>
              <CardContent>
                <RentalCalendar
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Apply Coupon */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apply Coupon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (couponCode.trim()) {
                        toast({
                          title: "Coupon Applied",
                          description: `Coupon "${couponCode}" has been applied successfully`,
                        });
                        setCouponCode("");
                      } else {
                        toast({
                          title: "Invalid Coupon",
                          description: "Please enter a valid coupon code",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Product descriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{product.description || "No description available."}</p>
              
              {product.description && (
                <div className="mt-4 text-sm text-gray-600">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Professional grade equipment</li>
                      <li>Well-maintained and regularly serviced</li>
                      <li>Includes necessary accessories</li>
                      <li>Safety instructions provided</li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-900">Rental Terms:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Security deposit required</li>
                      <li>Late return fees may apply</li>
                      <li>Damage assessment upon return</li>
                      <li>Pickup and delivery available</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add to Wishlist Button */}
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={handleWishlist} className="w-full max-w-md">
            <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            {isWishlisted ? "Remove from wishlist" : "Add to wish list"}
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}