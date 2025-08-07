"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ExitLife from "./SnowBored"

export default function ExitLifeLanding() {
  const [showGame, setShowGame] = useState(false)

  useEffect(() => {
    // Font yükleme
    const font = new FontFace("8-BIT WONDER", "url(/fonts/8-BIT-WONDER.TTF)")
    font
      .load()
      .then(() => {
        document.fonts.add(font)
      })
      .catch(console.error)
  }, [])

  if (showGame) {
    return <ExitLife />
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: 'url("/hell-background.gif")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1
          className="text-6xl font-bold mb-4 text-red-600"
          style={{
            fontFamily: '"8-BIT WONDER", monospace',
            textShadow: "3px 3px 0px #000000, -3px -3px 0px #000000, 3px -3px 0px #000000, -3px 3px 0px #000000",
          }}
        >
          EXITS
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-black/80 border-red-600">
            <CardContent className="p-6">
              <h3 className="text-red-600 text-xl mb-4" style={{ fontFamily: '"8-BIT WONDER", monospace' }}>
                🎮 Game Features
              </h3>
              <ul
                className="text-white text-left space-y-2"
                style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: "12px" }}
              >
                <li>• Endless snowboarding action</li>
                <li>• Dodge obstacles and survive</li>
                <li>• Increasing difficulty</li>
                <li>• Retro pixel art style</li>
                <li>• Addictive gameplay</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-red-600">
            <CardContent className="p-6">
              <h3 className="text-red-600 text-xl mb-4" style={{ fontFamily: '"8-BIT WONDER", monospace' }}>
                💰 $EXITS Token
              </h3>
              <ul
                className="text-white text-left space-y-2"
                style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: "12px" }}
              >
                <li>• Fair launch on BAGS</li>
                <li>• Community driven</li>
                <li>• Gaming utility token</li>
                <li>• Meme coin potential</li>
                <li>• Diamond hands only</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => setShowGame(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 text-lg"
            style={{ fontFamily: '"8-BIT WONDER", monospace' }}
          >
            🔥 Play EXITS
          </Button>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-black bg-transparent"
              style={{ fontFamily: '"8-BIT WONDER", monospace' }}
              onClick={() => window.open("https://bags.fm", "_blank")}
            >
              🚀 Buy $EXITS
            </Button>

            <Button
              variant="outline"
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black bg-transparent"
              style={{ fontFamily: '"8-BIT WONDER", monospace' }}
              onClick={() => window.open("https://x.com/exitsdotfun", "_blank")}
            >
              🐦 Follow Us
            </Button>

            <Button
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black bg-transparent"
              style={{ fontFamily: '"8-BIT WONDER", monospace' }}
              onClick={() => window.open("https://t.me/exitsdotfun", "_blank")}
            >
              💬 Telegram
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white mb-4" style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: "12px" }}>
            "Life is about knowing when to exit. EXITS teaches you the art of the perfect exit."
          </p>
          <div
            className="flex justify-center space-x-8 text-red-600"
            style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: "10px" }}
          >
            <span>🎯 Skill-based gameplay</span>
            <span>💎 Diamond hands community</span>
            <span>🚀 Moon mission ready</span>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="mt-16 text-center">
          <p
            className="text-white text-xs opacity-70"
            style={{
              fontFamily: '"8-BIT WONDER", monospace',
              textShadow: "1px 1px 0px #000000",
            }}
          >
            © 2025 EXITS. All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}
