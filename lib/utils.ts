import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(dateObj)
  } catch (error) {
    console.error('Error formatting date and time:', error)
    return 'Invalid Date'
  }
}

export function calculateDueDays(dueDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dueDateObj = new Date(dueDate)
  dueDateObj.setHours(0, 0, 0, 0)
  
  const diffTime = dueDateObj.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

export function getStatusFromDueDays(dueDays: number, isPaid: boolean): 'paid' | 'due' | 'overdue' {
  if (isPaid) return 'paid'
  return dueDays < 0 ? 'overdue' : 'due'
}

export function getCardColor(title: string): {
  bgColor: string;
  textColor: string;
} {
  const colors = {
    'Dashboard': { bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
    'Retailers': { bgColor: 'bg-green-50', textColor: 'text-green-700' },
    'Invoices': { bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
    'Payments': { bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
    'Reports': { bgColor: 'bg-red-50', textColor: 'text-red-700' },
    'Settings': { bgColor: 'bg-gray-50', textColor: 'text-gray-700' },
    'Outstanding Balances': { bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
    'Recent Invoices': { bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
    'Account Settings': { bgColor: 'bg-teal-50', textColor: 'text-teal-700' },
  };

  return colors[title as keyof typeof colors] || { bgColor: 'bg-gray-50', textColor: 'text-gray-700' };
}