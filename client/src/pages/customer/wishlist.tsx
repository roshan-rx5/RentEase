import { useQuery } from "@tanstack/react-query";
import CustomerLayout from "@/components/layout/customer-layout";
import ProductCard from "@/components/ui/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import type { ProductWithCategory } from "@shared/schema";

export default function CustomerWishlist() {
  const { data: wishlistProducts, isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => fetch("/api/products").then(res => res.json()),
  });

  // Filter to show only a few sample products in wishlist for demo
  const sampleWishlist = wishlistProducts?.slice(0, 3) || [];

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Heart className="h-6 w-6 mr-2 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">Save your favorite rental items for later</p>
        </div>

        {isLoading ? (
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
        ) : !sampleWishlist || sampleWishlist.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Start browsing our catalog and add items to your wishlist by clicking the heart icon
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleWishlist.map((product: ProductWithCategory) => (
              <ProductCard
                key={product.id}
                product={product}
                onBook={() => window.location.href = `/catalog/${product.id}`}
                selectedDates={{}}
              />
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}