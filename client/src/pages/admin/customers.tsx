import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";

export default function AdminCustomers() {
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

  // Extract unique customers from orders
  const customers = orders ? Array.from(
    new Map(orders.map(order => [order.customerId, order.customer])).values()
  ).filter(Boolean) as User[] : [];

  // Calculate customer stats
  const getCustomerStats = (customerId: string) => {
    const customerOrders = orders?.filter(order => order.customerId === customerId) || [];
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const activeOrders = customerOrders.filter(order => order.status === 'active').length;
    
    return { totalOrders, totalSpent, activeOrders };
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-600">Manage your customer relationships and history</p>
        </div>

        {/* Customers List */}
        {ordersLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : customers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <i className="fas fa-users text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
              <p className="text-gray-600">Customers will appear here when they place orders</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customers.map((customer) => {
              const stats = getCustomerStats(customer.id);
              
              return (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          {customer.profileImageUrl ? (
                            <img 
                              src={customer.profileImageUrl} 
                              alt={`${customer.firstName} ${customer.lastName}`}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold text-lg">
                              {customer.firstName?.charAt(0) || customer.email?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {customer.firstName} {customer.lastName}
                          </CardTitle>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                          {customer.phone && (
                            <p className="text-sm text-gray-600">
                              <i className="fas fa-phone mr-1"></i>
                              {customer.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {customer.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                          <div className="text-xs text-gray-600">Total Orders</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            ₹{stats.totalSpent.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Total Spent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{stats.activeOrders}</div>
                          <div className="text-xs text-gray-600">Active Orders</div>
                        </div>
                      </div>

                      {/* Address */}
                      {customer.address && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Address</h5>
                          <p className="text-sm text-gray-600">{customer.address}</p>
                        </div>
                      )}

                      {/* Member Since */}
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Member since {formatDate(customer.createdAt)}</span>
                        <span>Last update {formatDate(customer.updatedAt)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4 border-t border-gray-200">
                        <Button variant="outline" size="sm" className="flex-1">
                          <i className="fas fa-eye mr-2"></i>
                          View Orders
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <i className="fas fa-envelope mr-2"></i>
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
