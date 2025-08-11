import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-900">RentFlow</h1>
              </div>
              {/* Navigation Menu */}
              <div className="hidden md:flex items-center space-x-8 ml-10">
                <a href="#" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">Home</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 pb-4">Rental Shop</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 pb-4">Wishlist</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 pb-4">Contact us</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">a</span>
                </div>
                <span className="ml-2 text-gray-700 font-medium">admin</span>
              </div>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/login'}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => window.location.href = '/register'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Professional Equipment
            <span className="text-blue-600"> Rental</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Rent high-quality tools and equipment for your projects. From power tools to heavy machinery, 
            we have everything you need with flexible rental periods and competitive pricing.
          </p>
          <div className="mt-10 space-x-4">
            <Button 
              onClick={() => window.location.href = '/register'}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              Browse Catalog
              <ShoppingCart className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => window.location.href = '/login'}
              size="lg"
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="mt-16">
          <div className="flex justify-center space-x-4 mb-8">
            <Button variant="default" className="bg-blue-600 text-white">
              Category 1
            </Button>
            <Button variant="outline">
              Audio Visual
            </Button>
            <Button variant="outline">
              Heavy Machinery
            </Button>
            <Button variant="outline">
              Power Tools
            </Button>
          </div>
        </div>
      </div>

      {/* Popular Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Popular Rental Equipment
          </h2>
          <p className="mt-4 text-gray-600">
            Browse our most requested tools and equipment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <i className="fas fa-tools text-4xl text-gray-400"></i>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Angle Grinder</CardTitle>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Power Tools</span>
              </div>
              <CardDescription>
                Heavy duty angle grinder for cutting and grinding metal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hourly:</span>
                  <span className="font-medium">₹12/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Daily:</span>
                  <span className="font-medium">₹35/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Weekly:</span>
                  <span className="font-medium">₹200/week</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  3 Available
                </span>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <i className="fas fa-drill text-4xl text-gray-400"></i>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Electric Drill Set</CardTitle>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Power Tools</span>
              </div>
              <CardDescription>
                Professional 18V cordless drill with multiple bits and case
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hourly:</span>
                  <span className="font-medium">₹8/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Daily:</span>
                  <span className="font-medium">₹25/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Weekly:</span>
                  <span className="font-medium">₹150/week</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  5 Available
                </span>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <i className="fas fa-truck text-4xl text-gray-400"></i>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Mini Excavator</CardTitle>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Heavy Machinery</span>
              </div>
              <CardDescription>
                3-ton mini excavator perfect for landscaping and small construction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hourly:</span>
                  <span className="font-medium">₹65/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Daily:</span>
                  <span className="font-medium">₹450/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Weekly:</span>
                  <span className="font-medium">₹2500/week</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  2 Available
                </span>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button 
            onClick={() => window.location.href = '/catalog'}
            size="lg"
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            View All Equipment
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose RentFlow?
          </h2>
          <p className="mt-4 text-gray-600">
            Everything you need for successful equipment rental
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="p-2 bg-blue-50 rounded-lg w-fit">
                <i className="fas fa-tools text-blue-600 text-xl"></i>
              </div>
              <CardTitle>Quality Equipment</CardTitle>
              <CardDescription>
                Professional-grade tools and machinery maintained to the highest standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Regular maintenance and inspection</li>
                <li>• Latest models and technology</li>
                <li>• Comprehensive insurance coverage</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-green-50 rounded-lg w-fit">
                <i className="fas fa-calendar text-green-600 text-xl"></i>
              </div>
              <CardTitle>Flexible Rental Periods</CardTitle>
              <CardDescription>
                Choose from hourly, daily, weekly, or monthly rental options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Competitive pricing for all periods</li>
                <li>• Easy booking and scheduling</li>
                <li>• Quick pickup and return process</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-purple-50 rounded-lg w-fit">
                <i className="fas fa-headset text-purple-600 text-xl"></i>
              </div>
              <CardTitle>24/7 Support</CardTitle>
              <CardDescription>
                Round-the-clock customer support for any questions or issues
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
