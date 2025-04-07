export interface Invoice {
  id: string
  retailerId: string
  retailerName: string
  invoiceNumber: string
  invoiceDate: Date
  dueDate: Date
  amount: number
  status: "paid" | "due" | "overdue"
  paidAmount: number
  createdAt: Date
  updatedAt: Date
} 