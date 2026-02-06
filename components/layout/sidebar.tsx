"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Swords,
  Trophy,
  Search,
  BarChart3,
  Heart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Settings,
  UserPlus,
  ClipboardList,
  CalendarDays,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    staffOnly: false,
  },
  {
    name: "Minha Saude",
    href: "/my-health",
    icon: Heart,
    staffOnly: false,
    playerOnly: true, // Only visible to players
  },
  {
    name: "Saude da Equipe",
    href: "/health",
    icon: Heart,
    staffOnly: true, // Only visible to coaches/analysts
  },
  {
    name: "Scrims",
    href: "/scrims",
    icon: Swords,
    staffOnly: false,
  },
  {
    name: "Partidas Oficiais",
    href: "/matches",
    icon: Trophy,
    staffOnly: false,
  },
  {
    name: "Tarefas",
    href: "/staff/tasks",
    icon: ClipboardList,
    staffOnly: true,
  },
  {
    name: "Agenda",
    href: "/staff/agenda",
    icon: CalendarDays,
    staffOnly: true,
  },
  {
    name: "Scouting",
    href: "/scouting",
    icon: Search,
    staffOnly: true,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    staffOnly: false,
  },
]

const bottomNavigation = [
  {
    name: "Equipe",
    href: "/team",
    icon: Users,
    staffOnly: false,
  },
  {
    name: "Convidar",
    href: "/team/invite",
    icon: UserPlus,
    staffOnly: true, // Only coaches can invite
  },
  {
    name: "Configuracoes",
    href: "/settings",
    icon: Settings,
    staffOnly: false,
  },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isStaff, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const isPlayer = user?.role === "player"

  // Filter navigation based on user role
  // - staffOnly items only visible to staff
  // - playerOnly items only visible to players
  const visibleNavigation = navigation.filter(item => {
    if (item.staffOnly && !isStaff) return false
    if ((item as { playerOnly?: boolean }).playerOnly && !isPlayer) return false
    return true
  })
  const visibleBottomNavigation = bottomNavigation.filter(item => !item.staffOnly || isStaff)

  const getRoleBadge = () => {
    if (!user) return null
    switch (user.role) {
      case "coach":
        return <Badge className="bg-primary/20 text-primary text-[10px]">Coach</Badge>
      case "analyst":
        return <Badge className="bg-accent/20 text-accent text-[10px]">Analista</Badge>
      case "player":
        return <Badge variant="outline" className="text-[10px]">{user.position || "Player"}</Badge>
    }
  }


  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3">
              <img src="/logo.png" alt="Invokers Logo" className="h-9 w-auto" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">
                  Invokers
                </span>
                <span className="text-xs text-muted-foreground">
                  Team Platform
                </span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto">
              <img src="/logo.png" alt="Invokers" className="h-8 w-8 object-contain" />
            </Link>
          )}
        </div>

        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-border bg-card"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-2">
            {!collapsed && (
              <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Principal
              </span>
            )}
          </div>
          <ul className="space-y-1">
            {visibleNavigation.map((item) => (
              <SidebarNavItem 
                key={item.name}
                item={item}
                collapsed={collapsed}
                pathname={pathname}
              />
            ))}
          </ul>

          {/* Bottom navigation */}
          <div className="mt-6">
            {!collapsed && (
              <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sistema
              </span>
            )}
            <ul className="mt-2 space-y-1">
              {visibleBottomNavigation.map((item) => (
                <SidebarNavItem 
                  key={item.name}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                />
              ))}
            </ul>
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2",
              collapsed ? "justify-center" : ""
            )}
          >
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                <span className="text-sm font-medium">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-green-500" />
            </div>
            {!collapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {user?.name || "Usuario"}
                </span>
                <div className="mt-0.5">
                  {getRoleBadge()}
                </div>
              </div>
            )}
            {!collapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sair</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}

function SidebarNavItem({ 
  item, 
  collapsed, 
  pathname 
}: { 
  item: any, 
  collapsed: boolean, 
  pathname: string 
}) {
  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
  
  const NavItem = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all w-full",
        collapsed && "justify-center px-2",
        isActive
          ? "bg-sidebar-accent text-sidebar-primary border border-primary/10 shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <item.icon
        className={cn(
          "h-5 w-5 shrink-0",
          isActive ? "text-sidebar-primary" : "text-muted-foreground"
        )}
      />
      {!collapsed && (
        <span className="flex items-center gap-2">
          {item.name}
          {item.staffOnly && (
            <span className="text-[10px] text-muted-foreground">(Staff)</span>
          )}
        </span>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger asChild>
            {NavItem}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground border border-border shadow-md">
            {item.name}
            {item.staffOnly && <span className="text-muted-foreground ml-1">(Staff)</span>}
          </TooltipContent>
        </Tooltip>
      </li>
    )
  }

  return <li>{NavItem}</li>
}
