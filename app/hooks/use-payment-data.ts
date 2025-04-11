"use client"

import { useState, useEffect } from 'react'
import { Invoice, Retailer, PaymentData } from '@/types'
import { getInvoices } from '@/app/actions/invoices'
import { getRetailers } from '@/app/actions/retailers'

export function usePaymentData(): PaymentData {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [retailers, setRetailers] = useState<Retailer[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [invoicesData, retailersData] = await Promise.all([
                    getInvoices(),
                    getRetailers()
                ])
                setInvoices(invoicesData)
                setRetailers(retailersData)
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { invoices, retailers, isLoading }
} 