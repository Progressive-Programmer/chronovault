"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type CaptionProps, useDayPicker, useNavigation } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "./scroll-area"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden", // Hide the default caption label
        nav_button_previous: "hidden", // Hide the default nav buttons
        nav_button_next: "hidden",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: ({ displayMonth }: CaptionProps) => {
          const { fromDate, toDate } = useDayPicker()
          const { goToMonth, nextMonth, previousMonth } = useNavigation()
          
          const fromYear = fromDate?.getFullYear()
          const toYear = toDate?.getFullYear()

          const yearOptions: number[] = []
          if (fromYear && toYear) {
            for (let i = fromYear; i <= toYear; i++) {
              yearOptions.push(i)
            }
          }

          const monthOptions: {label: string, value: number}[] = Array.from({ length: 12 }, (_, i) => ({
            value: i,
            label: new Date(2000, i).toLocaleString("default", { month: "long" }),
          }))

          return (
             <div className="flex items-center justify-between gap-1 w-full">
                <Button
                    aria-label="Go to previous month"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => previousMonth && goToMonth(previousMonth)}
                    disabled={!previousMonth}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1.5 flex-grow justify-center">
                    <Select
                        value={String(displayMonth.getMonth())}
                        onValueChange={(value) => {
                            goToMonth(new Date(displayMonth.getFullYear(), Number(value)))
                        }}
                    >
                        <SelectTrigger className="w-[60%] focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                             {monthOptions.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select
                        value={String(displayMonth.getFullYear())}
                        onValueChange={(value) => {
                            goToMonth(new Date(Number(value), displayMonth.getMonth()))
                        }}
                    >
                        <SelectTrigger className="w-[40%] focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <ScrollArea className="h-80">
                                {yearOptions.map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </ScrollArea>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                     aria-label="Go to next month"
                     variant="outline"
                     className="h-7 w-7 p-0"
                     onClick={() => nextMonth && goToMonth(nextMonth)}
                     disabled={!nextMonth}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
          )
        },
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" {...props} />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" {...props} />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
