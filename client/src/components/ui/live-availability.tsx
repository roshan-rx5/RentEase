import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

interface LiveAvailabilityProps {
  productId: string;
  startDate?: Date;
  endDate?: Date;
  className?: string;
}

export default function LiveAvailability({ productId, startDate, endDate, className = "" }: LiveAvailabilityProps) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const { data: availability, isLoading, refetch } = useQuery({
    queryKey: ["/api/products", productId, "availability", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate.toISOString());
      if (endDate) params.set('endDate', endDate.toISOString());
      
      const response = await fetch(`/api/products/${productId}/availability?${params.toString()}`);
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const getAvailabilityStatus = () => {
    if (isLoading) return { status: "loading", message: "Checking availability...", icon: Clock };
    if (!availability) return { status: "unknown", message: "Unable to check", icon: AlertCircle };
    
    const available = availability.availableQuantity || 0;
    const total = availability.totalQuantity || 0;
    
    if (available === 0) {
      return { status: "unavailable", message: "Not Available", icon: AlertCircle };
    } else if (available < total * 0.3) {
      return { status: "limited", message: `Only ${available} left`, icon: AlertCircle };
    } else {
      return { status: "available", message: `${available} available`, icon: CheckCircle };
    }
  };

  const { status, message, icon: Icon } = getAvailabilityStatus();

  const statusStyles = {
    available: "bg-green-100 text-green-800 border-green-200",
    limited: "bg-yellow-100 text-yellow-800 border-yellow-200",
    unavailable: "bg-red-100 text-red-800 border-red-200",
    loading: "bg-gray-100 text-gray-800 border-gray-200",
    unknown: "bg-gray-100 text-gray-800 border-gray-200"
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Badge 
          variant="outline" 
          className={`flex items-center gap-1 px-3 py-1 ${statusStyles[status as keyof typeof statusStyles]}`}
        >
          <Icon className="h-3 w-3" />
          {message}
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-xs text-gray-500"
        >
          Refresh
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Updated: {lastUpdated.toLocaleTimeString()}
      </div>
      
      {startDate && endDate && (
        <div className="text-xs text-gray-600">
          For: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </div>
      )}
    </div>
  );
}