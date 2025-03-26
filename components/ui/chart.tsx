import type * as React from "react"

const Chart = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="chart w-full h-full" {...props}>
      {children}
    </div>
  )
}

const ChartContainer = ({
  children,
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="chart-container w-full" {...props}>
      {children}
    </div>
  )
}

const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <div className="chart-tooltip bg-background border rounded-md shadow-md p-2">{children}</div>
}

const ChartTooltipContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="chart-tooltip-content text-sm">{children}</div>
}

const ChartLegend = ({ children }: { children: React.ReactNode }) => {
  return <div className="chart-legend flex flex-wrap gap-4 justify-center mt-4">{children}</div>
}

const ChartLegendItem = ({ name, color }: { name: string; color: string }) => {
  return (
    <div className="chart-legend-item flex items-center gap-2">
      <span className="chart-legend-item-color w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
      <span className="chart-legend-item-name text-sm">{name}</span>
    </div>
  )
}

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendItem }

