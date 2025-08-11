import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, User, Phone, Mail, MapPin, CreditCard, Shield } from "lucide-react";
import { format } from "date-fns";

// Enhanced booking form schema with comprehensive user details
const bookingSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  alternatePhone: z.string().optional(),
  
  // Address Information
  address: z.string().min(10, "Please provide complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(4, "ZIP code is required"),
  
  // Pickup and Return Addresses
  pickupAddress: z.string().min(10, "Pickup address is required"),
  returnAddress: z.string().optional(),
  sameAddress: z.boolean().default(true),
  
  // Rental Details
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  purpose: z.string().min(10, "Please describe the rental purpose"),
  
  // Additional Information
  companyName: z.string().optional(),
  emergencyContact: z.string().optional(),
  specialRequirements: z.string().optional(),
  
  // Agreement
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to terms and conditions"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface EnhancedBookingFormProps {
  product: any;
  onComplete?: (orderId: string) => void;
  className?: string;
}

export default function EnhancedBookingForm({ product, onComplete, className = "" }: EnhancedBookingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      startDate: product.selectedDates?.from || new Date(),
      endDate: product.selectedDates?.to || new Date(Date.now() + 24 * 60 * 60 * 1000),
      quantity: product.quantity || 1,
      agreeToTerms: false,
      sameAddress: true,
      pickupAddress: "",
      returnAddress: "",
    },
  });

  const { watch } = form;
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const quantity = watch("quantity");

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const days = calculateDays();
    const rate = parseFloat(product.dailyRate || "0");
    const rentalAmount = days * rate * quantity;
    const deposit = parseFloat(product.securityDeposit || "0");
    return {
      rental: rentalAmount,
      deposit: deposit,
      total: rentalAmount + deposit,
      days: days
    };
  };

  const createOrderMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const pricing = calculateTotal();
      
      const orderData = {
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        totalAmount: pricing.total,
        
        // Customer details
        customerDetails: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          alternatePhone: data.alternatePhone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          companyName: data.companyName,
          emergencyContact: data.emergencyContact,
        },
        
        // Pickup and Return Addresses
        pickupAddress: data.pickupAddress,
        returnAddress: data.sameAddress ? data.pickupAddress : data.returnAddress,
        
        // Rental details
        rentalPurpose: data.purpose,
        specialRequirements: data.specialRequirements,
        
        items: [{
          productId: product.id,
          quantity: data.quantity,
          unitRate: product.dailyRate || 0,
          totalAmount: pricing.rental
        }]
      };

      const response = await apiRequest("/api/orders", "POST", orderData);
      return response;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Booking Created Successfully!",
        description: `Order ${order.orderNumber} has been created. Proceed to payment.`,
      });
      
      if (onComplete) {
        onComplete(order.id);
      } else {
        window.location.href = `/checkout/${order.id}`;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    createOrderMutation.mutate(data);
  };

  const nextStep = async () => {
    const fieldsToValidate: (keyof BookingFormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate.push("fullName", "email", "phone");
        break;
      case 2:
        fieldsToValidate.push("address", "city", "state", "zipCode");
        break;
      case 3:
        fieldsToValidate.push("pickupAddress");
        if (!form.getValues("sameAddress")) {
          fieldsToValidate.push("returnAddress");
        }
        fieldsToValidate.push("startDate", "endDate", "quantity", "purpose");
        break;
      case 4:
        fieldsToValidate.push("agreeToTerms");
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const pricing = calculateTotal();

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Your Rental Booking
        </CardTitle>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600">Step {step} of {totalSteps}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...form.register("fullName")}
                    placeholder="Your complete name"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="your.email@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="+91 9876543210"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    {...form.register("alternatePhone")}
                    placeholder="Backup contact number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input
                  id="companyName"
                  {...form.register("companyName")}
                  placeholder="Your company or organization"
                />
              </div>
            </div>
          )}

          {/* Step 2: Address Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Address Information</h3>
              </div>

              <div>
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea
                  id="address"
                  {...form.register("address")}
                  placeholder="House/Flat No., Street, Area, Landmark"
                  rows={3}
                />
                {form.formState.errors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="Your city"
                  />
                  {form.formState.errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    {...form.register("state")}
                    placeholder="Your state"
                  />
                  {form.formState.errors.state && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.state.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    {...form.register("zipCode")}
                    placeholder="PIN code"
                  />
                  {form.formState.errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.zipCode.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  {...form.register("emergencyContact")}
                  placeholder="Name and phone of emergency contact"
                />
              </div>
            </div>
          )}

          {/* Step 3: Rental Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Rental Details</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !startDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => form.setValue("startDate", date!)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !endDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => form.setValue("endDate", date!)}
                        disabled={(date) => date < (startDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.availableQuantity || 1}
                  {...form.register("quantity", { valueAsNumber: true })}
                />
                {form.formState.errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.quantity.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="purpose">Rental Purpose *</Label>
                <Textarea
                  id="purpose"
                  {...form.register("purpose")}
                  placeholder="Describe how you'll use this equipment"
                  rows={3}
                />
                {form.formState.errors.purpose && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.purpose.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="specialRequirements">Special Requirements</Label>
                <Textarea
                  id="specialRequirements"
                  {...form.register("specialRequirements")}
                  placeholder="Any special requirements or instructions"
                  rows={2}
                />
              </div>

              {/* Pickup and Return Address Section */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <h4 className="text-md font-semibold">Pickup & Return Address</h4>
                </div>

                <div>
                  <Label htmlFor="pickupAddress">Pickup Address *</Label>
                  <Textarea
                    id="pickupAddress"
                    {...form.register("pickupAddress")}
                    placeholder="Where should we deliver the equipment?"
                    rows={3}
                  />
                  {form.formState.errors.pickupAddress && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.pickupAddress.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    {...form.register("sameAddress")}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="sameAddress" className="text-sm">
                    Return to the same address
                  </Label>
                </div>

                {!form.watch("sameAddress") && (
                  <div>
                    <Label htmlFor="returnAddress">Return Address *</Label>
                    <Textarea
                      id="returnAddress"
                      {...form.register("returnAddress")}
                      placeholder="Where should we collect the equipment?"
                      rows={3}
                    />
                    {form.formState.errors.returnAddress && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.returnAddress.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Summary */}
              {startDate && endDate && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Price Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Rental ({pricing.days} days × {quantity} items)</span>
                        <span>₹{pricing.rental.toLocaleString()}</span>
                      </div>
                      {pricing.deposit > 0 && (
                        <div className="flex justify-between">
                          <span>Security Deposit</span>
                          <span>₹{pricing.deposit.toLocaleString()}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total Amount</span>
                        <span>₹{pricing.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 4: Review and Agreement */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Review & Agreement</h3>
              </div>

              {/* Order Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Product:</strong> {product.name}</div>
                    <div><strong>Customer:</strong> {form.watch("fullName")}</div>
                    <div><strong>Email:</strong> {form.watch("email")}</div>
                    <div><strong>Phone:</strong> {form.watch("phone")}</div>
                    <div><strong>Address:</strong> {form.watch("address")}, {form.watch("city")}</div>
                    <div><strong>Rental Period:</strong> {startDate && format(startDate, "PPP")} to {endDate && format(endDate, "PPP")}</div>
                    <div><strong>Quantity:</strong> {quantity}</div>
                    <div><strong>Total Amount:</strong> ₹{pricing.total.toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  {...form.register("agreeToTerms")}
                  className="mt-1"
                />
                <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                  I agree to the terms and conditions, rental policies, and confirm that all information provided is accurate. 
                  I understand that the security deposit will be refunded after successful return of the equipment.
                </Label>
              </div>
              {form.formState.errors.agreeToTerms && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.agreeToTerms.message}
                </p>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button type="button" onClick={nextStep} className="ml-auto">
                Next Step
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={createOrderMutation.isPending}
                className="ml-auto"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating Booking...
                  </>
                ) : (
                  "Complete Booking"
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}