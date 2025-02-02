import React from "react"

export interface AuthState {
  token: string
  username: string
  userId: string
}

export interface AuthContextType {
  auth: AuthState
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>
  isLoading: boolean
}

export interface JwtPayload {
  username: string
  userId: string
}
