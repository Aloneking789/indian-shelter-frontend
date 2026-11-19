import React from "react"
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'India Shelter Finance | Affordable Home Loans & LAP',
  description: 'Fast approvals, transparent rates, and doorstep service for home loans and loan against property across India.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased selection:bg-[#1b5e39]/20 selection:text-[#0f3d23]`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
