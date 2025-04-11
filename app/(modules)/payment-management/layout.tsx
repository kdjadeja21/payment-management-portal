import { ReactNode } from "react"

interface PaymentManagementLayoutProps {
  children: ReactNode
}

export default function PaymentManagementLayout({ children }: PaymentManagementLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
        {children}
    </div>
  )
} 