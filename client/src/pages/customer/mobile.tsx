import { MobileCompanion } from "@/components/ui/mobile-companion";
import CustomerLayout from "@/components/layout/customer-layout";

export default function CustomerMobile() {
  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto p-6">
        <MobileCompanion />
      </div>
    </CustomerLayout>
  );
}