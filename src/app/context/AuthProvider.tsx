"use client"

import React, { createContext, useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"
import {
  AuthState,
  AuthContextType,
  JwtPayload,
} from "@/app/context/Context.interface"

export const defaultAuthState: AuthState = {
  username: "",
  token: "",
  userId: "",
}

export const AuthContext = createContext<AuthContextType>({
  auth: defaultAuthState,
  setAuth: () => {},
  isLoading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(defaultAuthState)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const refresh = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/refresh`,
          {
            credentials: "include",
          },
        )

        if (response.status === 204) {
          setIsLoading(false)
          return
        }

        const data = await response.json()
        const { username, userId } = jwtDecode<JwtPayload>(data.accessToken)

        setAuth({ token: data.accessToken, username, userId })
      } catch (err) {
        console.error("Failed to refresh token", err)
      } finally {
        setIsLoading(false)
      }
    }
    refresh()
  }, [])

  return (
    <AuthContext.Provider value={{ auth, setAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
