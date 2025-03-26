"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Search, AlertCircle, Loader2, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { GroceryItem } from "@/components/grocery-tracker"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface GroceryListProps {
  items: GroceryItem[]
  onSelect: (item: GroceryItem) => void
  onUpdatePrice: (itemId: string, price: number) => void
  onDelete: (itemId: string) => void
  isLoading: boolean
}

// Form schema for price update
const priceFormSchema = z.object({
  price: z.coerce
    .number({
      invalid_type_error: "Price must be a valid number.",
    })
    .positive({
      message: "Price must be a positive number.",
    }),
})

type PriceFormValues = z.infer<typeof priceFormSchema>

export function GroceryList({ items, onSelect, onUpdatePrice, onDelete, isLoading }: GroceryListProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null)
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  // Initialize form with zod resolver
  const form = useForm<PriceFormValues>({
    resolver: zodResolver(priceFormSchema),
    defaultValues: {
      price: 0,
    },
    mode: "onChange", // Validate on change for immediate feedback
  })

  const handleUpdatePrice = (values: PriceFormValues) => {
    try {
      if (!selectedItemId) {
        throw new Error("No item selected")
      }

      onUpdatePrice(selectedItemId, values.price)
      setSelectedItemId(null)
      setIsEditDialogOpen(false)
      setEditingItem(null)
      form.reset()
    } catch (error) {
      toast.error("Failed to update price", {
        description: "There was an error updating the price.",
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const openEditDialog = (item: GroceryItem, e: React.MouseEvent) => {
    e.stopPropagation()

    // Get the latest price
    const latestPrice =
      item.prices.length > 0
        ? item.prices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].price
        : 0

    // Set the state
    setSelectedItemId(item.id)
    setEditingItem(item)
    setIsEditDialogOpen(true)

    // Reset form with the latest price
    form.reset({
      price: latestPrice,
    })
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId)
      setDeleteConfirmId(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const getLatestPrice = (prices: GroceryItem["prices"]) => {
    if (prices.length === 0) return "N/A"
    const sortedPrices = [...prices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return `$${sortedPrices[0].price.toFixed(2)}`
  }

  const getLatestDate = (prices: GroceryItem["prices"]) => {
    if (prices.length === 0) return "N/A"
    const sortedPrices = [...prices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latestDate = new Date(sortedPrices[0].date)

    // Format as MM/DD/YYYY
    return latestDate.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })
  }

  const getPriceChange = (prices: GroceryItem["prices"]) => {
    if (prices.length < 2) return null

    const sortedPrices = [...prices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const latest = sortedPrices[0].price
    const previous = sortedPrices[1].price
    const change = latest - previous
    const percentChange = (change / previous) * 100

    return {
      value: change,
      percent: percentChange,
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.store.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">Your Grocery Items</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          Track and manage your grocery items and their prices.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search items or stores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={isLoading}
          aria-label="Search items or stores"
        />
      </div>

      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20"
          >
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-medium">Loading grocery items...</p>
          </motion.div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20"
          >
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No grocery items found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {items.length === 0
                ? 'Add items using the "Add Item" tab to start tracking prices.'
                : "Try adjusting your search term."}
            </p>
          </motion.div>
        ) : (
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Item</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Latest Price</TableHead>
                    <TableHead className="hidden md:table-cell">Change</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const priceChange = getPriceChange(item.prices)

                    return (
                      <TableRow key={item.id} className="transition-colors">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.store}</TableCell>
                        <TableCell className="font-semibold">{getLatestPrice(item.prices)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {priceChange ? (
                            <Badge variant={priceChange.value < 0 ? "success" : "destructive"} className="font-mono">
                              {priceChange.value < 0 ? "↓" : "↑"}${Math.abs(priceChange.value).toFixed(2)}(
                              {Math.abs(priceChange.percent).toFixed(1)}%)
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {getLatestDate(item.prices)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isLoading}
                              aria-label={`Edit price for ${item.name}`}
                              onClick={(e) => openEditDialog(item, e)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit price for {item.name}</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isLoading}
                              aria-label={`Delete ${item.name}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirmId(item.id)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete {item.name}</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card view for small screens */}
            <div className="sm:hidden">
              {filteredItems.map((item) => {
                const latestPrice = getLatestPrice(item.prices)
                const priceChange = getPriceChange(item.prices)

                return (
                  <div key={`mobile-${item.id}`} className="p-4 border-b last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-semibold">{latestPrice}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                      <span>{item.store}</span>
                      <span>Updated: {getLatestDate(item.prices)}</span>
                    </div>
                    {priceChange && (
                      <div className="mb-3">
                        <Badge
                          variant={priceChange.value < 0 ? "success" : "destructive"}
                          className="font-mono text-xs"
                        >
                          {priceChange.value < 0 ? "↓" : "↑"}${Math.abs(priceChange.value).toFixed(2)} (
                          {Math.abs(priceChange.percent).toFixed(1)}%)
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={(e) => openEditDialog(item, e)}
                        className="h-8"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirmId(item.id)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="h-8"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Price Dialog with Form Validation */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setSelectedItemId(null)
            setEditingItem(null)
            form.reset()
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-w-[95vw] rounded-lg">
          <DialogHeader>
            <DialogTitle>Update Price for {editingItem?.name}</DialogTitle>
            <DialogDescription>Enter the current price you've seen at {editingItem?.store}.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdatePrice)} className="space-y-4 py-4" noValidate>
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Price ($)</FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          // Removed min="0" to prevent browser tooltip
                          className="pl-8"
                          placeholder="0.00"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-destructive text-sm mt-1" />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="sm:w-auto w-full"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="sm:w-auto w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Price"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) setDeleteConfirmId(null)
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete this item? This action can be undone.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>This will remove this item and all its price history from your list.</AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="sm:w-auto w-full">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="sm:w-auto w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

function ShoppingBag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

