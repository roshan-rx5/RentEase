import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <i className="fas fa-box-open text-2xl text-blue-600 mr-2"></i>
                <h1 className="text-xl font-bold text-gray-900">RentFlow</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Complete Rental
            <span className="text-blue-600"> Management</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Streamline your entire rental process with our comprehensive platform. 
            Manage products, schedule pickups, process payments, and delight customers.
          </p>
          <div className="mt-10">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              Get Started
              <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Everything you need to manage rentals
          </h2>
          <p className="mt-4 text-gray-600">
            From product management to customer portal, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="p-2 bg-blue-50 rounded-lg w-fit">
                <i className="fas fa-box text-blue-600 text-xl"></i>
              </div>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Define rentable products with flexible pricing for different time frames
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Hourly, daily, weekly, monthly rates</li>
                <li>• Availability tracking</li>
                <li>• Category organization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-green-50 rounded-lg w-fit">
                <i className="fas fa-calendar text-green-600 text-xl"></i>
              </div>
              <CardTitle>Booking & Scheduling</CardTitle>
              <CardDescription>
                Calendar-based availability with pickup and return scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Real-time availability</li>
                <li>• Pickup scheduling</li>
                <li>• Return tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-purple-50 rounded-lg w-fit">
                <i className="fas fa-credit-card text-purple-600 text-xl"></i>
              </div>
              <CardTitle>Payment Processing</CardTitle>
              <CardDescription>
                Secure payment integration with multiple gateway support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Stripe integration</li>
                <li>• Upfront & partial payments</li>
                <li>• Late fee automation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-orange-50 rounded-lg w-fit">
                <i className="fas fa-users text-orange-600 text-xl"></i>
              </div>
              <CardTitle>Customer Portal</CardTitle>
              <CardDescription>
                Beautiful customer portal for browsing and booking products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Product catalog</li>
                <li>• Online booking</li>
                <li>• Order tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-red-50 rounded-lg w-fit">
                <i className="fas fa-bell text-red-600 text-xl"></i>
              </div>
              <CardTitle>Smart Notifications</CardTitle>
              <CardDescription>
                Automated reminders for customers and staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Return reminders</li>
                <li>• Pickup notifications</li>
                <li>• Payment alerts</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-indigo-50 rounded-lg w-fit">
                <i className="fas fa-chart-bar text-indigo-600 text-xl"></i>
              </div>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                Comprehensive reporting and business insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Revenue tracking</li>
                <li>• Popular products</li>
                <li>• Customer analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to transform your rental business?
          </h2>
          <p className="mt-4 text-blue-100 text-lg">
            Join businesses already using RentFlow to streamline their operations
          </p>
          <div className="mt-8">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-3"
            >
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <i className="fas fa-box-open text-2xl text-blue-600 mr-2"></i>
              <span className="text-xl font-bold text-gray-900">RentFlow</span>
            </div>
            <p className="text-gray-600">
              © 2024 RentFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
