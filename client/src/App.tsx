import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";
import AdminInvoices from "@/pages/admin/invoices";
import AdminTransfers from "@/pages/admin/transfers";
import AdminMobile from "@/pages/admin/mobile";
import InvoicePayment from "@/pages/invoice-payment";
import CustomerCatalog from "@/pages/customer/catalog";
import ProductDetail from "@/pages/customer/product-detail";
import CustomerBooking from "@/pages/customer/booking";
import CustomerOrders from "@/pages/customer/orders";
import CustomerWishlist from "@/pages/customer/wishlist";
import CustomerContact from "@/pages/customer/contact";
import CustomerMobile from "@/pages/customer/mobile";
import EnhancedBilling from "@/pages/enhanced-billing";
import Checkout from "@/pages/checkout";
import OrderSuccess from "@/pages/order-success";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </>
      ) : (
        <>
          {user?.role === 'admin' ? (
            <>
              <Route path="/" component={AdminDashboard} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin/products" component={AdminProducts} />
              <Route path="/admin/orders" component={AdminOrders} />
              <Route path="/admin/customers" component={AdminCustomers} />
              <Route path="/admin/invoices" component={AdminInvoices} />
              <Route path="/admin/transfers" component={AdminTransfers} />
              <Route path="/admin/mobile" component={AdminMobile} />
            </>
          ) : (
            <>
              <Route path="/" component={CustomerCatalog} />
              <Route path="/catalog" component={CustomerCatalog} />
              <Route path="/catalog/:id" component={ProductDetail} />
              <Route path="/booking/:productId" component={CustomerBooking} />
              <Route path="/orders" component={CustomerOrders} />
              <Route path="/billing" component={EnhancedBilling} />
              <Route path="/wishlist" component={CustomerWishlist} />
              <Route path="/contact" component={CustomerContact} />
              <Route path="/mobile" component={CustomerMobile} />
            </>
          )}
          <Route path="/checkout/:orderId" component={Checkout} />
          <Route path="/order-success/:orderId" component={OrderSuccess} />
          <Route path="/invoice-payment/:invoiceId" component={InvoicePayment} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
