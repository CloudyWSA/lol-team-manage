"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from "react"
import { useQuery, useMutation, useAction } from "convex/react"
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
  register: (data: { name: string, email: string, password?: string, role: UserRole, teamName?: string, inviteCode?: string, position?: string }) => Promise<boolean>
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

  const loginAction = useAction(api.users.login);
  const registerAction = useAction(api.users.register);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsInitializing(true)
    try {
        const user = await loginAction({ email, password });
        if (user) {
            localStorage.setItem("invokers-user-email", email.toLowerCase())
            setStoredEmail(email.toLowerCase())
            setIsInitializing(false)
            return true
        }
        setIsInitializing(false)
        return false
    } catch (e) {
        console.error("Login failed", e);
        setIsInitializing(false)
        return false
    }
  }

  const register = async (data: { name: string, email: string, password?: string, role: UserRole, teamName?: string, inviteCode?: string, position?: string }): Promise<boolean> => {
    setIsInitializing(true)
    try {
      if (!data.password) throw new Error("Password required");
      
      await registerAction({
        ...data,
        email: data.email.toLowerCase(),
        password: data.password,
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
