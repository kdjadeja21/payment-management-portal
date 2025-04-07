'use server'

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  doc, 
  serverTimestamp,
  Timestamp,
  query,
  where
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Retailer } from '@/types'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function getRetailers(): Promise<Retailer[]> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const q = query(collection(db, 'retailers'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: new Date(doc.data().createdAt),
      updatedAt: new Date(doc.data().updatedAt),
    } as Retailer))
  } catch (error) {
    console.error('Error getting retailers:', error)
    throw error
  }
}

export async function addRetailer(retailerData: Omit<Retailer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Retailer> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const docRef = await addDoc(collection(db, 'retailers'), {
      ...retailerData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const newRetailer = {
      id: docRef.id,
      ...retailerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return newRetailer
  } catch (error) {
    console.error('Error adding retailer:', error)
    throw error
  }
}

export async function updateRetailer(id: string, retailerData: Partial<Retailer>): Promise<void> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const retailerRef = doc(db, 'retailers', id)
    await updateDoc(retailerRef, {
      ...retailerData,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating retailer:', error)
    throw error
  }
}

export async function deleteRetailer(id: string): Promise<void> {
  try {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const retailerRef = doc(db, 'retailers', id)
    await deleteDoc(retailerRef)
  } catch (error) {
    console.error('Error deleting retailer:', error)
    throw error
  }
}