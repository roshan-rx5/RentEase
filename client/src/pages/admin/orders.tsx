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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrderWithItems } from "@shared/schema";

export default function AdminOrders() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

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
    onError: () => {
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }) : [];

  const statusCounts = {
    all: Array.isArray(orders) ? orders.length : 0,
    quotation: Array.isArray(orders) ? orders.filter(o => o.status === 'quoted').length : 0,
    reserved: Array.isArray(orders) ? orders.filter(o => o.status === 'confirmed').length : 0,
    pickup: Array.isArray(orders) ? orders.filter(o => o.status === 'picked_up').length : 0,
    returned: Array.isArray(orders) ? orders.filter(o => o.status === 'returned').length : 0,
  };

  const openOrderDialog = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Rental Orders</h2>
            <p className="text-gray-600">Manage your rental orders and track their status</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Create
            </Button>
            <span className="text-sm text-gray-500">1-14/50</span>
            <div className="flex">
              <Button variant="outline" size="sm">
                &lt;
              </Button>
              <Button variant="outline" size="sm">
                &gt;
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Cart</Button>
              <Button variant="outline" size="sm">List</Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              data-testid="input-search-orders"
            />
          </div>
        </div>

        {/* Status Tabs and Filters */}
        <div className="flex">
          <div className="w-64 pr-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">RENTAL STATUS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { key: 'ALL', label: 'ALL', count: statusCounts.all },
                  { key: 'quotation', label: 'Quotation', count: statusCounts.quotation },
                  { key: 'reserved', label: 'Reserved', count: statusCounts.reserved },
                  { key: 'pickup', label: 'Pickup', count: statusCounts.pickup },
                  { key: 'returned', label: 'Returned', count: statusCounts.returned },
                ].map((status) => (
                  <button
                    key={status.key}
                    onClick={() => setStatusFilter(status.key)}
                    className={`w-full text-left px-3 py-2 rounded flex justify-between items-center ${
                      statusFilter === status.key ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                    data-testid={`filter-status-${status.key.toLowerCase()}`}
                  >
                    <span className="text-sm">{status.label}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{status.count}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm font-medium">INVOICE STATUS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Fully Invoiced', count: 5 },
                  { label: 'Nothing to invoice', count: 5 },
                  { label: 'To invoice', count: 5 },
                ].map((status, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-sm">{status.label}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{status.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <div className="flex-1">
            <Card>
              <CardContent className="p-0">
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No orders found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <input type="checkbox" className="rounded" />
                        </TableHead>
                        <TableHead>Order Reference</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Created by user</TableHead>
                        <TableHead>Rental state</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow 
                          key={order.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => openOrderDialog(order)}
                          data-testid={`row-order-${order.id}`}
                        >
                          <TableCell>
                            <input type="checkbox" className="rounded" />
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                              <span className="text-sm">Admin</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>₹0</TableCell>
                          <TableCell className="font-medium">
                            ₹{Number(order.totalAmount).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Rental Order Form View</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Save</Button>
                <Button variant="outline" size="sm">Print</Button>
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500">
                  Quotation
                </Button>
                <Button size="sm" className="bg-green-500 hover:bg-green-600">
                  Quotation sent
                </Button>
                <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                  Rental Order
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="text-2xl font-bold">{selectedOrder.orderNumber}</div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer:</label>
                    <p>{selectedOrder.customer?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Invoice Address:</label>
                    <p>{selectedOrder.customer?.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Delivery Address:</label>
                    <p>{selectedOrder.pickupAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rental Template:</label>
                    <p>Standard Rental</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Expiration:</label>
                    <p>{formatDate(selectedOrder.endDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rental Order Date:</label>
                    <p>{formatDate(selectedOrder.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pricelist:</label>
                    <p>Standard</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rental Period:</label>
                    <p>Daily</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rental Duration:</label>
                    <p>7 days</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">Update Prices</Button>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="order-lines" className="w-full">
                <TabsList>
                  <TabsTrigger value="order-lines">Order lines</TabsTrigger>
                  <TabsTrigger value="other-details">Other details</TabsTrigger>
                  <TabsTrigger value="rental-notes">Rental Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="order-lines" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead>Sub Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{Number(item.unitRate).toLocaleString()}</TableCell>
                          <TableCell>₹0</TableCell>
                          <TableCell>₹{Number(item.totalAmount).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="other-details">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Terms & Conditions:</label>
                      <p className="text-sm text-gray-700 mt-1">
                        {selectedOrder.notes || "Standard rental terms and conditions apply."}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="rental-notes">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Internal Notes:</label>
                      <p className="text-sm text-gray-700 mt-1">
                        {selectedOrder.notes || "No additional notes."}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="border-t pt-4">
                <div className="flex justify-end space-x-8">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Untaxed Total: ₹{Number(selectedOrder.totalAmount).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Tax: ₹0</p>
                    <p className="text-lg font-bold">Total: ₹{Number(selectedOrder.totalAmount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}