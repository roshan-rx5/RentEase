import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CustomerLayout from "@/components/layout/customer-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Receipt, 
  Download, 
  CreditCard, 
  Calendar, 
  Search,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle 
} from "lucide-react";

export default function CustomerBilling() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString()}`;
  };

  const getStatusBadge = (status: string, type: 'payment' | 'order' = 'payment') => {
    const variants: Record<string, { variant: any; icon: any; color: string }> = {
      paid: { variant: "default", icon: CheckCircle, color: "text-green-600" },
      pending: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
      failed: { variant: "destructive", icon: AlertCircle, color: "text-red-600" },
      confirmed: { variant: "default", icon: CheckCircle, color: "text-green-600" },
      completed: { variant: "default", icon: CheckCircle, color: "text-blue-600" },
      cancelled: { variant: "destructive", icon: AlertCircle, color: "text-red-600" }
    };

    const config = variants[status] || { variant: "secondary", icon: Clock, color: "text-gray-600" };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderItems?.some((item: any) => 
                           item.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = statusFilter === "all" || order.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter((invoice: any) => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = orders
    .filter((order: any) => order.paymentStatus === 'paid')
    .reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);

  const totalPending = orders
    .filter((order: any) => order.paymentStatus === 'pending')
    .reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
            <p className="text-gray-600">Manage your orders, payments, and invoices</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(totalPending)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {orders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order number or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Order History
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History & Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your search or filter criteria"
                        : "You haven't placed any orders yet"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order: any) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{order.orderNumber}</h4>
                              {getStatusBadge(order.paymentStatus)}
                              {getStatusBadge(order.status, 'order')}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Order Date: {formatDate(order.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right mt-2 sm:mt-0">
                            <div className="text-xl font-bold text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDate(order.startDate)} - {formatDate(order.endDate)}
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2 mb-4">
                          {order.orderItems?.map((item: any, index: number) => (
                            <div key={item.id || index} className="flex items-center text-sm text-gray-600">
                              <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center">
                                <i className="fas fa-box text-xs text-gray-400"></i>
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">{item.product?.name || 'Unknown Product'}</span>
                                <span className="text-gray-500 ml-2">× {item.quantity}</span>
                              </div>
                              <span className="font-medium">{formatCurrency(item.totalAmount)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Download Receipt
                          </Button>
                          {order.paymentStatus === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => window.location.href = `/checkout/${order.id}`}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                    <p className="text-gray-600">Invoices will appear here when generated</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInvoices.map((invoice: any) => (
                      <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">{invoice.invoiceNumber}</h4>
                            <div className="text-sm text-gray-600">
                              <div>Issue Date: {formatDate(invoice.createdAt)}</div>
                              <div>Due Date: {formatDate(invoice.dueDate)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              {formatCurrency(invoice.totalAmount)}
                            </div>
                            {getStatusBadge(invoice.status)}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-3 w-3 mr-1" />
                            View Invoice
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Download PDF
                          </Button>
                          {invoice.status === 'sent' && (
                            <Button 
                              size="sm"
                              onClick={() => window.location.href = `/invoice-payment/${invoice.id}`}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}