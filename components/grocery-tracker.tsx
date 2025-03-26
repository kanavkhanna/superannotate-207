"use client"

import { useState, useEffect, useRef } from "react"
import { GroceryForm } from "@/components/grocery-form"
import { GroceryList } from "@/components/grocery-list"
import { PriceComparison } from "@/components/price-comparison"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { AlertCircle, Undo2 } from "lucide-react"

export type GroceryItem = {
  id: string
  name: string
  store: string
  prices: {
    date: string
    price: number
  }[]
}

// Helper function to get a date string for a specific number of days ago
const getDateDaysAgo = (daysAgo: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split("T")[0]
}

// Helper function to get a date string for a specific number of months ago
const getDateMonthsAgo = (monthsAgo: number): string => {
  const date = new Date()
  date.setMonth(date.getMonth() - monthsAgo)
  return date.toISOString().split("T")[0]
}

// Sample data for initial state with varied dates spanning different time periods
const SAMPLE_GROCERY_ITEMS: GroceryItem[] = [
  // Milk items
  {
    id: "milk-walmart",
    name: "Milk",
    store: "Walmart",
    prices: [
      { date: getDateMonthsAgo(12), price: 3.19 }, // 1 year ago
      { date: getDateMonthsAgo(9), price: 3.29 }, // 9 months ago
      { date: getDateMonthsAgo(6), price: 3.39 }, // 6 months ago
      { date: getDateMonthsAgo(3), price: 3.49 }, // 3 months ago
      { date: getDateMonthsAgo(1), price: 3.39 }, // 1 month ago
      { date: getDateDaysAgo(7), price: 3.29 }, // 1 week ago
    ],
  },
  {
    id: "milk-target",
    name: "Milk",
    store: "Target",
    prices: [
      { date: getDateMonthsAgo(12), price: 3.39 }, // 1 year ago
      { date: getDateMonthsAgo(9), price: 3.49 }, // 9 months ago
      { date: getDateMonthsAgo(6), price: 3.59 }, // 6 months ago
      { date: getDateMonthsAgo(3), price: 3.69 }, // 3 months ago
      { date: getDateMonthsAgo(1), price: 3.59 }, // 1 month ago
      { date: getDateDaysAgo(10), price: 3.49 }, // 10 days ago
    ],
  },
  {
    id: "milk-kroger",
    name: "Milk",
    store: "Kroger",
    prices: [
      { date: getDateMonthsAgo(12), price: 3.09 }, // 1 year ago
      { date: getDateMonthsAgo(9), price: 3.19 }, // 9 months ago
      { date: getDateMonthsAgo(6), price: 3.29 }, // 6 months ago
      { date: getDateMonthsAgo(3), price: 3.39 }, // 3 months ago
      { date: getDateMonthsAgo(1), price: 3.29 }, // 1 month ago
      { date: getDateDaysAgo(14), price: 3.19 }, // 2 weeks ago
    ],
  },

  // Bread items
  {
    id: "bread-walmart",
    name: "Bread",
    store: "Walmart",
    prices: [
      { date: getDateMonthsAgo(12), price: 2.29 }, // 1 year ago
      { date: getDateMonthsAgo(9), price: 2.39 }, // 9 months ago
      { date: getDateMonthsAgo(6), price: 2.49 }, // 6 months ago
      { date: getDateMonthsAgo(3), price: 2.59 }, // 3 months ago
      { date: getDateMonthsAgo(1), price: 2.49 }, // 1 month ago
      { date: getDateDaysAgo(5), price: 2.39 }, // 5 days ago
    ],
  },
  {
    id: "bread-target",
    name: "Bread",
    store: "Target",
    prices: [
      { date: getDateMonthsAgo(12), price: 2.59 }, // 1 year ago
      { date: getDateMonthsAgo(9), price: 2.69 }, // 9 months ago
      { date: getDateMonthsAgo(6), price: 2.79 }, // 6 months ago
      { date: getDateMonthsAgo(3), price: 2.89 }, // 3 months ago
      { date: getDateMonthsAgo(1), price: 2.79 }, // 1 month ago
      { date: getDateDaysAgo(8), price: 2.69 }, // 8 days ago
    ],
  },
  {
    id: "bread-kroger",
    name: "Bread",
    store: "Kroger",
    prices: [
      { date: getDateMonthsAgo(12), price: 2.39 }, // 1 year ago
      { date: getDateMonthsAgo(9), price: 2.49 }, // 9 months ago
      { date: getDateMonthsAgo(6), price: 2.59 }, // 6 months ago
      { date: getDateMonthsAgo(3), price: 2.69 }, // 3 months ago
      { date: getDateMonthsAgo(1), price: 2.59 }, // 1 month ago
      { date: getDateDaysAgo(12), price: 2.49 }, // 12 days ago
    ],
  },

  // Eggs items
  {
    id: "eggs-walmart",
    name: "Eggs",
    store: "Walmart",
    prices: [
      { date: getDateMonthsAgo(12), price: 3.79 }, // 1 year ago
      { date: getDateMonthsAgo(9), price: 3.99 }, // 9 months ago
      { date: getDateMonthsAgo(6), price: 4.19 }, // 6 months ago
      { date: getDateMonthsAgo(3), price: 4.29 }, // 3 months ago
      { date: getDateMonthsAgo(1), price: 3.99 }, // 1 month ago
      { date: getDateDaysAgo(3), price: 3.79 }, // 3 days ago
    ],
  },
  {
    id: "eggs-target",
    name: "Eggs",
    store: "Target",
    prices: [
      { date: getDateMonthsAgo(12), price: 3.99 }, // 1 year ago
      { date: getDateMonthsAgo(9), price: 4.19 }, // 9 months ago
      { date: getDateMonthsAgo(6), price: 4.39 }, // 6 months ago
      { date: getDateMonthsAgo(3), price: 4.59 }, // 3 months ago
      { date: getDateMonthsAgo(1), price: 4.39 }, // 1 month ago
      { date: getDateDaysAgo(15), price: 4.19 }, // 15 days ago
    ],
  },
  {
    id: "eggs-kroger",
    name: "Eggs",
    store: "Kroger",
    prices: [
      { date: getDateMonthsAgo(12), price: 3.89 }, // 1 year ago
      { date: getDateMonthsAgo(9), price: 4.09 }, // 9 months ago
      { date: getDateMonthsAgo(6), price: 4.29 }, // 6 months ago
      { date: getDateMonthsAgo(3), price: 4.49 }, // 3 months ago
      { date: getDateMonthsAgo(1), price: 4.29 }, // 1 month ago
      { date: getDateDaysAgo(20), price: 4.09 }, // 20 days ago
    ],
  },
]

export function GroceryTracker() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("groceryItems")
        if (saved) {
          const parsedData = JSON.parse(saved)
          console.log("Loaded data from localStorage:", parsedData.length, "items")
          return parsedData
        }
      } catch (error) {
        console.error("Failed to load saved items:", error)
        toast.error("Failed to load saved items", {
          description: "There was an error loading your saved grocery items.",
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    }
    // Return sample data if no localStorage data
    return SAMPLE_GROCERY_ITEMS
  })

  const [activeTab, setActiveTab] = useState("list")
  const [isLoading, setIsLoading] = useState(false)
  const deletedItemRef = useRef<GroceryItem | null>(null)
  const previousPriceRef = useRef<{ itemId: string; prices: GroceryItem["prices"] } | null>(null)

  // Save to localStorage whenever groceryItems changes
  useEffect(() => {
    try {
      if (groceryItems.length > 0) {
        localStorage.setItem("groceryItems", JSON.stringify(groceryItems))
        console.log("Saved", groceryItems.length, "items to localStorage")
      }
    } catch (error) {
      console.error("Failed to save items:", error)
      toast.error("Failed to save items", {
        description: "There was an error saving your grocery items.",
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }, [groceryItems])

  // Add this after the other useEffect
  useEffect(() => {
    // Check if we have data in localStorage on initial load
    if (typeof window !== "undefined" && groceryItems.length === 0) {
      try {
        const saved = localStorage.getItem("groceryItems")
        if (saved) {
          const parsedData = JSON.parse(saved)
          if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
            console.log("Initializing from localStorage:", parsedData.length, "items")
            setGroceryItems(parsedData)
          } else {
            // If localStorage is empty or invalid, use sample data
            console.log("No data in localStorage, using sample data")
            setGroceryItems(SAMPLE_GROCERY_ITEMS)
          }
        } else {
          // If no localStorage entry exists, use sample data
          console.log("No localStorage entry, using sample data")
          setGroceryItems(SAMPLE_GROCERY_ITEMS)
        }
      } catch (error) {
        console.error("Error during initialization:", error)
        // Use sample data on error
        setGroceryItems(SAMPLE_GROCERY_ITEMS)
      }
    }
  }, [])

  const addGroceryItem = (item: Omit<GroceryItem, "id">) => {
    try {
      setIsLoading(true)
      const newItem = {
        ...item,
        id: crypto.randomUUID(),
      }
      setGroceryItems([...groceryItems, newItem])
      setActiveTab("list") // Switch to list tab after adding
      toast.success("Item added successfully", {
        description: `${item.name} has been added to your grocery list.`,
      })
    } catch (error) {
      toast.error("Failed to add item", {
        description: "There was an error adding your grocery item.",
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateItemPrice = (itemId: string, price: number) => {
    try {
      setIsLoading(true)
      const itemToUpdate = groceryItems.find((item) => item.id === itemId)

      if (!itemToUpdate) {
        throw new Error("Item not found")
      }

      // Store the previous prices for potential undo
      previousPriceRef.current = {
        itemId,
        prices: [...itemToUpdate.prices],
      }

      setGroceryItems(
        groceryItems.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              prices: [
                ...item.prices,
                {
                  date: new Date().toISOString().split("T")[0],
                  price,
                },
              ],
            }
          }
          return item
        }),
      )

      toast.success("Price updated", {
        description: `The price for ${itemToUpdate.name} has been updated to $${price.toFixed(2)}.`,
        action: {
          label: "Undo",
          onClick: () => undoUpdatePrice(),
        },
        icon: <Undo2 className="h-5 w-5" />,
      })
    } catch (error) {
      toast.error("Failed to update price", {
        description: "There was an error updating the price.",
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const undoUpdatePrice = () => {
    try {
      if (!previousPriceRef.current) {
        throw new Error("No price update to undo")
      }

      const { itemId, prices } = previousPriceRef.current

      // Find the item to restore prices for
      const itemToUpdate = groceryItems.find((item) => item.id === itemId)

      if (!itemToUpdate) {
        throw new Error("Item not found")
      }

      // Restore the previous prices
      setGroceryItems(
        groceryItems.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              prices: prices,
            }
          }
          return item
        }),
      )

      toast.success("Price update undone", {
        description: `The price update for ${itemToUpdate.name} has been reversed.`,
      })

      // Clear the reference
      previousPriceRef.current = null
    } catch (error) {
      toast.error("Failed to undo price update", {
        description: "There was an error restoring the previous price.",
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const deleteItem = (itemId: string) => {
    try {
      setIsLoading(true)
      const itemToDelete = groceryItems.find((item) => item.id === itemId)

      if (!itemToDelete) {
        throw new Error("Item not found")
      }

      // Store the deleted item for potential undo
      deletedItemRef.current = itemToDelete

      // Remove the item from the list
      setGroceryItems(groceryItems.filter((item) => item.id !== itemId))

      // Show toast with undo button
      toast.success("Item deleted", {
        description: `${itemToDelete.name} has been removed from your grocery list.`,
        action: {
          label: "Undo",
          onClick: () => undoDelete(),
        },
        icon: <Undo2 className="h-5 w-5" />,
      })
    } catch (error) {
      toast.error("Failed to delete item", {
        description: "There was an error deleting the item.",
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const undoDelete = () => {
    try {
      if (!deletedItemRef.current) {
        console.error("No item to restore - deletedItemRef is null")
        throw new Error("No item to restore")
      }

      console.log("Attempting to restore item:", deletedItemRef.current.name)

      // Add the deleted item back to the list
      setGroceryItems((prevItems) => {
        // Check if the item already exists to prevent duplicates
        const itemExists = prevItems.some((item) => item.id === deletedItemRef.current?.id)

        console.log("Item exists in current list?", itemExists)

        if (!itemExists) {
          console.log("Restoring item to list")
          return [...prevItems, deletedItemRef.current!]
        }

        console.log("Item already exists, not adding duplicate")
        return prevItems
      })

      // Force a switch to the list tab to show the restored item
      setActiveTab("list")

      toast.success("Item restored", {
        description: `${deletedItemRef.current.name} has been restored to your grocery list.`,
      })

      // Clear the deleted item reference
      deletedItemRef.current = null
    } catch (error) {
      console.error("Failed to restore item:", error)
      toast.error("Failed to restore item", {
        description: "There was an error restoring the deleted item.",
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid gap-6"
    >
      <Card className="overflow-hidden border-none shadow-lg">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b bg-muted/50">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="list"
                  className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Grocery List
                </TabsTrigger>
                <TabsTrigger
                  value="add"
                  className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Add Item
                </TabsTrigger>
                <TabsTrigger
                  value="compare"
                  className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Compare Prices
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="p-6">
              <TabsContent value="list" className="mt-0">
                <GroceryList
                  items={groceryItems}
                  onSelect={() => {}}
                  onUpdatePrice={updateItemPrice}
                  onDelete={deleteItem}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent value="add" className="mt-0">
                <GroceryForm onAddItem={addGroceryItem} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="compare" className="mt-0">
                <PriceComparison items={groceryItems} isLoading={isLoading} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}

