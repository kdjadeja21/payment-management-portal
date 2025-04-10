import DashboardLayout from "@/app/components/dashboard-layout"
import { ReactNode } from "react"

interface OrderManagementLayoutProps {
  children: ReactNode
}

export default function OrderManagementLayout({ children }: OrderManagementLayoutProps) {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="flex-1 space-y-4 p-8 pt-6">
          {children}
        </div>
      </div>
    </DashboardLayout>
  )
} 