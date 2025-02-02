import type { Metadata } from "next"
import "./globals.scss"
import { AuthProvider } from "@/app/context/AuthProvider"

export const metadata: Metadata = {
  title: "ChatApp",
  description: "ChatApp is a messaging app with a focus on security and speed.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
