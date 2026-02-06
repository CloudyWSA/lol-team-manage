"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import Image from "next/image"

interface AppShellProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  requireStaff?: boolean // If true, only coaches/analysts can access
}

export function AppShell({ children, title, subtitle, requireStaff = false }: AppShellProps) {
  const router = useRouter()
  const { user, isLoading, isStaff } = useAuth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)

  // Initialize from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed")
    if (savedState) {
      setIsSidebarCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Persist to localStorage
  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed)
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed))
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
    
    // Redirect players trying to access staff-only pages
    if (!isLoading && user && requireStaff && !isStaff) {
      router.push("/dashboard")
    }
  }, [user, isLoading, isStaff, requireStaff, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-24 w-24 flex items-center justify-center">
            <Image 
              src="/logo.png" 
              alt="Invokers Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Block access if page requires staff and user is not staff
  if (requireStaff && !isStaff) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={isSidebarCollapsed} setCollapsed={handleSidebarCollapse} />
      <div className={isSidebarCollapsed ? "pl-16 transition-all duration-300" : "pl-64 transition-all duration-300"}>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
