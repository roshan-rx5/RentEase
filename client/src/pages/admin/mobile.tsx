import { MobileCompanion } from "@/components/ui/mobile-companion";
import AdminLayout from "@/components/layout/admin-layout";

export default function AdminMobile() {
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <MobileCompanion />
      </div>
    </AdminLayout>
  );
}