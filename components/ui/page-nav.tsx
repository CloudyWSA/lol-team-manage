"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PageNavTab {
  id: string
  label: string
  icon: LucideIcon
}

interface PageNavProps {
  tabs: PageNavTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function PageNav({ tabs, activeTab, onTabChange, className }: PageNavProps) {
  return (
    <nav className={cn("w-full", className)} role="tablist" aria-label="Page navigation">
      {/* Mobile: Horizontal scroll / Desktop: Grid */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:grid md:gap-3 md:overflow-visible md:pb-0"
           style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "group relative flex min-w-[110px] flex-col items-center gap-2 rounded-xl px-4 py-4",
                "transition-all duration-200 ease-out cursor-pointer",
                "md:min-w-0 md:flex-row md:justify-center md:gap-3 md:px-5 md:py-4",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              type="button"
              aria-selected={isActive}
              role="tab"
              tabIndex={isActive ? 0 : -1}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-105"
                )}
              />
              <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary-foreground/50 md:hidden" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
