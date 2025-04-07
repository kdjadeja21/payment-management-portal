"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { DialogTitle } from "@/components/ui/dialog"
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
  const router = useRouter()

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

  const handleSearch = async (search: string) => {
    if (!search) {
      setSearchResults([])
      return
    }

    const [invoices, retailers] = await Promise.all([
      getInvoices(),
      getRetailers()
    ])

    const results: SearchResult[] = []

    // Search in retailers
    retailers.forEach(retailer => {
      if (retailer.name.toLowerCase().includes(search.toLowerCase())) {
        results.push({
          id: retailer.id,
          type: 'retailer',
          title: retailer.name,
          subtitle: `Retailer`,
          href: `/retailers/${retailer.id}`
        })
      }
    })

    // Search in invoices
    invoices.forEach(invoice => {
      if (
        invoice.retailerName.toLowerCase().includes(search.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase())
      ) {
        results.push({
          id: invoice.id,
          type: 'invoice',
          title: `${invoice.retailerName} - ${invoice.invoiceNumber}`,
          subtitle: `${formatCurrency(invoice.amount)} • ${formatDate(invoice.invoiceDate)}`,
          href: `/invoices/${invoice.id}`
        })
      }
    })

    setSearchResults(results)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search retailers and invoices...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search</DialogTitle>
        <CommandInput 
          placeholder="Search retailers and invoices..." 
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Retailers">
            {searchResults
              .filter(result => result.type === 'retailer')
              .map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    setOpen(false)
                    router.push(result.href)
                  }}
                >
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandGroup heading="Invoices">
            {searchResults
              .filter(result => result.type === 'invoice')
              .map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    setOpen(false)
                    router.push(result.href)
                  }}
                >
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
} 