"use client"

import { useRouter } from "next/navigation"
import { useContext, useEffect, useState, ReactNode } from "react"
import { AuthContext } from "@/app/context/AuthProvider"
import { Loader } from "@/app/components/loader"

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const router = useRouter()

  const { auth, isLoading } = useContext(AuthContext)
  const [checking, setChecking] = useState<boolean>(true)

  useEffect(() => {
    if (!isLoading) {
      if (!auth.token) {
        router.replace("/login")
      } else {
        setChecking(false)
      }
    }
  }, [auth.token, isLoading])

  if (isLoading || checking) return <Loader />

  return <>{children}</>
}
