import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CustomerLayout from "@/components/layout/customer-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Eye, 
  Calendar, 
  CreditCard, 
  Receipt, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  DollarSign
} from "lucide-react";

export default function EnhancedBilling() {
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  // Calculate comprehensive statistics
  const stats = {
    totalRentals: orders?.length || 0,
    totalSpent: orders?.reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount || 0), 0) || 0,
    activeRentals: orders?.filter((order: any) => order.status === 'confirmed').length || 0,
    completedRentals: orders?.filter((order: any) => order.status === 'completed').length || 0,
    totalDays: orders?.reduce((sum: number, order: any) => {
      if (order.startDate && order.endDate) {
        const start = new Date(order.startDate);
        const end = new Date(order.endDate);
        return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }
      return sum;
    }, 0) || 0
  };

  const formatCurrency = (amount: string | number) => {
    return `₹${parseFloat(amount.toString()).toLocaleString()}`;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      dateRange: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      duration: `${days} day${days > 1 ? 's' : ''}`
    };
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
      case 'paid':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders?.filter((order: any) => {
    const matchesSearch = !searchTerm || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item: any) => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPeriod = selectedPeriod === "all" || order.status === selectedPeriod;
    
    return matchesSearch && matchesPeriod;
  }) || [];

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing Dashboard</h1>
          <p className="text-gray-600">
            Complete overview of your rental history from first day to last date
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Receipt className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Rentals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRentals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeRentals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedRentals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Days</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by order number or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Rental History</TabsTrigger>
            <TabsTrigger value="invoices">Invoices & Receipts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Rental History Tab */}
          <TabsContent value="orders" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rentals found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? "Try adjusting your search criteria" : "Start renting equipment to see your history"}
                  </p>
                  <Button onClick={() => window.location.href = '/'}>
                    Browse Equipment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: any) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                            <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status?.toUpperCase() || 'PENDING'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          {order.startDate && order.endDate && (
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDateRange(order.startDate, order.endDate).dateRange}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {formatDateRange(order.startDate, order.endDate).duration}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator className="mb-4" />

                      {/* Order Items */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Rented Items:</h4>
                        {order.items?.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-xl">🔧</span>
                              </div>
                              <div>
                                <p className="font-medium">{item.productName || 'Equipment'}</p>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(item.totalAmount)}</p>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(item.unitRate)}/day
                              </p>
                            </div>
                          </div>
                        )) || (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-600">Order details loading...</p>
                          </div>
                        )}
                      </div>

                      {/* Additional Information */}
                      {order.customerDetails && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">Delivery Address:</p>
                          <p className="text-sm text-blue-800">
                            {order.customerDetails.address}, {order.customerDetails.city}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoices & Receipts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices && invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Invoice #{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                          <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No invoices available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Spending Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Order Value</span>
                      <span className="font-semibold">
                        {formatCurrency(stats.totalSpent / Math.max(stats.totalRentals, 1))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rental Duration</span>
                      <span className="font-semibold">
                        {Math.round(stats.totalDays / Math.max(stats.totalRentals, 1))} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Most Active Month</span>
                      <span className="font-semibold">Current</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Rental Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-semibold text-green-600">
                        {stats.totalRentals > 0 
                          ? Math.round(((stats.completedRentals + stats.activeRentals) / stats.totalRentals) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Repeat Customer</span>
                      <span className="font-semibold">
                        {stats.totalRentals > 1 ? "Yes" : "New"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preferred Duration</span>
                      <span className="font-semibold">
                        {stats.totalDays / Math.max(stats.totalRentals, 1) > 7 ? "Weekly" : "Daily"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}