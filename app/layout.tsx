import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Grocery Price Tracker",
  description: "Track, compare, and visualize grocery prices to make smarter shopping decisions",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" closeButton richColors />
      </body>
    </html>
  )
}



import './globals.css'