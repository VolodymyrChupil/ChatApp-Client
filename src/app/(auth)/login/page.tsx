"use client"

import Link from "next/link"
import { useContext, useState, useEffect, useRef, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/app/context/AuthProvider"
import { jwtDecode } from "jwt-decode"
import { JwtPayload } from "@/app/context/Context.interface"
import "./login.scss"

export default function Login() {
  const router = useRouter()
  const { setAuth } = useContext(AuthContext)

  const [errMsg, setErrMsg] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const usernameRef = useRef<HTMLInputElement>(null)

  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [forgotPassword, setForgotPassword] = useState<boolean>(false)

  const [verificationCode, setVerificationCode] = useState<string>("")
  const [showVerificationCode, setShowVerificationCode] =
    useState<boolean>(false)

  useEffect(() => {
    const timeout = setTimeout(() => usernameRef.current!.focus(), 100)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    setErrMsg("")
  }, [username, password, verificationCode])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!username && !password) {
      setErrMsg("Invalid data")
      return
    }
    if (showVerificationCode && !verificationCode) {
      setErrMsg("Enter verification code")
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
          setErrMsg("Too many requests, try again later")
        } else if (response.status === 408) {
          setErrMsg("Verification code expired")
        } else if (response.status === 401) {
          setErrMsg("Invalid credentials")
          setForgotPassword(true)
        } else if (response.status === 400) {
          setErrMsg(data?.message?.message)
        } else {
          setErrMsg("Login Failed")
        }
      } else {
        const { username, userId } = jwtDecode<JwtPayload>(data.accessToken)
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
            <p className={errMsg ? "errmsg" : "offscreen"}>{errMsg}</p>
            <p style={{ fontSize: "1.3rem" }}>
              We send verification code on your email.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                className="Login__input"
                type="number"
                value={verificationCode}
                onChange={(e) => {
                  verificationCode.length < 6
                    ? setVerificationCode(e.target.value)
                    : setVerificationCode(e.target.value.slice(0, 6))
                }}
                placeholder="Enter code:"
                required
              />
              <button className="Login__button" disabled={!verificationCode}>
                Submit
              </button>
            </form>
          </div>
        </section>
      ) : (
        <section className="Login">
          <div className="Login__body">
            <p className={errMsg ? "errmsg" : "offscreen"}>{errMsg}</p>
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
                  Forgot password? <Link href="/reset-pwd">Reset</Link>
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
                disabled={!username || !password}
              >
                Submit
              </button>
            </form>

            <p className="Login__msg">
              Don't have an account? <Link href="/register">Register:</Link>
            </p>
          </div>
        </section>
      )}
    </>
  )
}
