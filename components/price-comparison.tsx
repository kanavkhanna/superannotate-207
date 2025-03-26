"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Calendar, TrendingDown, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { GroceryItem } from "@/components/grocery-tracker"

interface PriceComparisonProps {
  items: GroceryItem[]
  isLoading: boolean
}

export function PriceComparison({ items, isLoading }: PriceComparisonProps) {
  const [timeframe, setTimeframe] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [uniqueItemNames, setUniqueItemNames] = useState<string[]>([])
  const [uniqueStores, setUniqueStores] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(2022, 0, 1), // Jan 1, 2022
    end: new Date(),
  })

  // Update unique items and stores whenever items change
  useEffect(() => {
    try {
      // Get unique item names
      const itemNames = Array.from(new Set(items.map((item) => item.name)))
      setUniqueItemNames(itemNames)

      // Get unique store names
      const storeNames = Array.from(new Set(items.map((item) => item.store)))
      setUniqueStores(storeNames)

      // Update date range based on timeframe
      updateDateRange(timeframe)
    } catch (error) {
      console.error("Error updating unique items and stores:", error)
      setError("Failed to process item data")
    }
  }, [items, timeframe])

  // Calculate date range based on timeframe
  const updateDateRange = (selectedTimeframe: string) => {
    try {
      let start: Date
      const end = new Date()

      // Find the earliest and latest dates in our data
      let earliestDate = new Date()
      let latestDate = new Date(2000, 0, 1) // Start with an old date

      items.forEach((item) => {
        item.prices.forEach((price) => {
          const priceDate = new Date(price.date)
          if (priceDate < earliestDate) earliestDate = priceDate
          if (priceDate > latestDate) latestDate = priceDate
        })
      })

      // Ensure we have a valid latest date
      if (latestDate > new Date(2000, 0, 1)) {
        end.setTime(latestDate.getTime())
      }

      switch (selectedTimeframe) {
        case "week":
          start = new Date(end)
          start.setDate(end.getDate() - 7)
          break
        case "month":
          start = new Date(end)
          start.setMonth(end.getMonth() - 1)
          break
        case "3months":
          start = new Date(end)
          start.setMonth(end.getMonth() - 3)
          break
        case "all":
        default:
          // Use the earliest date from our data, or default to 1 year ago
          start = earliestDate
          // Use the earliest date from our data, or default to 1 year ago
          start = earliestDate < new Date(2022, 0, 1) ? earliestDate : new Date(end)
          start.setFullYear(end.getFullYear() - 1)
          break
      }

      console.log(`Date range updated: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`)
      setDateRange({ start, end })
    } catch (error) {
      console.error("Date range calculation error:", error)
      setError("Failed to calculate date range")

      // Return fallback values
      const today = new Date()
      const yearAgo = new Date(today)
      yearAgo.setFullYear(today.getFullYear() - 1)

      setDateRange({
        start: yearAgo,
        end: today,
      })
    }
  }

  // Get the latest price for an item at a specific store within the date range
  const getLatestPrice = (itemName: string, storeName: string) => {
    try {
      const { start, end } = dateRange

      const matchingItems = items.filter((item) => item.name === itemName && item.store === storeName)

      if (matchingItems.length === 0) return null

      // Get all prices within the date range
      const pricesInRange = matchingItems.flatMap((item) =>
        item.prices.filter((price) => {
          const priceDate = new Date(price.date)
          return priceDate >= start && priceDate <= end
        }),
      )

      if (pricesInRange.length === 0) return null

      // Sort by date (newest first) and get the latest price
      const sortedPrices = pricesInRange.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return sortedPrices[0].price
    } catch (error) {
      console.error("Error retrieving price data:", error)
      setError("Failed to retrieve price data")
      return null
    }
  }

  // Find the best price for each item
  const getBestPrice = (itemName: string) => {
    try {
      let lowestPrice = Number.POSITIVE_INFINITY
      let bestStore = ""

      uniqueStores.forEach((store) => {
        const price = getLatestPrice(itemName, store)
        if (price !== null && price < lowestPrice) {
          lowestPrice = price
          bestStore = store
        }
      })

      return lowestPrice !== Number.POSITIVE_INFINITY ? { price: lowestPrice, store: bestStore } : null
    } catch (error) {
      console.error("Error calculating best price:", error)
      setError("Failed to calculate best price")
      return null
    }
  }

  // Calculate total potential savings
  const calculateTotalSavings = () => {
    try {
      let totalSavings = 0

      uniqueItemNames.forEach((itemName) => {
        const prices = uniqueStores
          .map((store) => getLatestPrice(itemName, store))
          .filter((price) => price !== null) as number[]

        if (prices.length >= 2) {
          const maxPrice = Math.max(...prices)
          const minPrice = Math.min(...prices)
          totalSavings += maxPrice - minPrice
        }
      })

      return totalSavings
    } catch (error) {
      console.error("Error calculating total savings:", error)
      setError("Failed to calculate total savings")
      return 0
    }
  }

  const totalSavings = calculateTotalSavings()
  const dateRangeText = `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">Price Comparison</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          Compare prices across different stores to find the best deals.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{dateRangeText}</span>
        </div>
        <Select
          value={timeframe}
          onValueChange={(value) => {
            setTimeframe(value)
            updateDateRange(value)
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last month</SelectItem>
            <SelectItem value="3months">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Loading price comparison data...</p>
        </div>
      ) : uniqueItemNames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <TrendingDown className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No items to compare</p>
          <p className="text-sm text-muted-foreground mt-1">Add items from different stores to compare prices.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {totalSavings > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <span>Potential Savings</span>
                  <span className="text-primary">${totalSavings.toFixed(2)}</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Total amount you could save by purchasing each item at the lowest price
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Price Comparison Table</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Compare prices across different stores to find the best deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead>Item</TableHead>
                      {uniqueStores.map((store) => (
                        <TableHead key={store}>{store}</TableHead>
                      ))}
                      <TableHead>Best Deal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uniqueItemNames.map((itemName) => (
                      <TableRow key={itemName}>
                        <TableCell className="font-medium">{itemName}</TableCell>
                        {uniqueStores.map((store) => {
                          const price = getLatestPrice(itemName, store)
                          const bestPrice = getBestPrice(itemName)
                          const isBestPrice = bestPrice && price === bestPrice.price && store === bestPrice.store

                          return (
                            <TableCell key={store} className={isBestPrice ? "font-bold" : ""}>
                              {price !== null ? (
                                <span className={isBestPrice ? "text-primary" : ""}>
                                  ${price.toFixed(2)}
                                  {isBestPrice && <span className="ml-1">✓</span>}
                                </span>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          )
                        })}
                        <TableCell>
                          {(() => {
                            const bestPrice = getBestPrice(itemName)
                            return bestPrice ? (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                ${bestPrice.price.toFixed(2)} at {bestPrice.store}
                              </Badge>
                            ) : (
                              "No data"
                            )
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view for store prices */}
              <div className="sm:hidden mt-4 space-y-4">
                {uniqueItemNames.map((itemName) => (
                  <div key={`mobile-${itemName}`} className="border rounded-md p-3">
                    <div className="font-medium mb-2">{itemName}</div>
                    {uniqueStores.map((store) => {
                      const price = getLatestPrice(itemName, store)
                      const bestPrice = getBestPrice(itemName)
                      const isBestPrice = bestPrice && price === bestPrice.price && store === bestPrice.store

                      return price !== null ? (
                        <div key={`mobile-${itemName}-${store}`} className="flex justify-between text-sm py-1">
                          <span>{store}:</span>
                          <span className={isBestPrice ? "text-primary font-semibold" : ""}>
                            ${price.toFixed(2)} {isBestPrice && "✓"}
                          </span>
                        </div>
                      ) : null
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Savings Summary</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Potential savings for each item when buying at the lowest price
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uniqueItemNames.map((itemName) => {
                  const prices = uniqueStores
                    .map((store) => getLatestPrice(itemName, store))
                    .filter((price) => price !== null) as number[]

                  if (prices.length < 2) return null

                  const maxPrice = Math.max(...prices)
                  const minPrice = Math.min(...prices)
                  const savings = maxPrice - minPrice
                  const savingsPercent = (savings / maxPrice) * 100

                  return (
                    <div
                      key={itemName}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 rounded-md bg-muted/30"
                    >
                      <span className="font-medium text-sm">{itemName}</span>
                      <span className="text-primary font-semibold text-xs sm:text-sm flex items-center gap-1">
                        <TrendingDown className="h-4 w-4" />
                        Save ${savings.toFixed(2)} ({savingsPercent.toFixed(0)}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  )
}

