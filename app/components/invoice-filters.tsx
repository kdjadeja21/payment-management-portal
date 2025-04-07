"use client"

import { useState } from "react"
import { Search, Calendar, Filter } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface InvoiceFiltersProps {
  onFilterChange: (filters: {
    retailerName: string
    dateRange: DateRange | undefined
    paymentStatus: string
    dueDaysOperator: string
    dueDaysValue: number
  }) => void
}

export function InvoiceFilters({ onFilterChange }: InvoiceFiltersProps) {
  const [retailerName, setRetailerName] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [paymentStatus, setPaymentStatus] = useState("all")
  const [dueDaysOperator, setDueDaysOperator] = useState("")
  const [dueDaysValue, setDueDaysValue] = useState<number>(0)

  const handleFilterChange = () => {
    onFilterChange({
      retailerName,
      dateRange,
      paymentStatus,
      dueDaysOperator,
      dueDaysValue,
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by retailer name..."
          value={retailerName}
          onChange={(e) => setRetailerName(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="due">Due</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={dueDaysOperator} onValueChange={setDueDaysOperator}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Due Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=">">Greater than</SelectItem>
              <SelectItem value="<">Less than</SelectItem>
              <SelectItem value="=">Equals</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Days"
            value={dueDaysValue || ""}
            onChange={(e) => setDueDaysValue(Number(e.target.value))}
            className="w-[100px]"
          />
        </div>

        <Button onClick={handleFilterChange}>Apply Filters</Button>
      </div>
    </div>
  )
}