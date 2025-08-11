import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, ShoppingCart, Heart, Phone, User, LogOut, Smartphone } from "lucide-react";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/logout", "POST");
    },
    onSuccess: () => {
      queryClient.removeQueries();
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Logout Error",
        description: "Failed to logout properly",
        variant: "destructive",
      });
    },
  });

  const navigation = [
    { name: "Home", href: "/", icon: Home, current: location === "/" || location === "/catalog" },
    { name: "Rental Shop", href: "/catalog", icon: ShoppingCart, current: location.includes("/catalog") || location.includes("/booking") },
    { name: "Orders", href: "/orders", icon: ShoppingCart, current: location === "/orders" },
    { name: "Billing", href: "/billing", icon: ShoppingCart, current: location === "/billing" },
    { name: "Wishlist", href: "/wishlist", icon: Heart, current: location === "/wishlist" },
    { name: "Contact us", href: "/contact", icon: Phone, current: location === "/contact" },
    { name: "Mobile App", href: "/mobile", icon: Smartphone, current: location === "/mobile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo */}
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">RentFlow</span>
            </div>

            {/* Center: Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setLocation(item.href)}
                    className={`${
                      item.current
                        ? "text-primary-600 border-b-2 border-primary-500"
                        : "text-gray-500 hover:text-gray-700"
                    } flex items-center px-1 py-4 text-sm font-medium transition-colors`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center space-x-4">
              {/* Shopping Cart Icon */}
              <Button
                variant="ghost"
                size="sm"
                data-testid="cart-icon"
                onClick={() => setLocation("/orders")}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid="user-profile-dropdown"
                    className="flex items-center space-x-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm hidden sm:block">
                      {user?.name || 'adam'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    data-testid="dropdown-profile"
                    onClick={() => setLocation("/profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-testid="dropdown-orders"
                    onClick={() => setLocation("/orders")}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-testid="dropdown-logout"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-gray-200 pt-2 pb-2">
            <div className="flex justify-around">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    data-testid={`mobile-nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setLocation(item.href)}
                    className={`${
                      item.current ? "text-primary-600" : "text-gray-500"
                    } flex flex-col items-center py-2 text-xs`}
                  >
                    <IconComponent className="h-5 w-5 mb-1" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
