export interface Retailer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  retailerId: string
  retailerName: string
  invoiceName: string
  amount: number
  invoiceDate: Date
  dueDate: Date
  status: 'paid' | 'due' | 'overdue'
  paidAmount: number
  remainingAmount: number
  dueDays: number
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  retailerId: string
  retailerName: string
  amount: number
  paymentDate: Date
  invoices: {
    invoiceId: string
    amountApplied: number
  }[]
  createdAt: Date
}

export interface ActivityLog {
  id: string
  actionType: string
  entityType: string
  entityId: string
  details: any
  userId: string
  timestamp: Date
  createdAt: Date
}

export interface DueCondition {
  condition: '>' | '<' | '='
  value: number
}

export interface InvoiceFilters {
  retailerId?: string
  status?: 'paid' | 'due' | 'overdue'
  startDate?: Date
  endDate?: Date
  dueCondition?: DueCondition
}