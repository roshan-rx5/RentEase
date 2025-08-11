import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import CustomerLayout from "@/components/layout/customer-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Mail, Calendar } from "lucide-react";

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
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

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
            <Button onClick={() => window.location.href = "/orders"}>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-green-700 text-lg">
              Your rental order has been confirmed and is ready for pickup.
            </p>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Confirmation - {order.orderNumber}</span>
              <Badge variant="default" className="bg-green-600">
                PAID & CONFIRMED
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Rental Period</h4>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {formatDate(order.startDate)} - {formatDate(order.endDate)}
                      <span className="text-sm ml-2">({getDurationDays(order.startDate, order.endDate)} days)</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Total Amount Paid</h4>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{Number(order.totalAmount).toLocaleString()}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Status</h4>
                  <Badge variant="default" className="bg-green-600">
                    Payment Completed
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Check your email for rental ticket and receipt</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Bring your ID and this confirmation for pickup</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Return equipment by the due date to avoid late fees</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center text-blue-800 mb-2">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="font-medium">Email Confirmation Sent</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Your rental ticket and payment receipt have been sent to your email address.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rental Items */}
        <Card>
          <CardHeader>
            <CardTitle>Rental Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.orderItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                      <i className="fas fa-box text-gray-400"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ₹{Number(item.unitRate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="font-bold text-gray-900">
                    ₹{Number(item.totalAmount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => window.location.href = "/orders"}
            size="lg"
            className="flex-1"
          >
            View All Orders
          </Button>
          <Button 
            onClick={() => window.location.href = "/catalog"}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            Continue Shopping
          </Button>
          <Button 
            onClick={() => window.print()}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>

        {/* Important Information */}
        <Card>
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Pickup Information</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Bring a valid government ID</li>
                  <li>• Present this order confirmation</li>
                  <li>• Check equipment condition before leaving</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Return Policy</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Return by the due date to avoid late fees</li>
                  <li>• Equipment must be in original condition</li>
                  <li>• Security deposit will be refunded upon return</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                <div>
                  <h5 className="font-medium text-yellow-900">Need Help?</h5>
                  <p className="text-sm text-yellow-700">
                    Contact our support team at support@rentflow.com or call +91-XXXX-XXXX
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}