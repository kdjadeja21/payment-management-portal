"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { BarChart3, FileText, Home, Menu, Store, CreditCard, Settings, Crown } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SearchDialog } from "@/app/components/search"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: NavItem[] // Added children for tree view
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Payment Management",
    href: "#", // Set href to "#" to make it non-clickable
    icon: CreditCard,
    children: [
      {
        title: "Retailers",
        href: "/payment-management/retailers",
        icon: Store,
      },
      {
        title: "Invoices",
        href: "/payment-management/invoices",
        icon: FileText,
      },
      {
        title: "Payments",
        href: "/payment-management/payments",
        icon: CreditCard,
      },
      {
        title: "Reports",
        href: "/payment-management/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Subscription",
    href: "/subscription",
    icon: Crown,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  }
]

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => (
      <div key={item.href}>
        {/* {item.href === "#" && (
          <div className="flex items-center justify-center my-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-xs font-semibold text-gray-900">{item.title}</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

        )} */}

        {
          item.href === "#" ?
            <div className="flex items-center justify-center my-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-xs font-semibold text-gray-900">{item.title}</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            :
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg mt-2 pl-2 py-2 transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className={item.href === "#" ? "text-gray-500 cursor-not-allowed" : ""}>{item.title}</span> {/* Disable styling */}
            </Link>
        }

        {item.children && (
          <div className="ml-4">
            {renderNavItems(item.children)} {/* Recursive rendering for tree view */}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-3 sm:max-w-lg"> {/* Adjusted width for web view */}
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setOpen(false)}
              >
                <CreditCard className="h-6 w-6" />
                <span className="font-bold">Payment Portal</span>
              </Link>
              {renderNavItems(navItems)} {/* Render nav items with tree view */}
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <CreditCard className="h-6 w-6" />
          <span className="hidden md:inline-block">Udyog360</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <SearchDialog />
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
        </div>
      </header>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            {renderNavItems(navItems)} {/* Render nav items with tree view */}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}