"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getInvoices } from "@/app/actions/invoices"
import { getRetailers } from "@/app/actions/retailers"
import { formatCurrency, formatDate } from "@/lib/utils"

interface SearchResult {
  id: string
  type: 'retailer' | 'invoice'
  title: string
  subtitle: string
  href: string
}

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args)
      }, delay)
    }
  }

  const handleSearch = useCallback(debounce(async (search: string) => {
    if (!search) {
      setSearchResults([])
      return
    }

    setLoading(true)
    const [invoices, retailers] = await Promise.all([
      getInvoices(),
      getRetailers()
    ])
    setLoading(false)

    const results: SearchResult[] = []

    const searchLower = search.toLowerCase(); // Store lowercase search term for performance
    retailers.forEach(retailer => {
      if (retailer.name.toLowerCase().includes(searchLower)) {
        results.push({
          id: retailer.id,
          type: 'retailer',
          title: retailer.name,
          subtitle: `Retailer`,
          href: `/payment-management/retailers/${retailer.id}`
        })
      }
    })

    invoices.forEach(invoice => {
      if (
        invoice.retailerName.toLowerCase().includes(searchLower) ||
        invoice.invoiceName.toLowerCase().includes(searchLower)
      ) {
        results.push({
          id: invoice.id,
          type: 'invoice',
          title: `${invoice.retailerName} - ${invoice.invoiceName}`,
          subtitle: `${formatCurrency(invoice.amount)} • ${formatDate(invoice.invoiceDate)}`,
          href: `/payment-management/invoices/${invoice.id}`
        })
      }
    })

    setSearchResults(results)
  }, 300), [])

  const handleClose = () => {
    setOpen(false)
    setSearchResults([]) // Clear results when dialog closes
    setSearchTerm("") // Clear search term
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-gray-700 sm:pr-12 md:w-40 lg:w-75 hover:bg-gray-100"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search retailers and invoices...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={handleClose}>        
        <DialogContent className="p-6 bg-white rounded-lg shadow-lg">
          <DialogTitle className="text-xl font-semibold text-gray-800">Search</DialogTitle>
          <input
            type="text"
            placeholder="Search retailers and invoices..."
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value
              setSearchTerm(value)
              handleSearch(value)
            }}
            className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-4 max-h-[80vh] overflow-y-auto">
            {
              loading ? (
                <div className="text-gray-600">Loading...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-gray-600">No results found.</div>
              ) : (
                <>
                  <h3 className="font-bold text-lg text-gray-800">Retailers</h3>
                  {searchResults
                    .filter(result => result.type === 'retailer')
                    .map((result) => (
                      <div 
                        key={result.id} 
                        onClick={() => {
                          handleClose()
                          router.push(result.href)
                        }} 
                        className="cursor-pointer p-2 hover:bg-gray-50 rounded-md transition"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{result.title}</span>
                          <span className="text-xs text-gray-600">{result.subtitle}</span>
                        </div>
                      </div>
                    ))}
                  <h3 className="font-bold text-lg mt-4 text-gray-800">Invoices</h3>
                  {searchResults
                    .filter(result => result.type === 'invoice')
                    .map((result) => (
                      <div 
                        key={result.id} 
                        onClick={() => {
                          handleClose()
                          router.push(result.href)
                        }} 
                        className="cursor-pointer p-2 hover:bg-gray-50 rounded-md transition"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{result.title}</span>
                          <span className="text-xs text-gray-600">{result.subtitle}</span>
                        </div>
                      </div>
                    ))}
                </>
              )
            }
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="mt-4 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 