"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { motion } from "framer-motion"
import { ShoppingBag, Store, DollarSign, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { GroceryItem } from "@/components/grocery-tracker"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Item name must be at least 2 characters.",
  }),
  store: z.string().min(2, {
    message: "Store name must be at least 2 characters.",
  }),
  price: z.coerce
    .number({
      invalid_type_error: "Price must be a valid number.",
    })
    .positive({
      message: "Price must be a positive number.",
    }),
})

type FormValues = z.infer<typeof formSchema>

interface GroceryFormProps {
  onAddItem: (item: Omit<GroceryItem, "id">) => void
  isLoading: boolean
}

export function GroceryForm({ onAddItem, isLoading }: GroceryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      store: "",
      price: 0,
    },
  })

  const onSubmit = (values: FormValues) => {
    try {
      onAddItem({
        name: values.name,
        store: values.store,
        prices: [
          {
            date: new Date().toISOString().split("T")[0],
            price: values.price,
          },
        ],
      })
      form.reset()
    } catch (error) {
      toast.error("Form submission failed", {
        description: "There was an error adding your grocery item. Please try again.",
      })
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Add New Grocery Item</h2>
        <p className="text-muted-foreground">Track prices for a new grocery item by filling out the form below.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4 p-6 rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium">Why Track Prices?</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs text-primary font-medium">1</span>
              </div>
              <p className="text-sm">Identify price trends over time to make better purchasing decisions</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs text-primary font-medium">2</span>
              </div>
              <p className="text-sm">Compare prices across different stores to find the best deals</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs text-primary font-medium">3</span>
              </div>
              <p className="text-sm">Calculate potential savings and optimize your grocery budget</p>
            </li>
          </ul>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Item Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Milk, Bread, Eggs"
                      {...field}
                      className="transition-all focus-visible:ring-2 focus-visible:ring-primary"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="store"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Store
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Walmart, Target, Kroger"
                      {...field}
                      className="transition-all focus-visible:ring-2 focus-visible:ring-primary"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Current Price ($)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      className="transition-all focus-visible:ring-2 focus-visible:ring-primary"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full transition-all hover:shadow-md" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </motion.div>
  )
}

