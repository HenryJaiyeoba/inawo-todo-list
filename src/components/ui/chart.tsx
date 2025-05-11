"use client";

import * as React from "react";

const Chart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div className="relative" ref={ref} {...props} />;
});
Chart.displayName = "Chart";

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div className="relative" ref={ref} {...props} />;
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className="rounded-md border bg-popover p-4 text-sm text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0"
      ref={ref}
      {...props}
    />
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartTooltipItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label: string;
    value: string;
    color: string;
  }
>(({ className, label, value, color, ...props }, ref) => {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-x-2" ref={ref} {...props}>
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium">
        {value}
        <div
          className="ml-2 inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>
    </div>
  );
});
ChartTooltipItem.displayName = "ChartTooltipItem";

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div className="relative" ref={ref} {...props} />;
});
ChartTooltip.displayName = "ChartTooltip";

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div className="relative" ref={ref} {...props} />;
});
ChartLegend.displayName = "ChartLegend";

export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipItem,
  ChartLegend,
};
