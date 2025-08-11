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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OrderWithItems } from "@shared/schema";

export default function AdminTransfers() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [transferType, setTransferType] = useState("pickup");
  const [selectedTransfer, setSelectedTransfer] = useState<OrderWithItems | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

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
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-pink-100 text-pink-800';
      case 'done': return 'bg-green-100 text-green-800';
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

  const pickupOrders = Array.isArray(orders) ? orders.filter(order => 
    order.status === 'confirmed' || order.status === 'paid'
  ) : [];

  const returnOrders = Array.isArray(orders) ? orders.filter(order => 
    order.status === 'active'
  ) : [];

  const openTransferDialog = (order: OrderWithItems, type: 'pickup' | 'return') => {
    setSelectedTransfer(order);
    setTransferType(type);
    setIsTransferDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Transfer</h2>
            <p className="text-gray-600">Manage pickup and return operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Create
            </Button>
            <span className="text-sm text-gray-500">1/80</span>
            <div className="flex">
              <Button variant="outline" size="sm">
                &lt;
              </Button>
              <Button variant="outline" size="sm">
                &gt;
              </Button>
            </div>
          </div>
        </div>

        {/* Transfer Type Tabs */}
        <Tabs defaultValue="pickup" className="w-full">
          <TabsList>
            <TabsTrigger value="pickup">Pickup Transfers</TabsTrigger>
            <TabsTrigger value="return">Return Transfers</TabsTrigger>
          </TabsList>
          
          {/* Pickup Transfers */}
          <TabsContent value="pickup" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pickupOrders.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No pickup transfers available
                </div>
              ) : (
                pickupOrders.map((order) => (
                  <Card 
                    key={order.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openTransferDialog(order, 'pickup')}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">PICKUP/OUT/{order.orderNumber}</h3>
                          <div className="flex space-x-2">
                            <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
                            <Badge className="bg-pink-100 text-pink-800">Ready</Badge>
                            <Badge className="bg-green-100 text-green-800">Done</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Customer:</span>
                            <span className="font-medium">{order.customer?.name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Schedule Date:</span>
                            <span>{formatDate(order.startDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Responsible:</span>
                            <span>Admin</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transfer Type:</span>
                            <span>Pickup</span>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="text-sm font-medium mb-2">Transfer Items:</div>
                          <div className="space-y-1">
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.product.name}</span>
                                <span>{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4 text-right">
                          <div className="text-sm text-gray-600">Untaxed Total: ₹{Number(order.totalAmount).toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Tax: ₹0</div>
                          <div className="font-bold">Total: ₹{Number(order.totalAmount).toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Return Transfers */}
          <TabsContent value="return" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {returnOrders.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No return transfers available
                </div>
              ) : (
                returnOrders.map((order) => (
                  <Card 
                    key={order.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openTransferDialog(order, 'return')}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Return/In/{order.orderNumber}</h3>
                          <div className="flex space-x-2">
                            <Badge className="bg-pink-100 text-pink-800">Draft</Badge>
                            <Badge className="bg-yellow-100 text-yellow-800">Waiting</Badge>
                            <Badge className="bg-orange-100 text-orange-800">Ready</Badge>
                            <Badge className="bg-pink-200 text-pink-800">Done</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Received from Customer:</span>
                            <span className="font-medium">{order.customer?.name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Schedule Date:</span>
                            <span>{formatDate(order.endDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Responsible:</span>
                            <span>Admin</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transfer Type:</span>
                            <Badge className="bg-purple-100 text-purple-800">Impassioned Frog</Badge>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="text-sm font-medium mb-2">Transfer Items:</div>
                          <div className="space-y-1">
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.product.name}</span>
                                <span>{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4 text-right">
                          <div className="text-sm text-gray-600">Untaxed Total: ₹{Number(order.totalAmount).toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Tax: ₹0</div>
                          <div className="font-bold">Total: ₹{Number(order.totalAmount).toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transfer Detail Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{transferType === 'pickup' ? 'Pickup' : 'Return'} Transfer</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Check Availability</Button>
                <Button variant="outline" size="sm">Confirm</Button>
                <Button variant="outline" size="sm">Cancel</Button>
                {transferType === 'pickup' ? (
                  <>
                    <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500">
                      Draft
                    </Button>
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                      Ready
                    </Button>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      Done
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" className="bg-pink-200 text-pink-800 hover:bg-pink-300">
                      Draft
                    </Button>
                    <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500">
                      Waiting
                    </Button>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      Ready
                    </Button>
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                      Done
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransfer && (
            <div className="space-y-6">
              <div className="text-2xl font-bold">
                {transferType === 'pickup' ? 'PICKUP/OUT/' : 'Return/In/'}{selectedTransfer.orderNumber}
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  {transferType === 'pickup' ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Customer:</label>
                        <p>{selectedTransfer.customer?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Invoice Address:</label>
                        <p>{selectedTransfer.customer?.address || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Delivery Address:</label>
                        <p>{selectedTransfer.pickupAddress || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Source Location:</label>
                        <p>Main Warehouse</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Received from Customer:</label>
                        <p>{selectedTransfer.customer?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Pickup Address:</label>
                        <p>{selectedTransfer.customer?.address || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Destination Location:</label>
                        <p>Main Warehouse</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Schedule Date:</label>
                    <p>{formatDate(transferType === 'pickup' ? selectedTransfer.startDate : selectedTransfer.endDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Responsible:</label>
                    <p>Admin</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Transfer Type:</label>
                    <p>{transferType === 'pickup' ? 'Pickup' : 'Return'}</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="transfer-lines" className="w-full">
                <TabsList>
                  <TabsTrigger value="transfer-lines">Transfer lines</TabsTrigger>
                  <TabsTrigger value="other-details">Other details</TabsTrigger>
                  <TabsTrigger value="transfer-notes">Transfer Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="transfer-lines" className="space-y-4">
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
                      {selectedTransfer.orderItems.map((item) => (
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
                      <label className="text-sm font-medium text-gray-600">Notes:</label>
                      <p className="text-sm text-gray-700 mt-1">
                        {selectedTransfer.notes || "No additional notes."}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="transfer-notes">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Transfer Notes:</label>
                      <Textarea 
                        placeholder="Add transfer notes..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="border-t pt-4">
                <div className="flex justify-end space-x-8">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Untaxed Total: ₹{Number(selectedTransfer.totalAmount).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Tax: ₹0</p>
                    <p className="text-lg font-bold">Total: ₹{Number(selectedTransfer.totalAmount).toLocaleString()}</p>
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