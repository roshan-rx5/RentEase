import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import AdminLayout from "@/components/layout/admin-layout";
import StatsCard from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];
  const recentNotifications = Array.isArray(notifications) ? notifications.slice(0, 5) : [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor your rental business performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Rentals"
            value={statsLoading ? "..." : stats?.activeRentals?.toString() || "0"}
            icon="fas fa-shopping-cart"
            iconColor="text-blue-500"
            iconBg="bg-blue-50"
            trend="+12% from last month"
            trendPositive={true}
          />
          <StatsCard
            title="Monthly Revenue"
            value={statsLoading ? "..." : stats?.monthlyRevenue || "₹0"}
            icon="fas fa-dollar-sign"
            iconColor="text-green-500"
            iconBg="bg-green-50"
            trend="+8% from last month"
            trendPositive={true}
          />
          <StatsCard
            title="Pending Returns"
            value={statsLoading ? "..." : stats?.pendingReturns?.toString() || "0"}
            icon="fas fa-clock"
            iconColor="text-orange-500"
            iconBg="bg-orange-50"
            trend="3 overdue"
            trendPositive={false}
          />
          <StatsCard
            title="Total Customers"
            value={statsLoading ? "..." : stats?.totalCustomers?.toString() || "0"}
            icon="fas fa-users"
            iconColor="text-purple-500"
            iconBg="bg-purple-50"
            trend="+25 new this month"
            trendPositive={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Rental Orders</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No orders found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                  <i className="fas fa-user text-gray-500 text-sm"></i>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {order.customer?.firstName} {order.customer?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {order.customer?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={
                                  order.status === 'active' ? 'default' :
                                  order.status === 'confirmed' ? 'secondary' :
                                  order.status === 'completed' ? 'outline' : 'destructive'
                                }
                              >
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{Number(order.totalAmount).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Notifications */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                      <i className="fas fa-plus text-blue-500"></i>
                    </div>
                    <span className="text-sm font-medium">Create New Rental</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                    <div className="p-2 bg-green-50 rounded-lg mr-3">
                      <i className="fas fa-box text-green-500"></i>
                    </div>
                    <span className="text-sm font-medium">Add New Product</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                    <div className="p-2 bg-orange-50 rounded-lg mr-3">
                      <i className="fas fa-users text-orange-500"></i>
                    </div>
                    <span className="text-sm font-medium">Manage Customers</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                    <div className="p-2 bg-purple-50 rounded-lg mr-3">
                      <i className="fas fa-chart-bar text-purple-500"></i>
                    </div>
                    <span className="text-sm font-medium">View Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : recentNotifications.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No notifications
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentNotifications.map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3">
                        <div className={`p-1.5 rounded-full ${
                          notification.type === 'error' ? 'bg-red-50' :
                          notification.type === 'warning' ? 'bg-yellow-50' :
                          notification.type === 'success' ? 'bg-green-50' :
                          'bg-blue-50'
                        }`}>
                          <i className={`text-sm ${
                            notification.type === 'error' ? 'fas fa-exclamation-triangle text-red-500' :
                            notification.type === 'warning' ? 'fas fa-exclamation-triangle text-yellow-500' :
                            notification.type === 'success' ? 'fas fa-check text-green-500' :
                            'fas fa-info text-blue-500'
                          }`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500">{notification.message}</p>
                          <span className="text-xs text-gray-400">
                            {new Date(notification.createdAt!).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="ghost" size="sm" className="w-full mt-4 text-blue-600">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
