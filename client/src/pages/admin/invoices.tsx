import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Eye, CreditCard, Calendar, Clock, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import type { InvoiceWithDetails } from "@shared/schema";

export default function AdminInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest("POST", `/api/invoices/generate/${orderId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invoice Generated",
        description: "Invoice has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    },
  });

  const payInvoiceMutation = useMutation({
    mutationFn: async ({ invoiceId, amount, paymentType }: { invoiceId: string; amount?: number; paymentType: 'partial' | 'full' }) => {
      const response = await apiRequest("POST", `/api/invoices/${invoiceId}/pay`, {
        amount,
        paymentType
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        // In a real implementation, you would integrate with Stripe Elements here
        toast({
          title: "Payment Initiated",
          description: "Payment process started. Please complete the payment.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const filteredInvoices = invoices.filter((invoice: InvoiceWithDetails) => {
    if (filterStatus === "all") return true;
    return invoice.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case 'sent':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString()}`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <p className="text-gray-600 mt-2">Manage and track all rental invoices</p>
          </div>
          <div className="flex space-x-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Invoice Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {invoices.filter((inv: InvoiceWithDetails) => inv.status === 'paid').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {invoices.filter((inv: InvoiceWithDetails) => inv.status === 'overdue').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      invoices.reduce((sum: number, inv: InvoiceWithDetails) => sum + Number(inv.totalAmount), 0)
                    )}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              All Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-600">
                  {filterStatus === "all" 
                    ? "Start by generating invoices for your orders." 
                    : `No invoices with status "${filterStatus}" found.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice: InvoiceWithDetails) => (
                  <div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{invoice.invoiceNumber}</h3>
                          <p className="text-sm text-gray-600">
                            Order: {invoice.order.orderNumber} • Customer: {invoice.customer.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
                          <p className="text-sm text-gray-600">
                            Due: {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        
                        {getStatusBadge(invoice.status)}
                        
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedInvoice(invoice)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Invoice Details</DialogTitle>
                              </DialogHeader>
                              {selectedInvoice && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Invoice Number</Label>
                                      <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                                    </div>
                                    <div>
                                      <Label>Status</Label>
                                      <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                                    </div>
                                    <div>
                                      <Label>Customer</Label>
                                      <p className="font-medium">{selectedInvoice.customer.name}</p>
                                    </div>
                                    <div>
                                      <Label>Due Date</Label>
                                      <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="border-t pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Subtotal</Label>
                                        <p className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</p>
                                      </div>
                                      <div>
                                        <Label>Tax</Label>
                                        <p className="font-medium">{formatCurrency(selectedInvoice.taxAmount)}</p>
                                      </div>
                                      <div>
                                        <Label>Late Fee</Label>
                                        <p className="font-medium">{formatCurrency(selectedInvoice.lateFee || '0')}</p>
                                      </div>
                                      <div>
                                        <Label>Total Amount</Label>
                                        <p className="text-lg font-bold">{formatCurrency(selectedInvoice.totalAmount)}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="border-t pt-4">
                                    <Label>Paid Amount</Label>
                                    <p className="font-medium text-green-600">{formatCurrency(selectedInvoice.paidAmount)}</p>
                                    <Label className="mt-2">Outstanding Balance</Label>
                                    <p className="font-medium text-red-600">
                                      {formatCurrency(Number(selectedInvoice.totalAmount) - Number(selectedInvoice.paidAmount))}
                                    </p>
                                  </div>
                                  
                                  {selectedInvoice.status !== 'paid' && (
                                    <div className="border-t pt-4 flex space-x-2">
                                      <Button
                                        onClick={() => {
                                          // Navigate to payment page instead of inline payment
                                          window.open(`/invoice-payment/${selectedInvoice.id}`, '_blank');
                                        }}
                                        disabled={payInvoiceMutation.isPending}
                                      >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Pay Now
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {invoice.status !== 'paid' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                window.open(`/invoice-payment/${invoice.id}`, '_blank');
                              }}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}