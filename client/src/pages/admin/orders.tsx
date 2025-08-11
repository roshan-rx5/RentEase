import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OrderWithItems } from "@shared/schema";

export default function AdminOrders() {
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

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
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
        description: "Failed to update order status",
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
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-600">Manage all rental orders and their lifecycle</p>
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
              <p className="text-gray-600">Orders will appear here when customers start booking</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Array.isArray(orders) && orders.map((order: OrderWithItems) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        {order.orderNumber}
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {order.paymentStatus}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>
                          <i className="fas fa-user mr-1"></i>
                          {order.customer?.firstName} {order.customer?.lastName}
                        </span>
                        <span>
                          <i className="fas fa-envelope mr-1"></i>
                          {order.customer?.email}
                        </span>
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
                        Created {formatDate(order.createdAt!)}
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
                            <div>
                              <span className="font-medium">{item.product.name}</span>
                              <span className="text-gray-600 ml-2">× {item.quantity}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">₹{Number(item.totalAmount).toLocaleString()}</div>
                              <div className="text-sm text-gray-600">₹{Number(item.unitRate)}/unit</div>
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

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-gray-700">Status:</label>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderMutation.mutate({ id: order.id, status: value })}
                            disabled={updateOrderMutation.isPending}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="quoted">Quoted</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="picked_up">Picked Up</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="returned">Returned</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <i className="fas fa-eye mr-2"></i>
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-print mr-2"></i>
                          Print
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
