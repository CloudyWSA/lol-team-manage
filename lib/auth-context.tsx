"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc, Id } from "@/convex/_generated/dataModel"

export type UserRole = "coach" | "player" | "analyst"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  position?: string
  teamId: string
}

export interface Team {
  id: string
  name: string
  logo?: string
}

interface AuthContextType {
  user: User | null
  team: Team | null
  isLoading: boolean
  isStaff: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: { name: string, email: string, role: UserRole, teamName?: string, inviteCode?: string, position?: string }) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [storedEmail, setStoredEmail] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const email = localStorage.getItem("invokers-user-email")
    if (email) setStoredEmail(email)
    setIsInitializing(false)
  }, [])

  const convexUser = useQuery(api.users.getMe, storedEmail ? { email: storedEmail } : "skip")
  const registerMutation = useMutation(api.users.register)

  const user = useMemo(() => {
    if (!convexUser) return null
    return {
      id: convexUser._id,
      name: convexUser.name,
      email: convexUser.email,
      role: convexUser.role,
      avatar: convexUser.avatar,
      position: convexUser.position,
      teamId: convexUser.teamId,
    } as User
  }, [convexUser])

  // Fetch team details if user exists
  const team = useMemo(() => {
    if (!user) return null
    return {
      id: user.teamId,
      name: "Your Team", // Simplified for now
    }
  }, [user])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsInitializing(true)
    const normalizedEmail = email.toLowerCase()
    localStorage.setItem("invokers-user-email", normalizedEmail)
    setStoredEmail(normalizedEmail)
    setIsInitializing(false)
    return true
  }

  const register = async (data: { name: string, email: string, role: UserRole, teamName?: string, inviteCode?: string, position?: string }): Promise<boolean> => {
    setIsInitializing(true)
    try {
      await registerMutation({
        ...data,
        email: data.email.toLowerCase(),
      })
      localStorage.setItem("invokers-user-email", data.email.toLowerCase())
      setStoredEmail(data.email.toLowerCase())
      setIsInitializing(false)
      return true
    } catch (error) {
      console.error("Registration error:", error)
      setIsInitializing(false)
      return false
    }
  }

  const logout = () => {
    setStoredEmail(null)
    localStorage.removeItem("invokers-user-email")
  }

  const isStaff = user?.role === "coach" || user?.role === "analyst"
  const isLoading = isInitializing || (storedEmail !== null && convexUser === undefined)

  return (
    <AuthContext.Provider
      value={{
        user,
        team,
        isLoading,
        isStaff,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
