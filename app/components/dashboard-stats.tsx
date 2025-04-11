import { TotalRetailersWidget } from "@/app/components/widgets/payment-management/total-retailers-widget"
import { TotalInvoicesWidget } from "@/app/components/widgets/payment-management/total-invoices-widget"
import { TotalPendingWidget } from "@/app/components/widgets/payment-management/total-pending-widget"
import { TotalOverdueWidget } from "@/app/components/widgets/payment-management/total-overdue-widget"

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <TotalRetailersWidget />
      <TotalInvoicesWidget />
      <TotalPendingWidget />
      <TotalOverdueWidget />
    </div>
  )
}