"use client"

import Link from "next/link"
import React, { useContext, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/app/context/AuthProvider"
import { jwtDecode } from "jwt-decode"
import "./login.scss"

export default function Login() {
  const router = useRouter()
  const { setAuth } = useContext(AuthContext)

  const [showVerificationCode, setShowVerificationCode] =
    useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string>("")
  const [forgotPassword, setForgotPassword] = useState<boolean>(false)

  const [username, setUsername] = useState<string>("")
  const usernameRef = useRef<HTMLInputElement>(null)

  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [verificationCode, setVerificationCode] = useState<string>("")

  useEffect(() => {
    const timeout = setTimeout(() => usernameRef.current!.focus(), 100)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    setErrMsg("")
  }, [username, password])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!username && !password) {
      setErrMsg("Invalid data")
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, password, verificationCode }),
        },
      )

      if (response.status === 206) {
        setShowVerificationCode(true)
        return
      }

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setErrMsg("Too many requests, try later")
        } else if (response.status === 401) {
          setErrMsg("Username or password incorrect")
          setForgotPassword(true)
        } else if (response.status === 400) {
          setErrMsg(data?.message?.message)
        } else {
          setErrMsg("Login Failed")
        }
      } else {
        //@ts-ignore
        const { username, userId } = jwtDecode(data.accessToken)
        setAuth({ token: data.accessToken, username, userId })
        router.push("/")
      }
    } catch (e) {
      setErrMsg("An error occurred during the request")
    }
  }

  return (
    <>
      {showVerificationCode ? (
        <section className="Login">
          <div className="Login__body">
            <h1>Verification code</h1>
            <p>We send verification code on your email.</p>
            <form onSubmit={handleSubmit}>
              <input
                className="Login__input"
                type="number"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter code:"
                required
              />
              <button>Submit</button>
            </form>
          </div>
        </section>
      ) : (
        <section className="Login">
          <div className="Login__body">
            <p className={errMsg ? "errmsg" : "offscreen"}>{errMsg}</p>
            <p>{errMsg}</p>
            <h1 className="Login__title">Login</h1>
            <form onSubmit={handleSubmit} noValidate autoCorrect="off">
              <input
                className="Login__input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                ref={usernameRef}
                placeholder="Username:"
                required
                maxLength={32}
                autoComplete="username"
              />

              <div className="Login__input-block">
                <input
                  className="Login__input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password:"
                  required
                  autoComplete="current-password"
                />

                <p className={forgotPassword ? "instructions" : "offscreen"}>
                  Forgot password? <Link href="/reset-pwd">Reset:</Link>
                </p>
              </div>

              <label className={`Login__label ${showPassword ? "active" : ""}`}>
                <input
                  className="Login__checkbox"
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword((prev) => !prev)}
                />
                Show password
              </label>

              <button
                className="Login__button"
                disabled={!username && !password}
              >
                Submit
              </button>

              <p className="Login__msg">
                Don't have an account? <Link href="/register">Register:</Link>
              </p>
              <Link href="/">Home</Link>
            </form>
          </div>
        </section>
      )}
    </>
  )
}
