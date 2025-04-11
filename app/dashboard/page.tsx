import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import { DashboardStats } from "@/app/components/dashboard-stats"
import { RecentInvoicesWidget } from "@/app/components/widgets/payment-management/recent-invoices-widget"
import { OutstandingBalancesWidget } from "@/app/components/widgets/payment-management/outstanding-balances-widget"
import DashboardLayout from "@/app/components/dashboard-layout"

async function DashboardContent() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <DashboardStats />
      
      <div className="grid gap-6 md:grid-cols-2">
        <RecentInvoicesWidget />
        <OutstandingBalancesWidget />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </DashboardLayout>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-10 w-[180px] bg-muted animate-pulse rounded" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </div>
            <div className="mt-4">
              <div className="h-8 w-28 bg-muted animate-pulse rounded" />
              <div className="mt-1 h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {Array(2).fill(0).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div>
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="mt-2 h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="mt-6 space-y-4">
              {Array(5).fill(0).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}