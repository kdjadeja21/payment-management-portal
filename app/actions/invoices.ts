'use server'

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  getDoc,
  limit,
  FieldValue
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Invoice, DueCondition } from '@/types'
import { calculateDueDays, getStatusFromDueDays } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function getInvoices(filters?: {
  retailerId?: string
  dueDays?: {
    operator: '>' | '<' | '='
    value: number
  }
}): Promise<Invoice[]> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Not authenticated")
  }

  const invoicesRef = collection(db, "invoices")
  let q = query(
    invoicesRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(100)
  )

  // Add retailer filter if provided
  if (filters?.retailerId) {
    q = query(q, where("retailerId", "==", filters.retailerId))
  }

  const snapshot = await getDocs(q)

  const invoices: Invoice[] = snapshot.docs.map(doc => {
    const data = doc.data()
    const today = new Date()
    const dueDate = data.dueDate.toDate()
    const dueDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    const invoice: Invoice = {
      id: doc.id,
      retailerId: data.retailerId,
      retailerName: data.retailerName,
      invoiceName: data.invoiceName,
      amount: data.amount,
      invoiceDate: data.invoiceDate.toDate(),
      dueDate: dueDate,
      status: data.status as 'paid' | 'due' | 'overdue',
      paidAmount: data.paidAmount || 0,
      remainingAmount: data.amount - (data.paidAmount || 0),
      dueDays: dueDays,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    }

    return invoice
  })

  // Apply due days filter in memory since Firestore doesn't support complex queries
  if (filters?.dueDays) {
    const { operator, value } = filters.dueDays
    return invoices.filter(invoice => {
      switch (operator) {
        case '>':
          return invoice.dueDays > value
        case '<':
          return invoice.dueDays < value
        case '=':
          return invoice.dueDays === value
        default:
          return true
      }
    })
  }

  return invoices
}

export async function addInvoice(invoiceData: Omit<Invoice, 'id' | 'status' | 'dueDays' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const dueDays = calculateDueDays(invoiceData.dueDate)
    const status = getStatusFromDueDays(dueDays, false)

    const invoicesRef = collection(db, "invoices")
    const docRef = await addDoc(invoicesRef, {
      ...invoiceData,
      userId,
      status,
      paidAmount: 0,
      remainingAmount: invoiceData.amount,
      invoiceDate: Timestamp.fromDate(invoiceData.invoiceDate),
      dueDate: Timestamp.fromDate(invoiceData.dueDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    const newInvoice = {
      id: docRef.id,
      userId,
      ...invoiceData,
      status,
      dueDays,
      paidAmount: 0,
      remainingAmount: invoiceData.amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return newInvoice
  } catch (error) {
    console.error('Error adding invoice:', error)
    throw error
  }
}

export async function updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<void> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const invoiceRef = doc(db, "invoices", id)
    const invoiceSnap = await getDoc(invoiceRef)

    if (!invoiceSnap.exists() || invoiceSnap.data().userId !== userId) {
      throw new Error('Invoice not found or unauthorized')
    }

    const currentData = invoiceSnap.data()
    
    // Recalculate status if dueDate changes
    if (invoiceData.dueDate && invoiceData.dueDate !== currentData.dueDate) {
      const isPaid = currentData.paidAmount === currentData.amount
      const dueDays = calculateDueDays(invoiceData.dueDate)
      invoiceData.status = getStatusFromDueDays(dueDays, isPaid)
    }

    // Convert Date fields to Firestore Timestamp
    const dataToUpdate = {
      ...(invoiceData as Omit<Partial<Invoice>, 'invoiceDate' | 'dueDate'>),
      updatedAt: serverTimestamp(),
    } as Record<string, any>;

    if (invoiceData.invoiceDate instanceof Date) {
      dataToUpdate.invoiceDate = Timestamp.fromDate(invoiceData.invoiceDate);
    }
    if (invoiceData.dueDate instanceof Date) {
      dataToUpdate.dueDate = Timestamp.fromDate(invoiceData.dueDate);
    }

    await updateDoc(invoiceRef, dataToUpdate)
  } catch (error) {
    console.error('Error updating invoice:', error)
    throw error
  }
}


export async function deleteInvoice(invoiceId: string): Promise<void> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    // Check if invoice exists
    const invoiceRef = doc(db, "invoices", invoiceId)
    const invoiceSnap = await getDoc(invoiceRef)
    if (!invoiceSnap.exists()) {
      throw new Error("Invoice not found")
    }

    // Check if invoice has any associated payments
    const paymentsRef = collection(db, "payments")
    const q = query(
      paymentsRef,
      where("userId", "==", userId),
      where("invoices", "array-contains", { invoiceId })
    )
    const paymentSnapshot = await getDocs(q)

    if (!paymentSnapshot.empty) {
      throw new Error("Cannot delete invoice with associated payments. Please delete all related payments first.")
    }

    // If no payments found, proceed with deletion
    await deleteDoc(invoiceRef)
  } catch (error) {
    console.error('Error deleting invoice:', error)
    throw error
  }
}

export async function markAsPaid(invoiceId: string): Promise<void> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const invoiceRef = doc(db, "invoices", invoiceId)
    const snapshot = await getDoc(invoiceRef)

    if (!snapshot.exists() || snapshot.data().userId !== userId) {
      throw new Error('Invoice not found or unauthorized')
    }

    const invoiceData = snapshot.data()

    await updateDoc(invoiceRef, {
      status: 'paid',
      paidAmount: invoiceData.amount,
      remainingAmount: 0,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    throw error
  }
}