"use client"
import "./page.scss"
import { useContext } from "react"
import { AuthContext } from "@/app/context/AuthProvider"
import Link from "next/link"
import { RequireAuth } from "@/app/(auth)/RequireAuth"
import { useRouter } from "next/navigation"
import { defaultAuthState } from "@/app/context/AuthProvider"

export default function Home() {
  const { auth, setAuth } = useContext(AuthContext)
  const router = useRouter()
  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/logout`, {
        credentials: "include",
      })
      setAuth(defaultAuthState)
      router.replace("/login")
    } catch (e) {
      console.error(e)
    }
  }
  return (
    <RequireAuth>
      <div>
        ChatApp
        <p>Username: {auth.username}</p>
        <p>Token: {auth.token}</p>
        <p>Id: {auth.userId}</p>
        <Link href="/login">login</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </RequireAuth>
  )
}
