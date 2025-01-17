import type { Metadata } from "next"
import "./globals.scss"

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
      <body>{children}</body>
    </html>
  )
}
