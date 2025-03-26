import { GroceryTracker } from "@/components/grocery-tracker"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">PriceTrack</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="mb-6 sm:mb-8 space-y-2 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Grocery Price Tracker</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Track, compare, and visualize grocery prices to make smarter shopping decisions
          </p>
        </div>
        <GroceryTracker />
      </main>
      <footer className="border-t bg-muted/40">
        <div className="container py-4 sm:py-6 px-4 sm:px-6 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PriceTrack. All data is stored locally in your browser.</p>
        </div>
      </footer>
    </div>
  )
}

