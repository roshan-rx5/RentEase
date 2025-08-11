import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProductForm from "@/components/forms/product-form";
import type { ProductWithCategory } from "@shared/schema";

export default function AdminProducts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
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
        description: "Failed to delete product",
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

  const handleEdit = (product: ProductWithCategory) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <p className="text-gray-600">Manage your rental product catalog</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <i className="fas fa-plus mr-2"></i>
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm
                categories={Array.isArray(categories) ? categories : []}
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !Array.isArray(products) || products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <i className="fas fa-box text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first rental product</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <i className="fas fa-plus mr-2"></i>
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(products) && products.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <i className="fas fa-edit text-gray-500"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <i className="fas fa-trash text-red-500"></i>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.category && (
                    <Badge variant="secondary" className="mb-3">
                      {product.category.name}
                    </Badge>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {product.hourlyRate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hourly:</span>
                        <span className="font-medium">₹{Number(product.hourlyRate)}/hr</span>
                      </div>
                    )}
                    {product.dailyRate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Daily:</span>
                        <span className="font-medium">₹{Number(product.dailyRate)}/day</span>
                      </div>
                    )}
                    {product.weeklyRate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Weekly:</span>
                        <span className="font-medium">₹{Number(product.weeklyRate)}/week</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge 
                      variant={product.availableQuantity && product.availableQuantity > 0 ? "default" : "destructive"}
                    >
                      {product.availableQuantity && product.availableQuantity > 0 
                        ? `${product.availableQuantity} Available` 
                        : "Out of Stock"
                      }
                    </Badge>
                    <Badge variant={product.isRentable ? "outline" : "secondary"}>
                      {product.isRentable ? "Rentable" : "Not Rentable"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <ProductForm
                product={selectedProduct}
                categories={Array.isArray(categories) ? categories : []}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  setSelectedProduct(null);
                  queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
