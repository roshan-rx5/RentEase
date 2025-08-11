import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Package, Users, TrendingUp, Calendar, Eye, ChevronRight } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

export default function AdminDashboard() {
  const [timeFilter, setTimeFilter] = useState("30");
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800'; 
      case 'paid': return 'bg-green-100 text-green-800';
      case 'picked_up': return 'bg-orange-100 text-orange-800';
      case 'active': return 'bg-purple-100 text-purple-800';
      case 'returned': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">RentFlow Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your rental equipment business</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {Array.isArray(orders) ? orders.length : 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12%</span>
                <span className="text-gray-600 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {(stats as any)?.monthlyRevenue || '₹0'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+18%</span>
                <span className="text-gray-600 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Rentals</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {(stats as any)?.activeRentals || recentOrders.filter((order: any) => order.status === 'active').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+5%</span>
                <span className="text-gray-600 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Equipment Items</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {Array.isArray(products) ? products.length : 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+7</span>
                <span className="text-gray-600 ml-2">new items</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            className="p-4 h-auto flex-col space-y-2" 
            variant="outline" 
            data-testid="add-equipment-btn"
            onClick={() => setLocation('/admin/products')}
          >
            <Package className="h-6 w-6" />
            <span>Add Equipment</span>
          </Button>
          <Button 
            className="p-4 h-auto flex-col space-y-2" 
            variant="outline" 
            data-testid="view-orders-btn"
            onClick={() => setLocation('/admin/orders')}
          >
            <ShoppingCart className="h-6 w-6" />
            <span>View Orders</span>
          </Button>
          <Button 
            className="p-4 h-auto flex-col space-y-2" 
            variant="outline" 
            data-testid="manage-customers-btn"
            onClick={() => setLocation('/admin/customers')}
          >
            <Users className="h-6 w-6" />
            <span>Manage Customers</span>
          </Button>
          <Button 
            className="p-4 h-auto flex-col space-y-2" 
            variant="outline" 
            data-testid="view-reports-btn"
            onClick={() => setLocation('/admin/transfers')}
          >
            <TrendingUp className="h-6 w-6" />
            <span>View Reports</span>
          </Button>
        </div>

        {/* Recent Rental Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Recent Rental Orders
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              data-testid="view-all-orders-btn"
              onClick={() => setLocation('/admin/orders')}
            >
              <Eye className="h-4 w-4 mr-2" />
              View All Orders
            </Button>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rental orders yet</h3>
                <p className="text-gray-600">Once customers start renting equipment, their orders will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: OrderWithItems) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors" data-testid={`order-${order.id}`}>
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {order.customer?.name || order.customer?.email || 'Unknown Customer'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{order.totalAmount}</p>
                        <p className="text-sm text-gray-600">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipment Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Equipment Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 border rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : Array.isArray(categories) && categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((category: any) => (
                  <div key={category.id} className="p-4 border rounded-lg" data-testid={`category-${category.id}`}>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {Array.isArray(products) ? products.filter(p => p.categoryId === category.id).length : 0}
                    </p>
                    <p className="text-sm text-gray-600">items available</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No equipment categories found. Add categories to organize your rental items.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}