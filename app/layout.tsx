import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
title: "EXITS",
description: "Master the art of the perfect exit in this retro arcade game",
icons: {
  icon: "/favicon.png",
  shortcut: "/favicon.png",
  apple: "/favicon.png",
},
viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    generator: 'v0.dev'
}

export default function RootLayout({
children,
}: {
children: React.ReactNode
}) {
return (
  <html lang="en">
    {/* <head> etiketi içindeki manuel meta ve link etiketleri kaldırıldı */}
    <body className={inter.className}>{children}</body>
  </html>
)
}
