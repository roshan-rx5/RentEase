import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import CustomerLayout from "@/components/layout/customer-layout";
import ProductCard from "@/components/ui/product-card";
import RentalCalendar from "@/components/ui/rental-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ProductWithCategory } from "@shared/schema";

export default function CustomerCatalog() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDates, setSelectedDates] = useState<{ from?: Date; to?: Date }>({});

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", selectedDates.from, selectedDates.to],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedDates.from) params.set('startDate', selectedDates.from.toISOString());
      if (selectedDates.to) params.set('endDate', selectedDates.to.toISOString());
      
      return fetch(`/api/products?${params.toString()}`).then(res => res.json());
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Filter products based on search and category
  const filteredProducts = products?.filter((product: ProductWithCategory) => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === "all" || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const handleBookProduct = (productId: string) => {
    if (selectedDates.from && selectedDates.to) {
      const params = new URLSearchParams({
        startDate: selectedDates.from.toISOString(),
        endDate: selectedDates.to.toISOString(),
      });
      setLocation(`/booking/${productId}?${params.toString()}`);
    } else {
      setLocation(`/booking/${productId}`);
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-4">Browse Rental Equipment</h1>
            <p className="text-blue-100 text-lg">
              Find the perfect equipment for your needs. Select your dates and explore our catalog.
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Find Your Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <Input
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Array.isArray(categories) && categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Actions
                </label>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedDates({});
                  }}
                >
                  <i className="fas fa-undo mr-2"></i>
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Calendar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rental Dates (Optional)
              </label>
              <RentalCalendar
                selected={selectedDates}
                onSelect={setSelectedDates}
                className="w-full"
              />
              {selectedDates.from && selectedDates.to && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedDates.from.toLocaleDateString()} - {selectedDates.to.toLocaleDateString()}
                  ({Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24))} days)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Equipment
              {filteredProducts.length > 0 && (
                <span className="text-gray-500 text-lg ml-2">
                  ({filteredProducts.length} items)
                </span>
              )}
            </h2>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <i className="fas fa-search text-gray-300 text-6xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedCategory ? "No products found" : "No products available"}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || selectedCategory 
                    ? "Try adjusting your search criteria or filters"
                    : "Products will appear here when they become available"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: ProductWithCategory) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onBook={() => handleBookProduct(product.id)}
                  selectedDates={selectedDates}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
