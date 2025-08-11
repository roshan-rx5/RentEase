import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RentalCalendar from "@/components/ui/rental-calendar";
import type { ProductWithCategory } from "@shared/schema";

const bookingFormSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  returnAddress: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

interface BookingFormProps {
  product: ProductWithCategory;
  onSubmit: (data: z.infer<typeof bookingFormSchema>) => void;
  isLoading: boolean;
  preSelectedDates?: { from?: Date; to?: Date };
}

export default function BookingForm({ product, onSubmit, isLoading, preSelectedDates }: BookingFormProps) {
  const [selectedDates, setSelectedDates] = useState<{ from?: Date; to?: Date }>(preSelectedDates || {});
  const [sameAddress, setSameAddress] = useState(true);

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      quantity: 1,
      pickupAddress: "",
      returnAddress: "",
      notes: "",
      startDate: preSelectedDates?.from,
      endDate: preSelectedDates?.to,
    },
  });

  const calculateTotal = () => {
    const { startDate, endDate, quantity } = form.watch();
    
    if (!startDate || !endDate || !quantity) return null;
    
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    let unitRate = 0;
    let rateType = "";
    
    if (duration <= 1 && product.hourlyRate) {
      const hours = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)));
      unitRate = Number(product.hourlyRate) * hours;
      rateType = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (duration <= 7 && product.dailyRate) {
      unitRate = Number(product.dailyRate) * duration;
      rateType = `${duration} day${duration > 1 ? 's' : ''}`;
    } else if (duration <= 30 && product.weeklyRate) {
      const weeks = Math.ceil(duration / 7);
      unitRate = Number(product.weeklyRate) * weeks;
      rateType = `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else if (product.monthlyRate) {
      const months = Math.ceil(duration / 30);
      unitRate = Number(product.monthlyRate) * months;
      rateType = `${months} month${months > 1 ? 's' : ''}`;
    } else if (product.dailyRate) {
      unitRate = Number(product.dailyRate) * duration;
      rateType = `${duration} day${duration > 1 ? 's' : ''}`;
    }

    const subtotal = unitRate * quantity;
    const securityDeposit = product.securityDeposit ? Number(product.securityDeposit) : 0;
    const total = subtotal + securityDeposit;

    return {
      duration,
      rateType,
      unitRate,
      subtotal,
      securityDeposit,
      total,
    };
  };

  const handleDateSelect = (dates: { from?: Date; to?: Date }) => {
    setSelectedDates(dates);
    if (dates.from) form.setValue("startDate", dates.from);
    if (dates.to) form.setValue("endDate", dates.to);
  };

  const handleSubmit = (data: z.infer<typeof bookingFormSchema>) => {
    const finalData = {
      ...data,
      returnAddress: sameAddress ? data.pickupAddress : data.returnAddress,
    };
    onSubmit(finalData);
  };

  const pricing = calculateTotal();
  const maxQuantity = Math.min(product.availableQuantity || 0, 10);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Rental Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RentalCalendar
                  selected={selectedDates}
                  onSelect={handleDateSelect}
                />
                
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={maxQuantity}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum available: {product.availableQuantity}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the address where we should deliver the equipment..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sameAddress"
                  checked={sameAddress}
                  onChange={(e) => setSameAddress(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="sameAddress" className="text-sm text-gray-700">
                  Return to same address
                </label>
              </div>

              {!sameAddress && (
                <FormField
                  control={form.control}
                  name="returnAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the address where we should collect the equipment..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special instructions or requirements..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          {pricing && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Rental Duration:</span>
                    <span>{pricing.rateType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate per unit:</span>
                    <span>₹{pricing.unitRate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{form.watch("quantity")} × ₹{pricing.unitRate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{pricing.subtotal.toLocaleString()}</span>
                  </div>
                  {pricing.securityDeposit > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>Security Deposit:</span>
                        <span>₹{pricing.securityDeposit.toLocaleString()}</span>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>₹{pricing.total.toLocaleString()}</span>
                  </div>
                  {pricing.securityDeposit > 0 && (
                    <p className="text-sm text-gray-600">
                      * Security deposit will be refunded after equipment return
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600"
            size="lg"
            disabled={isLoading || !pricing}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating Order...
              </>
            ) : (
              <>
                <i className="fas fa-credit-card mr-2"></i>
                Proceed to Payment
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
