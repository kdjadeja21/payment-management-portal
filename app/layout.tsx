import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/app/components/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Udyog360 | Business Management Portal',
  description: 'Professional Business Management Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
          termsPageUrl: "https://clerk.com/terms",
        },
      }}
    >
      <html lang="en" className="light">
        <body className={inter.className}>
          <ErrorBoundary>
            <main className="container mx-auto">
              {children}
            </main>
          </ErrorBoundary>
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}