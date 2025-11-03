"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      <ChartStyle id={chartId} config={config} />
      <RechartsPrimitive.ResponsiveContainer>
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

import { LegendPayload } from "recharts/types/component/DefaultLegendContent";

interface ChartTooltipContentProps extends React.ComponentPropsWithoutRef<"div"> {
  active?: boolean;
  label?: string;
  payload?: Array<LegendPayload>;
  indicator?: "dot" | "line";
}

interface ChartLegendContentProps extends React.ComponentPropsWithoutRef<"div"> {
  payload?: Array<LegendPayload>;
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>((
  { active, payload, className, indicator, label, ...props },
  ref,
) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-md border border-border bg-white/95 p-2 text-xs shadow-md backdrop-blur-md dark:bg-zinc-950/95",
        className,
      )}
      {...props}
    >
      {label && (
        <div className="border-b border-border pb-1 text-muted-foreground">
          {label}
        </div>
      )}
      <div className="-mx-2 flex flex-col gap-1 pt-2">
        {payload.map((item, index) => {
          const itemDataKey = item.dataKey?.toString() || `id-${index}`;
          const indicatorColor = (item.color || (item.payload && 'fill' in item.payload && item.payload.fill) || item.color) as string;

          return (
            <div
              key={itemDataKey}
              className={cn(
                "flex items-center justify-between gap-4 px-2 py-1",
                item.inactive && "opacity-30",
              )}
            >
              <div className="flex items-center gap-2">
                {indicator === "dot" ? (
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: indicatorColor }}
                  />
                ) : indicator === "line" ? (
                  <div
                    className="h-px w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: indicatorColor }}
                  />
                ) : null}
                <span className="text-muted-foreground">
                  {item.value && item.formatter
                    ? item.formatter(item.value, item, index)
                    : item.value}
                </span>
              </div>
              <div className="font-medium text-foreground">
                {item.payload && item.payload.value !== undefined
                  ? item.payload.value
                  : item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(({ className, payload }, ref) => {
  if (!payload || !payload.length) return null;

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center gap-4", className)}>
      {payload.map((item, index) => {
        const active = item.inactive ? false : true;
        const itemDataKey = item.dataKey?.toString() || `id-${index}`;
        return (
          <div
            key={itemDataKey}
            className={cn(
              "flex items-center gap-1",
              !active && "opacity-30",
              item.color,
            )}
          >
            {item.legendIcon ? (
              item.legendIcon
            ) : (
              <div
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  item.color,
                  item.type === "line" && "h-px w-3 rounded-full",
                  item.type === "square" && "h-2 w-2 rounded-none",
                  item.type === "rect" && "h-2 w-2 rounded-none",
                  item.type === "circle" && "h-2 w-2 rounded-full",
                  item.type === "cross" && "h-2 w-2",
                  item.type === "diamond" && "h-2 w-2",
                  item.type === "star" && "h-2 w-2",
                  item.type === "triangle" && "h-2 w-2",
                  item.type === "wye" && "h-2 w-2",
                )}
                style={{
                  backgroundColor: (item.color || (item.payload && 'fill' in item.payload && item.payload.fill) || item.color) as string,
                }}
              />
            )}
            <span className="text-xs text-foreground">
              {item.formatter ? item.formatter(item.value, item, index) : item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
