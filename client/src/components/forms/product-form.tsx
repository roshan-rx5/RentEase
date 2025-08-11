import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { ProductWithCategory, Category } from "@shared/schema";
import { z } from "zod";

const productFormSchema = insertProductSchema.extend({
  hourlyRate: z.string().optional(),
  dailyRate: z.string().optional(),
  weeklyRate: z.string().optional(),
  monthlyRate: z.string().optional(),
  securityDeposit: z.string().optional(),
  totalQuantity: z.string(),
  availableQuantity: z.string(),
});

interface ProductFormProps {
  product?: ProductWithCategory;
  categories: Category[];
  onSuccess: () => void;
}

export default function ProductForm({ product, categories, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      categoryId: product?.categoryId || "",
      imageUrl: product?.imageUrl || "",
      isRentable: product?.isRentable ?? true,
      totalQuantity: product?.totalQuantity?.toString() || "1",
      availableQuantity: product?.availableQuantity?.toString() || "1",
      hourlyRate: product?.hourlyRate?.toString() || "",
      dailyRate: product?.dailyRate?.toString() || "",
      weeklyRate: product?.weeklyRate?.toString() || "",
      monthlyRate: product?.monthlyRate?.toString() || "",
      securityDeposit: product?.securityDeposit?.toString() || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof productFormSchema>) => {
      const payload = {
        ...data,
        totalQuantity: parseInt(data.totalQuantity),
        availableQuantity: parseInt(data.availableQuantity),
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
        dailyRate: data.dailyRate ? parseFloat(data.dailyRate) : null,
        weeklyRate: data.weeklyRate ? parseFloat(data.weeklyRate) : null,
        monthlyRate: data.monthlyRate ? parseFloat(data.monthlyRate) : null,
        securityDeposit: data.securityDeposit ? parseFloat(data.securityDeposit) : null,
        categoryId: data.categoryId || null,
        imageUrl: data.imageUrl || null,
      };

      if (product) {
        await apiRequest(`/api/products/${product.id}`, "PUT", payload);
      } else {
        await apiRequest("/api/products", "POST", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Product ${product ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: `Failed to ${product ? 'update' : 'create'} product`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof productFormSchema>) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the product..."
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                Optional: URL to an image of the product
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availableQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Pricing</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Rate (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weeklyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly Rate (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rate (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="securityDeposit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Deposit (₹)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>
                  Refundable security deposit amount
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isRentable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Available for Rental
                </FormLabel>
                <FormDescription>
                  Enable this product for customer bookings
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {product ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                {product ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
