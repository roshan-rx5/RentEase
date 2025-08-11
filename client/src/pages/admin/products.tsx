import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, Category, ProductWithCategory } from "@shared/schema";

export default function AdminProducts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

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

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    imageUrl: "",
    totalQuantity: 1,
    availableQuantity: 1,
    hourlyRate: "",
    dailyRate: "",
    weeklyRate: "",
    monthlyRate: "",
    securityDeposit: "",
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      await apiRequest("/api/products", "POST", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setIsProductDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        categoryId: "",
        imageUrl: "",
        totalQuantity: 1,
        availableQuantity: 1,
        hourlyRate: "",
        dailyRate: "",
        weeklyRate: "",
        monthlyRate: "",
        securityDeposit: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }: any) => {
      await apiRequest(`/api/products/${id}`, "PUT", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setIsProductDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product",
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

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) : [];

  const openCreateDialog = () => {
    setIsCreateMode(true);
    setSelectedProduct(null);
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      imageUrl: "",
      totalQuantity: 1,
      availableQuantity: 1,
      hourlyRate: "",
      dailyRate: "",
      weeklyRate: "",
      monthlyRate: "",
      securityDeposit: "",
    });
    setIsProductDialogOpen(true);
  };

  const openEditDialog = (product: ProductWithCategory) => {
    setIsCreateMode(false);
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId || "",
      imageUrl: product.imageUrl || "",
      totalQuantity: product.totalQuantity || 1,
      availableQuantity: product.availableQuantity || 1,
      hourlyRate: product.hourlyRate || "",
      dailyRate: product.dailyRate || "",
      weeklyRate: product.weeklyRate || "",
      monthlyRate: product.monthlyRate || "",
      securityDeposit: product.securityDeposit || "",
    });
    setIsProductDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      totalQuantity: parseInt(formData.totalQuantity.toString()) || 1,
      availableQuantity: parseInt(formData.availableQuantity.toString()) || 1,
      hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
      dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
      weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null,
      monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : null,
      securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
    };

    if (isCreateMode) {
      createProductMutation.mutate(submitData);
    } else if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, ...submitData });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product</h2>
            <p className="text-gray-600">Manage your rental product catalog</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={openCreateDialog}
              data-testid="button-create-product"
            >
              Create
            </Button>
            <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white">
              Update Stock
            </Button>
            <span className="text-sm text-gray-500">1/80</span>
            <div className="flex">
              <Button variant="outline" size="sm">
                &lt;
              </Button>
              <Button variant="outline" size="sm">
                &gt;
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              data-testid="input-search-products"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No products found
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openEditDialog(product)}
                data-testid={`card-product-${product.id}`}
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <div className="text-4xl mb-2">📦</div>
                        <div className="text-sm">No Image</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    
                    {product.category && (
                      <Badge variant="secondary" className="text-xs">
                        {product.category.name}
                      </Badge>
                    )}
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description || "No description available"}
                    </p>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Stock:</span>
                        <span className="font-medium">
                          {product.availableQuantity}/{product.totalQuantity}
                        </span>
                      </div>
                      
                      {product.dailyRate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Daily Rate:</span>
                          <span className="font-medium text-green-600">
                            ₹{Number(product.dailyRate).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Product Create/Edit Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? "Create Product" : "Edit Product"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Product Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">General Product Info</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-product-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    data-testid="textarea-product-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger data-testid="select-product-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(categories) && categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    data-testid="input-product-image"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalQuantity">Total Quantity</Label>
                    <Input
                      id="totalQuantity"
                      type="number"
                      min="1"
                      value={formData.totalQuantity}
                      onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 1 })}
                      data-testid="input-total-quantity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availableQuantity">Available Quantity</Label>
                    <Input
                      id="availableQuantity"
                      type="number"
                      min="0"
                      value={formData.availableQuantity}
                      onChange={(e) => setFormData({ ...formData, availableQuantity: parseInt(e.target.value) || 0 })}
                      data-testid="input-available-quantity"
                    />
                  </div>
                </div>
              </div>

              {/* Rental Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rental Pricing</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                    <div>Rental Period</div>
                    <div>Price</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <Label>Hourly Rate</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                        placeholder="0.00"
                        className="pl-8"
                        data-testid="input-hourly-rate"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <Label>Daily Rate</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.dailyRate}
                        onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                        placeholder="0.00"
                        className="pl-8"
                        data-testid="input-daily-rate"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <Label>Weekly Rate</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.weeklyRate}
                        onChange={(e) => setFormData({ ...formData, weeklyRate: e.target.value })}
                        placeholder="0.00"
                        className="pl-8"
                        data-testid="input-weekly-rate"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <Label>Monthly Rate</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.monthlyRate}
                        onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
                        placeholder="0.00"
                        className="pl-8"
                        data-testid="input-monthly-rate"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <h4 className="font-medium">Rental Reservation charges</h4>
                  
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <Label>Security Deposit</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.securityDeposit}
                        onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                        placeholder="0.00"
                        className="pl-8"
                        data-testid="input-security-deposit"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsProductDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                data-testid="button-save-product"
              >
                {createProductMutation.isPending || updateProductMutation.isPending 
                  ? "Saving..." 
                  : isCreateMode ? "Create Product" : "Update Product"
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}