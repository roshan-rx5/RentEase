import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const navigation = [
    { name: "Catalog", href: "/catalog", icon: "fas fa-box", current: location === "/" || location === "/catalog" },
    { name: "My Orders", href: "/orders", icon: "fas fa-shopping-cart", current: location === "/orders" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customer Portal Header */}
      <div className="bg-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center mb-2">
                <i className="fas fa-box-open text-2xl mr-2"></i>
                <h1 className="text-2xl font-bold">RentFlow Portal</h1>
              </div>
              <p className="text-primary-100">Browse and book rental equipment</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-primary-100">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="User avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <span className="text-sm">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="bg-white text-primary-500 hover:bg-primary-50"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={`${
                  item.current
                    ? "text-primary-600 border-b-2 border-primary-500"
                    : "text-gray-500 hover:text-gray-700"
                } flex items-center px-1 py-4 text-sm font-medium`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.name}
              </button>
            ))}
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
