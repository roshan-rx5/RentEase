import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Clock, 
  Shield, 
  Star, 
  ArrowRight, 
  Search, 
  CheckCircle,
  Users,
  Calendar,
  CreditCard
} from "lucide-react";
import QuickRentWidget from "@/components/ui/quick-rent-widget";
import LiveAvailability from "@/components/ui/live-availability";
import type { ProductWithCategory } from "@shared/schema";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Get featured/popular products
  const featuredProducts = products?.slice(0, 6) || [];
  
  const filteredProducts = products?.filter((product: ProductWithCategory) => 
    !searchTerm || 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Rent Equipment
              <span className="block text-blue-200">The Smart Way</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Browse thousands of items, book instantly with real-time availability, 
              collect your rental details seamlessly, and pay securely. Everything tracked in your personal billing dashboard.
            </p>
            
            {/* Key Features */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Instant Booking
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                Real-time Updates
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Secure Payments
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Star className="h-4 w-4 mr-2" />
                Complete Tracking
              </Badge>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for equipment to rent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg bg-white/95 border-white/20 focus:bg-white rounded-full shadow-lg"
                />
                {searchTerm && (
                  <Button 
                    onClick={() => setLocation('/catalog')}
                    className="absolute right-2 top-2 rounded-full"
                    size="sm"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setLocation('/catalog')}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
              >
                Browse Equipment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {isAuthenticated ? (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setLocation('/customer/billing')}
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-full"
                >
                  View My Rentals
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.location.href = '/api/login'}
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-full"
                >
                  Sign In to Rent
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Rent equipment in 4 simple steps - from browsing to billing, everything is seamless
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Browse & Search</h3>
              <p className="text-gray-600">Search thousands of items with real-time availability and instant pricing</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Select Dates</h3>
              <p className="text-gray-600">Pick your rental dates and get instant pricing with our Quick Rent feature</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Fill Details</h3>
              <p className="text-gray-600">Complete your information with our user-friendly form - all details collected securely</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Pay & Track</h3>
              <p className="text-gray-600">Secure payment with Stripe, then track everything in your billing dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {searchTerm ? `Search Results for "${searchTerm}"` : "Popular Equipment"}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {searchTerm 
                ? `Found ${filteredProducts.length} items matching your search`
                : "Most rented equipment with instant availability"
              }
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product: ProductWithCategory) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl">🔧</div>
                      )}
                    </div>
                    
                    {/* Live Availability */}
                    <div className="absolute top-3 left-3">
                      <LiveAvailability productId={product.id} />
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{product.dailyRate || 0}
                        </span>
                        <span className="text-gray-500">/day</span>
                      </div>
                      <Badge variant="secondary">
                        {product.availableQuantity || 0} available
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={() => setLocation(`/catalog/${product.id}`)}
                        className="w-full"
                        variant="outline"
                      >
                        View Details
                      </Button>
                      
                      {/* Quick Rent for authenticated users */}
                      {isAuthenticated && (
                        <div className="border-t pt-3">
                          <QuickRentWidget product={product} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchTerm && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">Try different search terms or browse our catalog</p>
              <Button onClick={() => setLocation('/catalog')}>
                Browse All Equipment
              </Button>
            </div>
          )}

          {/* View All Button */}
          {!searchTerm && (
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                onClick={() => setLocation('/catalog')}
                className="px-8 py-4 text-lg"
              >
                View All Equipment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose RentFlow?</h2>
            <p className="text-xl text-gray-600">
              The most user-friendly rental platform with complete transparency
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
              <p className="text-gray-600">
                Book equipment instantly with our Quick Rent feature. See real-time availability and pricing.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Safe</h3>
              <p className="text-gray-600">
                All payments secured with Stripe. Complete rental tracking from first day to last date.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Complete Support</h3>
              <p className="text-gray-600">
                User-friendly forms, email confirmations, and complete billing dashboard for all your rentals.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Rent?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who rent equipment the smart way
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation('/catalog')}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-full"
            >
              Start Renting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {!isAuthenticated && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.location.href = '/api/login'}
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-full"
              >
                Create Account
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}