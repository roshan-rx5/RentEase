import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface RentalCalendarProps {
  selected?: { from?: Date; to?: Date };
  onSelect?: (range: { from?: Date; to?: Date }) => void;
  className?: string;
}

export default function RentalCalendar({ selected, onSelect, className }: RentalCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>(selected || {});

  const handleSelect = (selectedRange: { from?: Date; to?: Date }) => {
    setRange(selectedRange);
    onSelect?.(selectedRange);
    
    // Close popover when both dates are selected
    if (selectedRange.from && selectedRange.to) {
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!range.from) return "Select rental dates";
    if (!range.to) return format(range.from, "MMM dd, yyyy");
    return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd, yyyy")}`;
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !range.from && "text-muted-foreground"
            )}
          >
            <i className="fas fa-calendar mr-2"></i>
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range.from}
            selected={{ from: range.from, to: range.to }}
            onSelect={(selectedRange) => {
              if (selectedRange) {
                handleSelect(selectedRange);
              }
            }}
            numberOfMonths={2}
            disabled={(date) => date < new Date()}
          />
          <div className="p-3 border-t border-gray-200">
            <div className="flex justify-between space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setRange({});
                  onSelect?.({});
                }}
              >
                Clear
              </Button>
              <Button 
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={!range.from}
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
