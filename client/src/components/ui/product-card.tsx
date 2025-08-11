import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductWithCategory } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithCategory;
  onBook: () => void;
  selectedDates?: { from?: Date; to?: Date };
}

export default function ProductCard({ product, onBook, selectedDates }: ProductCardProps) {
  const isAvailable = product.availableQuantity && product.availableQuantity > 0;
  
  const calculatePrice = () => {
    if (!selectedDates?.from || !selectedDates?.to) {
      return null;
    }
    
    const duration = Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24));
    
    if (duration <= 1 && product.hourlyRate) {
      const hours = Math.max(1, Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60)));
      return { amount: Number(product.hourlyRate) * hours, unit: `${hours} hour${hours > 1 ? 's' : ''}` };
    } else if (duration <= 7 && product.dailyRate) {
      return { amount: Number(product.dailyRate) * duration, unit: `${duration} day${duration > 1 ? 's' : ''}` };
    } else if (duration <= 30 && product.weeklyRate) {
      const weeks = Math.ceil(duration / 7);
      return { amount: Number(product.weeklyRate) * weeks, unit: `${weeks} week${weeks > 1 ? 's' : ''}` };
    } else if (product.monthlyRate) {
      const months = Math.ceil(duration / 30);
      return { amount: Number(product.monthlyRate) * months, unit: `${months} month${months > 1 ? 's' : ''}` };
    } else if (product.dailyRate) {
      return { amount: Number(product.dailyRate) * duration, unit: `${duration} day${duration > 1 ? 's' : ''}` };
    }
    
    return null;
  };

  const calculatedPrice = calculatePrice();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <i className="fas fa-box text-4xl text-gray-400"></i>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
          {product.category && (
            <Badge variant="secondary" className="text-xs">
              {product.category.name}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        
        {calculatedPrice ? (
          <div className="mb-3 p-2 bg-primary-50 rounded-lg">
            <div className="text-lg font-bold text-primary-700">
              ₹{calculatedPrice.amount.toLocaleString()}
            </div>
            <div className="text-xs text-primary-600">for {calculatedPrice.unit}</div>
          </div>
        ) : (
          <div className="space-y-1 mb-3">
            {product.hourlyRate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hourly:</span>
                <span className="font-medium">₹{Number(product.hourlyRate)}/hr</span>
              </div>
            )}
            {product.dailyRate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Daily:</span>
                <span className="font-medium">₹{Number(product.dailyRate)}/day</span>
              </div>
            )}
            {product.weeklyRate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Weekly:</span>
                <span className="font-medium">₹{Number(product.weeklyRate)}/week</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Badge 
            variant={isAvailable ? "default" : "destructive"}
            className="text-xs"
          >
            {isAvailable 
              ? `${product.availableQuantity} Available` 
              : "Out of Stock"
            }
          </Badge>
          <Button 
            onClick={onBook}
            disabled={!isAvailable}
            size="sm"
            className={`${isAvailable 
              ? "bg-primary-500 hover:bg-primary-600 text-white" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isAvailable ? "Book Now" : "Unavailable"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
