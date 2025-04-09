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
  getDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Payment } from '@/types'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function getPayments(filters?: { invoiceId?: string; retailerId?: string }): Promise<Payment[]> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const paymentsRef = collection(db, "payments")
    let q = query(
      paymentsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    if (filters?.invoiceId) {
      q = query(q, where('invoiceId', '==', filters.invoiceId))
    }

    if (filters?.retailerId) {
      q = query(q, where('retailerId', '==', filters.retailerId))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      paymentDate: doc.data().paymentDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    } as Payment))
  } catch (error) {
    console.error('Error fetching payments:', error)
    throw error
  }
}

export async function addPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    // Ensure required fields are present
    if (!paymentData.retailerName) {
      throw new Error('Retailer name is required')
    }

    if (!Array.isArray(paymentData.invoices)) {
      throw new Error('Invoices array is required')
    }

    // Calculate total amount from invoices
    const totalAmount = paymentData.invoices.reduce((sum, invoice) => sum + invoice.amountApplied, 0)
    if (totalAmount !== paymentData.amount) {
      throw new Error('Payment amount does not match sum of applied amounts')
    }

    const paymentsRef = collection(db, "payments")
    const docRef = await addDoc(paymentsRef, {
      userId,
      retailerId: paymentData.retailerId,
      retailerName: paymentData.retailerName,
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate instanceof Date ? paymentData.paymentDate : new Date(paymentData.paymentDate),
      invoices: paymentData.invoices.map(invoice => ({
        invoiceId: invoice.invoiceId,
        amountApplied: invoice.amountApplied
      })),
      createdAt: serverTimestamp(),
    })

    const newPayment: Payment = {
      id: docRef.id,
      retailerId: paymentData.retailerId,
      retailerName: paymentData.retailerName,
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate instanceof Date ? paymentData.paymentDate : new Date(paymentData.paymentDate),
      invoices: paymentData.invoices.map(invoice => ({
        invoiceId: invoice.invoiceId,
        amountApplied: invoice.amountApplied
      })),
      createdAt: new Date(),
    }

    return newPayment
  } catch (error) {
    console.error('Error adding payment:', error)
    throw error
  }
}

export async function updatePayment(id: string, paymentData: Partial<Payment>): Promise<void> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const paymentRef = doc(db, "payments")
    await updateDoc(paymentRef, {
      ...paymentData,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating payment:', error)
    throw error
  }
}

export async function deletePayment(paymentId: string): Promise<void> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    // Check if payment exists
    const paymentRef = doc(db, "payments", paymentId)
    const paymentSnap = await getDoc(paymentRef)
    if (!paymentSnap.exists()) {
      throw new Error("Payment not found")
    }

    // Verify payment belongs to user
    if (paymentSnap.data().userId !== userId) {
      throw new Error("Unauthorized to delete this payment")
    }

    // Get payment details to update associated invoices
    const paymentData = paymentSnap.data()
    const invoices = paymentData.invoices || []

    // Update associated invoices to remove the payment
    for (const invoice of invoices) {
      const invoiceRef = doc(db, "invoices", invoice.invoiceId)
      const invoiceSnap = await getDoc(invoiceRef)
      
      if (invoiceSnap.exists()) {
        const invoiceData = invoiceSnap.data()
        const newPaidAmount = (invoiceData.paidAmount || 0) - invoice.amountApplied
        const newRemainingAmount = invoiceData.amount - newPaidAmount
        
        await updateDoc(invoiceRef, {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newRemainingAmount <= 0 ? 'paid' : 
                 newRemainingAmount === invoiceData.amount ? 'due' : 
                 invoiceData.status,
          updatedAt: serverTimestamp()
        })
      }
    }

    // Delete the payment
    await deleteDoc(paymentRef)
  } catch (error) {
    console.error('Error deleting payment:', error)
    throw error
  }
}

export async function applyLumpSumPayment(retailerId: string, amount: number): Promise<void> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    // Get all unpaid invoices for this retailer
    const invoicesRef = collection(db, "invoices")
    const q = query(
      invoicesRef,
      where("retailerId", "==", retailerId),
      where("status", "in", ["due", "overdue"]),
      orderBy("dueDate", "asc")
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      throw new Error("No unpaid invoices found for this retailer")
    }

    // Get retailer details
    const retailerRef = doc(db, "retailers", retailerId)
    const retailerSnap = await getDoc(retailerRef)
    if (!retailerSnap.exists()) {
      throw new Error("Retailer not found")
    }
    const retailerName = retailerSnap.data().name

    let remainingPayment = amount
    const paymentInvoices: { invoiceId: string; amountApplied: number }[] = []

    // Apply payment to each invoice, starting with oldest
    for (const doc of snapshot.docs) {
      if (remainingPayment <= 0) break

      const invoiceData = doc.data()
      const currentPaidAmount = invoiceData.paidAmount || 0
      const invoiceRemainingAmount = invoiceData.amount - currentPaidAmount
      
      const paymentToApply = Math.min(remainingPayment, invoiceRemainingAmount)
      const newPaidAmount = currentPaidAmount + paymentToApply
      
      // Update invoice
      await updateDoc(doc.ref, {
        paidAmount: newPaidAmount,
        remainingAmount: invoiceData.amount - newPaidAmount,
        status: newPaidAmount >= invoiceData.amount ? 'paid' : invoiceData.status,
        updatedAt: serverTimestamp(),
      })

      // Add to payment invoices array
      paymentInvoices.push({
        invoiceId: doc.id,
        amountApplied: paymentToApply
      })

      remainingPayment -= paymentToApply
    }

    if (remainingPayment > 0) {
      throw new Error("Payment amount exceeds total unpaid invoices")
    }

    // Create payment record
    await addPayment({
      retailerId,
      retailerName,
      amount,
      paymentDate: new Date(),
      invoices: paymentInvoices
    })

  } catch (error) {
    console.error('Error applying lump sum payment:', error)
    throw error
  }
}