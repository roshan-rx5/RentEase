import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import CustomerLayout from "@/components/layout/customer-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrderWithItems } from "@shared/schema";

export default function CustomerOrders() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'quoted': return 'outline';
      case 'confirmed': return 'default';
      case 'paid': return 'default';
      case 'picked_up': return 'default';
      case 'active': return 'default';
      case 'returned': return 'outline';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDurationDays = (startDate: string | Date, endDate: string | Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          <p className="text-gray-600">Track your rental orders and history</p>
        </div>

        {/* Orders List */}
        {ordersLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !Array.isArray(orders) || orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <i className="fas fa-shopping-cart text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start browsing our catalog to place your first order</p>
              <Button className="bg-primary-500 hover:bg-primary-600">
                <i className="fas fa-search mr-2"></i>
                Browse Catalog
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Array.isArray(orders) && orders.map((order: OrderWithItems) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <span>{order.orderNumber}</span>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {order.paymentStatus}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>
                          <i className="fas fa-calendar mr-1"></i>
                          {formatDate(order.startDate)} - {formatDate(order.endDate)}
                        </span>
                        <span>
                          <i className="fas fa-clock mr-1"></i>
                          {getDurationDays(order.startDate, order.endDate)} days
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{Number(order.totalAmount).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Ordered {formatDate(order.createdAt!)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <i className="fas fa-box text-gray-400"></i>
                              </div>
                              <div>
                                <span className="font-medium">{item.product.name}</span>
                                <div className="text-sm text-gray-600">
                                  Quantity: {item.quantity} × ₹{Number(item.unitRate).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">₹{Number(item.totalAmount).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.pickupAddress && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Pickup Address</h5>
                          <p className="text-sm text-gray-600">{order.pickupAddress}</p>
                        </div>
                      )}
                      {order.returnAddress && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Return Address</h5>
                          <p className="text-sm text-gray-600">{order.returnAddress}</p>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Special Instructions</h5>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        {order.status === 'draft' && order.paymentStatus === 'pending' && (
                          <Button 
                            size="sm"
                            className="bg-primary-500 hover:bg-primary-600"
                            onClick={() => window.location.href = `/checkout/${order.id}`}
                          >
                            <i className="fas fa-credit-card mr-2"></i>
                            Complete Payment
                          </Button>
                        )}
                        {order.status === 'active' && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <i className="fas fa-check mr-1"></i>
                            Currently Rented
                          </Badge>
                        )}
                        {order.status === 'completed' && (
                          <Badge variant="outline" className="text-gray-600">
                            <i className="fas fa-check-circle mr-1"></i>
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <i className="fas fa-eye mr-2"></i>
                          View Details
                        </Button>
                        {(order.status === 'completed' || order.status === 'active') && (
                          <Button variant="outline" size="sm">
                            <i className="fas fa-download mr-2"></i>
                            Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
