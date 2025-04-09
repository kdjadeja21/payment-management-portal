"use server";

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
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Retailer } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getRetailers(retailerId?: string): Promise<Retailer[]> {
  try {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    let q = query(collection(db, "retailers"), where("userId", "==", userId));
    if (retailerId) {
      q = query(q, where("id", "==", retailerId));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: new Date(doc.data().createdAt),
          updatedAt: new Date(doc.data().updatedAt),
        } as Retailer)
    );
  } catch (error) {
    console.error("Error getting retailers:", error);
    throw error;
  }
}

export async function addRetailer(
  retailerData: Omit<Retailer, "id" | "createdAt" | "updatedAt">
): Promise<Retailer> {
  try {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const docRef = await addDoc(collection(db, "retailers"), {
      ...retailerData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const newRetailer = {
      id: docRef.id,
      ...retailerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newRetailer;
  } catch (error) {
    console.error("Error adding retailer:", error);
    throw error;
  }
}

export async function updateRetailer(
  id: string,
  retailerData: Partial<Retailer>
): Promise<void> {
  try {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const retailerRef = doc(db, "retailers", id);
    await updateDoc(retailerRef, {
      ...retailerData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating retailer:", error);
    throw error;
  }
}

export async function deleteRetailer(retailerId: string): Promise<void> {
  try {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    // Check if retailer exists
    const retailerRef = doc(db, "retailers", retailerId);
    const retailerSnap = await getDoc(retailerRef);
    if (!retailerSnap.exists()) {
      throw new Error("Retailer not found");
    }

    // Check if retailer has any associated invoices
    const invoicesRef = collection(db, "invoices");
    const q = query(
      invoicesRef,
      where("retailerId", "==", retailerId),
      where("userId", "==", userId)
    );
    const invoiceSnapshot = await getDocs(q);

    if (!invoiceSnapshot.empty) {
      throw new Error(
        "Cannot delete retailer with associated invoices. Please delete all invoices first."
      );
    }

    // If no invoices found, proceed with deletion
    await deleteDoc(retailerRef);
  } catch (error) {
    console.error("Error deleting retailer:", error);
    throw error;
  }
}
