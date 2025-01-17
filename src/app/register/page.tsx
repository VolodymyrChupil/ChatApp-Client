"use client"

import "./register.scss"
import Link from "next/link"
import { useState, useEffect, useRef, use } from "react"
import validator from "validator"

export default function Register() {
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string>("")

  const [username, setUsername] = useState<string>("")
  const [validUser, setValidUser] = useState<boolean>(false)
  const usernameRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState<string>("")
  const [validEmail, setValidEmail] = useState<boolean>(false)

  const [password, setPassword] = useState<string>("")
  const [validPassword, setValidPassword] = useState<boolean>(false)

  const [passwordMatch, setPasswordMatch] = useState<string>("")
  const [validPasswordMatch, setValidPasswordMatch] = useState<boolean>(false)

  const [showPassword, setShowPassword] = useState<boolean>(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      usernameRef.current!.focus()
    }, 100)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    setValidUser(username.length >= 3 && username.length <= 32)
  }, [username])

  useEffect(() => {
    setValidEmail(validator.isEmail(email))
  }, [email])

  useEffect(() => {
    setValidPassword(validator.isStrongPassword(password, { minLength: 12 }))
    setValidPasswordMatch(password === passwordMatch)
  }, [password, passwordMatch])

  useEffect(() => {
    setErrMsg("")
  }, [username, email, password, passwordMatch])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validUser || !validEmail || !validPassword) {
      setErrMsg("Invalid data")
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        },
      )

      if (!response.ok) {
        const errData = await response.json()
        if (response.status === 429) {
          setErrMsg("Too many requests, try later")
        } else if (response.status === 409) {
          setErrMsg(errData?.message?.message)
        } else if (response.status === 400) {
          setErrMsg("Invalid data")
        } else if (!response.status) {
          setErrMsg("No Server Response")
        } else {
          setErrMsg("Login Failed")
        }
      } else {
        setUsername("")
        setEmail("")
        setPassword("")
        setPasswordMatch("")
        setIsSuccess(true)
      }
    } catch (err) {
      setErrMsg("An error occurred during the request")
    }
  }

  return (
    <>
      {isSuccess ? (
        <section className="Register__complete">
          <div>
            <p>
              Success! To complete registration, check your email.{" "}
              <Link href="/login">Log in</Link>
            </p>
          </div>
        </section>
      ) : (
        <section className="Register">
          <div className="Register__body">
            <p className={errMsg ? "errmsg" : "offscreen"}>{errMsg}</p>
            <h1 className="Register__title">Register</h1>
            <form onSubmit={handleSubmit} noValidate autoCorrect="off">
              <div className="Register__input-block">
                <input
                  className="Register__input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  ref={usernameRef}
                  required
                  placeholder="Username:"
                  maxLength={32}
                />
                <p
                  className={
                    username && !validUser ? "instructions" : "offscreen"
                  }
                >
                  Minimum 3 characters
                </p>
              </div>

              <div className="Register__input-block">
                <input
                  className="Register__input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email:"
                  maxLength={64}
                />
                <p
                  className={
                    email && !validEmail ? "instructions" : "offscreen"
                  }
                >
                  Email not valid
                </p>
              </div>

              <div className="Register__input-block">
                <input
                  className="Register__input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password:"
                  maxLength={64}
                />
                <p
                  className={
                    password && !validPassword ? "instructions" : "offscreen"
                  }
                >
                  Password is not strong enough
                </p>
              </div>

              <div className="Register__input-block">
                <input
                  className="Register__input"
                  type={showPassword ? "text" : "password"}
                  value={passwordMatch}
                  onChange={(e) => setPasswordMatch(e.target.value)}
                  required
                  placeholder="Repeat password:"
                  maxLength={64}
                />
                <p
                  className={
                    passwordMatch && !validPasswordMatch
                      ? "instructions"
                      : "offscreen"
                  }
                >
                  Passwords is not match
                </p>
              </div>

              <label
                className={`Register__label ${showPassword ? "active" : ""}`}
              >
                <input
                  className="Register__checkbox"
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword((prev) => !prev)}
                />
                Show password
              </label>

              <button
                className="Register__button"
                disabled={
                  !validUser ||
                  !validEmail ||
                  !validPassword ||
                  !validPasswordMatch
                }
              >
                Submit
              </button>
            </form>

            <p className="Register__msg">
              Already registered? <Link href="/login">Log in</Link>
            </p>
          </div>
        </section>
      )}
    </>
  )
}
