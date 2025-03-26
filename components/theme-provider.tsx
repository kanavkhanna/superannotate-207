"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextProps {
  theme?: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextProps>({
  setTheme: () => null,
})

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = window.localStorage.getItem("theme") as Theme | null
      if (storedTheme) {
        return storedTheme
      } else {
        return defaultTheme
      }
    }
    return defaultTheme
  })

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const root = window.document.documentElement

    function updateTheme(theme: Theme) {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        root.setAttribute(attribute, systemTheme)
        return
      }
      root.setAttribute(attribute, theme)
    }

    updateTheme(theme)

    window.localStorage.setItem("theme", theme)
  }, [theme, attribute])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

function useTheme() {
  return React.useContext(ThemeContext)
}

export { ThemeProvider, useTheme }

