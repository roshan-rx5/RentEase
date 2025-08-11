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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Grid3X3, List, Search, SlidersHorizontal } from "lucide-react";
import type { ProductWithCategory } from "@shared/schema";

export default function CustomerCatalog() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDates, setSelectedDates] = useState<{ from?: Date; to?: Date }>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [sortBy, setSortBy] = useState<string>("name");

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

  // Filter and sort products
  const filteredProducts = products?.filter((product: ProductWithCategory) => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === "all" || product.categoryId === selectedCategory;
    
    const matchesPrice = (!priceRange.min || parseFloat(product.dailyRate || "0") >= parseFloat(priceRange.min)) &&
                         (!priceRange.max || parseFloat(product.dailyRate || "0") <= parseFloat(priceRange.max));
    
    return matchesSearch && matchesCategory && matchesPrice;
  })?.sort((a: ProductWithCategory, b: ProductWithCategory) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.dailyRate || "0") - parseFloat(b.dailyRate || "0");
      case "price-high":
        return parseFloat(b.dailyRate || "0") - parseFloat(a.dailyRate || "0");
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Product Attributes */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Product attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Colors */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Colors</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">-</div>
                    <div className="text-sm text-gray-600">-</div>
                    <div className="text-sm text-gray-600">-</div>
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Price range</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        data-testid="price-min-input"
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        data-testid="price-max-input"
                      />
                    </div>
                    <div className="text-sm text-gray-600">-</div>
                    <div className="text-sm text-gray-600">-</div>
                    <div className="text-sm text-gray-600">-</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Category Filter Bar */}
            <div className="flex gap-3 mb-6 overflow-x-auto">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                data-testid="category-all"
              >
                Category 1
              </Button>
              {Array.isArray(categories) && categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  data-testid={`category-${category.name.toLowerCase()}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Search and Controls */}
            <div className="flex gap-4 mb-6 items-center">
              {/* Price List Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40" data-testid="sort-dropdown">
                  <SelectValue placeholder="Price List" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>

              {/* Sort Dropdown */}
              <Select>
                <SelectTrigger className="w-32" data-testid="sort-by-dropdown">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                  data-testid="view-grid-button"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                  data-testid="view-list-button"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Display */}
            {productsLoading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className={viewMode === "grid" ? "h-48 bg-gray-200 rounded-t-lg" : "h-24 bg-gray-200 rounded-l-lg"}></div>
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
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || selectedCategory !== "all" ? "No products found" : "No products available"}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search criteria or filters"
                      : "Products will appear here when they become available"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
                    {filteredProducts.map((product: ProductWithCategory) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onBook={() => handleBookProduct(product.id)}
                        selectedDates={selectedDates}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="products-list">
                    {filteredProducts.map((product: ProductWithCategory) => (
                      <Card key={product.id} className="flex items-center p-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg mr-4 flex-shrink-0">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Grid3X3 className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">₹{product.dailyRate || 0}</div>
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => handleBookProduct(product.id)}
                            data-testid={`add-to-cart-${product.id}`}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled data-testid="pagination-prev">
                      &lt;
                    </Button>
                    <Button variant="default" size="sm" data-testid="pagination-1">1</Button>
                    <Button variant="outline" size="sm" data-testid="pagination-2">2</Button>
                    <Button variant="outline" size="sm" data-testid="pagination-3">3</Button>
                    <Button variant="outline" size="sm" data-testid="pagination-4">4</Button>
                    <span className="text-sm text-gray-500">... 10</span>
                    <Button variant="outline" size="sm" data-testid="pagination-next">
                      &gt;
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
