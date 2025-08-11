import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "fas fa-chart-bar", current: location === "/" },
    { name: "Products", href: "/admin/products", icon: "fas fa-box", current: location === "/admin/products" },
    { name: "Orders", href: "/admin/orders", icon: "fas fa-shopping-cart", current: location === "/admin/orders" },
    { name: "Customers", href: "/admin/customers", icon: "fas fa-users", current: location === "/admin/customers" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <i className="fas fa-box-open text-2xl text-primary-500 mr-2"></i>
                <h1 className="text-xl font-bold text-gray-900">RentFlow</h1>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setLocation(item.href)}
                    className={`${
                      item.current
                        ? "text-primary-600 border-b-2 border-primary-500"
                        : "text-gray-500 hover:text-gray-700"
                    } px-1 pt-1 text-sm font-medium`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-500 relative">
                <i className="fas fa-bell text-lg"></i>
                <span className="absolute -mt-1 ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  3
                </span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="User avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/api/logout'}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
