"use client"

import "./reset-pwd.scss"
import React, { useState, useEffect, FormEvent } from "react"
import { useSearchParams } from "next/navigation"
import { isEmail, isStrongPassword } from "validator"
import Link from "next/link"

export default function Login() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code")

  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [partialSuccess, setPartialSuccess] = useState<boolean>(false)

  const [errMsg, setErrMsg] = useState<string>("")

  const [email, setEmail] = useState<string>("")
  const [validEmail, setValidEmail] = useState<boolean>(false)

  const [password, setPassword] = useState<string>("")
  const [validPassword, setValidPassword] = useState<boolean>(false)

  const [passwordMatch, setPasswordMatch] = useState<string>("")
  const [validPasswordMatch, setValidPasswordMatch] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  useEffect(() => {
    setValidEmail(isEmail(email))
  }, [email])

  useEffect(() => {
    setValidPassword(isStrongPassword(password, { minLength: 12 }))
    setValidPasswordMatch(password === passwordMatch)
  }, [password, passwordMatch])

  useEffect(() => {
    setErrMsg("")
  }, [email, password, passwordMatch])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!code && !validEmail) {
      setErrMsg("Invalid data")
      return
    }

    if (code && !validPassword) {
      setErrMsg("Invalid data")
      return
    }

    try {
      const queryPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/reset-pwd/${code ? code : ""}`
      const queryBody = code ? { newPassword: password } : { email }

      const response = await fetch(queryPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryBody),
      })
      console.log(response)
      if (response.status === 206) {
        setPartialSuccess(true)
        return
      }

      if (!response.ok) {
        if (response.status === 429) {
          setErrMsg("Too many requests, try again later")
        } else if (response.status === 408) {
          setErrMsg("Verification code expired")
        } else if (response.status === 404) {
          setErrMsg("User not found")
        } else if (response.status === 401) {
          setErrMsg("Invalid credentials")
        } else if (response.status === 400) {
          setErrMsg("New password can not be equal to the old password")
        }
      } else {
        setIsSuccess(true)
      }
    } catch (e) {
      setErrMsg("An error occurred during the request")
    }
  }

  let content
  if (isSuccess) {
    content = (
      <section className="ResetPwd">
        <div className="ResetPwd__body">
          <p className="ResetPwd__msg">
            Success, your password has been reset{" "}
            <Link href="/login">Log in</Link>
          </p>
        </div>
      </section>
    )
  } else if (partialSuccess) {
    content = (
      <section className="ResetPwd">
        <div className="ResetPwd__body">
          <p className="ResetPwd__msg">
            Check your email for further instructions. You can close this page.
          </p>
        </div>
      </section>
    )
  } else if (code) {
    content = (
      <section className="ResetPwd">
        <div className="ResetPwd__body">
          <p className={errMsg ? "errmsg" : "offscreen"}>{errMsg}</p>
          <h1 className="ResetPwd__title">Reset password</h1>
          <form onSubmit={handleSubmit} noValidate autoCorrect="off">
            <div className="ResetPwd__input-block">
              <input
                className="ResetPwd__input"
                type={`${showPassword ? "text" : "password"}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={64}
                placeholder="Enter new password:"
                autoComplete="new-password"
              />

              <p
                className={
                  password && !validPassword ? "instructions" : "offscreen"
                }
              >
                Password is not strong enough
              </p>
            </div>

            <div className="ResetPwd__input-block">
              <input
                className="ResetPwd__input"
                type={`${showPassword ? "text" : "password"}`}
                value={passwordMatch}
                onChange={(e) => setPasswordMatch(e.target.value)}
                required
                maxLength={64}
                placeholder="Repeat password:"
                autoComplete="new-password"
              />

              <p
                className={
                  passwordMatch && !validPasswordMatch
                    ? "instructions"
                    : "offscreen"
                }
              >
                Passwords do not match
              </p>
            </div>

            <label
              className={`ResetPwd__label ${showPassword ? "active" : ""}`}
            >
              <input
                className="ResetPwd__checkbox"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              Show password
            </label>

            <button
              className="ResetPwd__button"
              disabled={!validPassword || !validPasswordMatch}
            >
              Submit
            </button>
          </form>
        </div>
      </section>
    )
  } else {
    content = (
      <section className="ResetPwd">
        <div className="ResetPwd__body">
          <p className={errMsg ? "errmsg" : "offscreen"}>{errMsg}</p>
          <h1 className="ResetPwd__title">Reset password</h1>
          <form onSubmit={handleSubmit} noValidate autoCorrect="off">
            <div className="ResetPwd__input-block">
              <input
                className="ResetPwd__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={64}
                placeholder="Enter your email:"
                autoComplete="email"
              />
              <p
                className={email && !validEmail ? "instructions" : "offscreen"}
              >
                Email not valid
              </p>
            </div>

            <button className="ResetPwd__button" disabled={!validEmail}>
              Submit
            </button>
          </form>

          <p className="ResetPwd__msg">
            Remember your password? <Link href="/login">Log in</Link>
          </p>
        </div>
      </section>
    )
  }

  return content
}
