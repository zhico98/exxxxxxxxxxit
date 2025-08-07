"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { GAME_CONSTANTS, COLORS, IMAGES } from "../constants"
import { Button } from "@/components/ui/button"
import LeaderboardModal from "./LeaderboardModal"
import SaveScoreFormModal from "./SaveScoreFormModal" // Yeni import

interface Obstacle {
x: number
y: number
sprite: HTMLImageElement
}

interface Player {
x: number
y: number
velocityY: number
isMovingUp: boolean
sprite: HTMLImageElement | null
}

interface TrailPoint {
x: number
y: number
}

// Karakter hikayeleri
const CHARACTER_STORIES = {
0: {
  name: "Skull Warrior",
  story: {
    page1:
      "Once a mighty warrior who ruled the battlefield with honor and courage. But pride became his downfall when he challenged the gods themselves.",
    page2:
      "Now trapped in the eternal flames of hell, he seeks redemption through the ultimate test - mastering the art of the perfect exit from life's trials.",
  },
},
1: {
  name: "Shadow Ninja",
  story: {
    page1:
      "A master assassin who lived in the shadows, taking lives without question or mercy. His blade was swift, his heart was cold.",
    page2:
      "Death found him in his sleep, and now he must learn that true mastery comes not from taking life, but from knowing when to exit gracefully.",
  },
},
2: {
  name: "Ghost Spirit",
  story: {
    page1:
      "A lost soul who couldn't find peace in life, always searching for something more, never satisfied with what he had.",
    page2:
      "In the afterlife, he discovered that happiness was always within reach. Now he teaches others the wisdom of knowing when enough is enough.",
  },
},
}

export default function SnowBored() {
const canvasRef = useRef<HTMLCanvasElement>(null)
const animationFrameRef = useRef<number | null>(null)
const currentAudioRef = useRef<HTMLAudioElement | null>(null)
const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)
const [score, setScore] = useState(0)
const [gameTime, setGameTime] = useState(0)
const [gameOver, setGameOver] = useState(false)
const [showCharacterSelect, setShowCharacterSelect] = useState(true)
const [selectedCharacter, setSelectedCharacter] = useState(0)
const [showAbout, setShowAbout] = useState(false)
const [showStory, setShowStory] = useState(false)
const [selectedStoryCharacter, setSelectedStoryCharacter] = useState(0)
const [isMobile, setIsMobile] = useState(false)
const [showLeaderboard, setShowLeaderboard] = useState(false)
const [showSaveScoreModal, setShowSaveScoreModal] = useState(false) // Yeni state
// const [leaderboardScores, setLeaderboardScores] = useState<{ name: string; score: number; wallet?: string }[]>([]); // Bu state artık LeaderboardModal içinde yönetilecek

// Add this after the state declarations
const [audioEnabled, setAudioEnabled] = useState(false)

const gameStateRef = useRef({
  player: {
    x: 120,
    y: GAME_CONSTANTS.CANVAS_HEIGHT / 2,
    velocityY: 0,
    isMovingUp: false,
    sprite: null as HTMLImageElement | null,
  },
  obstacles: [] as Obstacle[],
  trailPoints: [] as TrailPoint[],
  frameCount: 0,
  startTime: Date.now(),
  gameSpeedMultiplier: 1,
  obstacleGenerationInterval: GAME_CONSTANTS.TREE_GENERATION_INTERVAL,
  lastSpeedIncreaseTime: 0,
  score: 0,
  isGameOver: false,
  isRunning: false,
  cameraX: 0,
})

// Mobile detection
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(
      window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    )
  }

  checkMobile()
  window.addEventListener("resize", checkMobile)
  return () => window.removeEventListener("resize", checkMobile)
}, [])

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

// Add this useEffect to enable audio on first user interaction
useEffect(() => {
  const enableAudio = () => {
    setAudioEnabled(true)
    document.removeEventListener("click", enableAudio)
    document.removeEventListener("touchstart", enableAudio)
    document.removeEventListener("keydown", enableAudio)
  }

  document.addEventListener("click", enableAudio, { once: true })
  document.addEventListener("touchstart", enableAudio, { once: true })
  document.addEventListener("keydown", enableAudio, { once: true })

  return () => {
    document.removeEventListener("click", enableAudio)
    document.removeEventListener("touchstart", enableAudio)
    document.removeEventListener("keydown", enableAudio)
  }
}, [])

const stopGame = () => {
  if (animationFrameRef.current) {
    cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = null
  }
  gameStateRef.current.isRunning = false
}

const resetGameState = () => {
  gameStateRef.current = {
    player: {
      x: 120,
      y: GAME_CONSTANTS.CANVAS_HEIGHT / 2,
      velocityY: 0,
      isMovingUp: false,
      sprite: null,
    },
    obstacles: [],
    trailPoints: [],
    frameCount: 0,
    startTime: Date.now(),
    gameSpeedMultiplier: 1,
    obstacleGenerationInterval: GAME_CONSTANTS.TREE_GENERATION_INTERVAL,
    lastSpeedIncreaseTime: 0,
    score: 0,
    isGameOver: false,
    isRunning: false,
    cameraX: 0,
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.code === "Space" && !gameStateRef.current.isGameOver && !showCharacterSelect) {
    e.preventDefault()
    gameStateRef.current.player.isMovingUp = true
  }
}

const handleKeyUp = (e: KeyboardEvent) => {
  if (e.code === "Space" && !gameStateRef.current.isGameOver && !showCharacterSelect) {
    e.preventDefault()
    gameStateRef.current.player.isMovingUp = false
  }
}

// Mobile touch controls
const handleTouchStart = (e: React.TouchEvent) => {
  e.preventDefault()
  if (!gameStateRef.current.isGameOver && !showCharacterSelect) {
    gameStateRef.current.player.isMovingUp = true
  }
}

const handleTouchEnd = (e: React.TouchEvent) => {
  e.preventDefault()
  if (!gameStateRef.current.isGameOver && !showCharacterSelect) {
    gameStateRef.current.player.isMovingUp = false
  }
}

// — Stop all audio —
const stopAllAudio = () => {
  if (currentAudioRef.current) {
    currentAudioRef.current.pause()
    currentAudioRef.current.currentTime = 0
    currentAudioRef.current = null
  }
  if (backgroundMusicRef.current) {
    backgroundMusicRef.current.pause()
    backgroundMusicRef.current.currentTime = 0
    backgroundMusicRef.current = null
  }
}

// — Play background music —
const playBackgroundMusic = () => {
  stopAllAudio()

  try {
    const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/background-music-WdUWzp8HGgjly0kgXb5ZbWjgrULg8j.mp3") // Yeni dosya yolu
    audio.volume = 0.3
    audio.loop = true
    audio.preload = "auto"
    backgroundMusicRef.current = audio

    // Add multiple event listeners for better compatibility
    const playAudio = () => {
      audio.play().catch((err) => {
        console.warn("Background music autoplay blocked:", err)
        // Try to play on next user interaction
        const playOnInteraction = () => {
          audio.play().catch(console.error)
          document.removeEventListener("click", playOnInteraction)
          document.removeEventListener("touchstart", playOnInteraction)
        }
        document.addEventListener("click", playOnInteraction, { once: true })
        document.addEventListener("touchstart", playOnInteraction, { once: true })
      })
    }

    if (audio.readyState >= 2) {
      playAudio()
    } else {
      audio.addEventListener("canplay", playAudio, { once: true })
      audio.addEventListener("loadeddata", playAudio, { once: true })
    }

    audio.load()
  } catch (error) {
    console.error("Failed to create background audio:", error)
  }
}

// — Play click sound —
const playClickSound = () => {
  try {
    const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/click-sound-Yld8MeNGnVGuRXX4U62Rh9DS821nUm.mp3") // Yeni dosya yolu
    audio.volume = 0.4
    audio.preload = "auto"

    const playAudio = () => {
      audio.play().catch((err) => {
        console.warn("Click sound failed:", err)
      })
    }

    if (audio.readyState >= 2) {
      playAudio()
    } else {
      audio.addEventListener("canplay", playAudio, { once: true })
      audio.addEventListener("loadeddata", playAudio, { once: true })
    }

    audio.load()
  } catch (error) {
    console.error("Failed to create click audio:", error)
  }
}

const playCharacterSound = (characterIndex: number) => {
  // Stop any currently playing character audio (but not background music)
  if (currentAudioRef.current) {
    currentAudioRef.current.pause()
    currentAudioRef.current.currentTime = 0
    currentAudioRef.current = null
  }

  let audioSrc = ""
  switch (characterIndex) {
    case 0: // Skull Warrior
      audioSrc = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skullwarior-sound-q0Gp2Fx1xvTKCwHjiGJj8N7ya7EwSW.mp3" // Yeni dosya yolu
      break
    case 1: // Shadow Ninja (Mevcut ses dosyası korunuyor)
      // audioSrc = "/ninja-sound.mp3" satırını aşağıdaki ile değiştir:
      audioSrc = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ninja-sound-X6zYMRJnLoaULcPE7Y4oUovd0nrbsL.mp3"
      break
    case 2: // Ghost Spirit
      audioSrc = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ghost-sound-t5WjUMom6EWJS4rsu5PnWmajxIO1ke.mp3" // Yeni dosya yolu
      break
    default:
      return
  }

  try {
    const audio = new Audio(audioSrc)
    audio.volume = 0.5
    audio.preload = "auto"
    currentAudioRef.current = audio

    const playAudio = () => {
      audio.play().catch((err) => {
        console.warn(`Character sound ${characterIndex} failed:`, err)
      })
    }

    if (audio.readyState >= 2) {
      playAudio()
    } else {
      audio.addEventListener("canplay", playAudio, { once: true })
      audio.addEventListener("loadeddata", playAudio, { once: true })
    }

    audio.load()
  } catch (error) {
    console.error("Failed to create character audio:", error)
  }
}

// — Play Game Over Sound —
const playGameOverSound = () => {
  // Stop background music immediately
  if (backgroundMusicRef.current) {
    backgroundMusicRef.current.pause()
    backgroundMusicRef.current.currentTime = 0
    backgroundMusicRef.current = null
  }

  try {
    const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/game-over-sound-F1aM1v62BmmgUnbv9xN6CoxN2xjMJb.mp3") // Yeni dosya yolu
    audio.volume = 0.6
    audio.preload = "auto"

    const playAudio = () => {
      audio.play().catch((err) => {
        console.warn("Game over sound failed:", err)
      })
    }

    if (audio.readyState >= 2) {
      playAudio()
    } else {
      audio.addEventListener("canplay", playAudio, { once: true })
      audio.addEventListener("loadeddata", playAudio, { once: true })
    }

    audio.load()
  } catch (error) {
    console.error("Failed to create game over audio:", error)
  }
}

const openAbout = () => {
  playClickSound() // Click sound added
  setShowAbout(true)
  setShowLeaderboard(false)
  setShowSaveScoreModal(false)
}

const closeAbout = () => {
  playClickSound() // Click sound added
  setShowAbout(false)
  setShowStory(false)
}

const openStory = (index: number) => {
  // playClickSound() kaldırıldı - sadece karakter sesi çalacak
  setSelectedStoryCharacter(index)
  setShowStory(true)
}

const closeStory = () => {
  // playClickSound() kaldırıldı
  setShowStory(false)
}

const openLeaderboard = () => {
  playClickSound() // Click sound added
  setShowLeaderboard(true)
  setShowAbout(false)
  setShowSaveScoreModal(false)
}

const closeLeaderboard = () => {
  playClickSound() // Click sound added
  setShowLeaderboard(false)
}

const openSaveScoreModal = () => {
  playClickSound() // Click sound added
  setShowSaveScoreModal(true)
  setShowAbout(false)
  setShowLeaderboard(false)
}

const closeSaveScoreModal = () => {
  playClickSound() // Click sound added
  setShowSaveScoreModal(false)
}

const startGame = () => {
  // playClickSound() kaldırıldı
  resetGameState()
  setGameOver(false)
  setShowCharacterSelect(false)
  playBackgroundMusic() // Oyun başladığında arka plan müziğini çal
}

const backToCharacterSelect = () => {
  // playClickSound() kaldırıldı
  stopGame()
  stopAllAudio()
  setShowCharacterSelect(true)
}

// Skor başarıyla kaydedildiğinde liderlik tablosunu aç
const handleSaveScoreSuccess = () => {
  closeSaveScoreModal(); // Kaydetme modalını kapat
  openLeaderboard(); // Liderlik tablosunu aç
};

useEffect(() => {
  if (showCharacterSelect) {
    stopGame()
    return
  }

  const canvas = canvasRef.current
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // smarter image loader: only add `crossOrigin` for absolute/remote URLs
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image()
      if (/^https?:\/\//.test(src)) {
        // remote image – need CORS
        img.crossOrigin = "anonymous"
      }
      // local (`/public/...`) images work without CORS headers
      img.src = src
      img.onload = () => resolve(img)
      img.onerror = (error) => {
        // Hata mesajını console.error yerine console.warn olarak değiştirildi
        console.warn(`Failed to load image: ${src}. Using fallback.`, error)
        const canvas = document.createElement("canvas")
        canvas.width = 56
        canvas.height = 56
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "#ff0000"
          ctx.fillRect(0, 0, 56, 56)
        }
        const fallbackImg = new Image()
        fallbackImg.src = canvas.toDataURL()
        resolve(fallbackImg)
      }
    })
  }

  const loadObstacleSprites = async () => {
    const treeSprites = await Promise.all(IMAGES.TREES.map(loadImage))
    const snowmanSprites = await Promise.all(IMAGES.SNOWMEN.map(loadImage))
    return { treeSprites, snowmanSprites }
  }

  const initGame = async () => {
    const playerSprite = await loadImage(IMAGES.CHARACTERS[selectedCharacter].sprite)
    const { treeSprites, snowmanSprites } = await loadObstacleSprites()
    const backgroundImg = await loadImage("/hell-background.gif")

    gameStateRef.current.player.sprite = playerSprite
    gameStateRef.current.isRunning = true

    const getRandomObstacleSprite = () => {
      // Eyes.png daha az çıksın (sadece %20 şans)
      const useTree = Math.random() > 0.2
      const sprites = useTree ? treeSprites : snowmanSprites
      return sprites[Math.floor(Math.random() * sprites.length)]
    }

    // İlk engelleri ekle
    for (let i = 0; i < 6; i++) {
      gameStateRef.current.obstacles.push({
        x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH + GAME_CONSTANTS.CANVAS_WIDTH,
        y: Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT - 100) + 50,
        sprite: getRandomObstacleSprite(),
      })
    }

    const drawBackground = () => {
      // Sabit arka plan - paralaks efekti kaldırıldı
      const scale = 1.3 // Yakınlaştırma faktörü

      ctx.save()
      ctx.scale(scale, scale)
      ctx.drawImage(
        backgroundImg,
        0,
        -50 / scale,
        GAME_CONSTANTS.CANVAS_WIDTH / scale,
        (GAME_CONSTANTS.CANVAS_HEIGHT + 100) / scale,
      )
      ctx.restore()
    }

    const drawPlayer = () => {
      const { player } = gameStateRef.current
      if (player.sprite) {
        ctx.save()
        ctx.translate(player.x - gameStateRef.current.cameraX, player.y)

        if (gameStateRef.current.isGameOver) {
          ctx.rotate(-Math.PI / 2)
        }

        ctx.drawImage(
          player.sprite,
          -GAME_CONSTANTS.PLAYER_WIDTH / 2,
          -GAME_CONSTANTS.PLAYER_HEIGHT / 2,
          GAME_CONSTANTS.PLAYER_WIDTH,
          GAME_CONSTANTS.PLAYER_HEIGHT,
        )
        ctx.restore()
      }
    }

    const drawObstacles = () => {
      gameStateRef.current.obstacles.forEach((obstacle) => {
        ctx.drawImage(
          obstacle.sprite,
          obstacle.x - gameStateRef.current.cameraX - GAME_CONSTANTS.OBSTACLE_WIDTH / 2,
          obstacle.y - GAME_CONSTANTS.OBSTACLE_HEIGHT,
          GAME_CONSTANTS.OBSTACLE_WIDTH,
          GAME_CONSTANTS.OBSTACLE_HEIGHT,
        )
      })
    }

    const drawSkiTrail = () => {
      ctx.strokeStyle = COLORS.skiTrail
      ctx.lineWidth = 3
      ctx.beginPath()
      gameStateRef.current.trailPoints.forEach((point, index) => {
        const x = point.x - gameStateRef.current.cameraX
        if (index === 0) {
          ctx.moveTo(x, point.y)
        } else {
          ctx.lineTo(x, point.y)
        }
      })
      ctx.stroke()
    }

    const drawUI = () => {
      ctx.fillStyle = "#FFFFFF"
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 3
      ctx.font = `${isMobile ? "14px" : "18px"} '8-BIT WONDER', monospace`

      const scoreText = `Score: ${gameStateRef.current.score}`
      const scoreWidth = ctx.measureText(scoreText).width
      ctx.strokeText(scoreText, GAME_CONSTANTS.CANVAS_WIDTH - scoreWidth - 20, 35)
      ctx.fillText(scoreText, GAME_CONSTANTS.CANVAS_WIDTH - scoreWidth - 20, 35)

      const currentTime = gameStateRef.current.isGameOver
        ? gameTime
        : Math.floor((Date.now() - gameStateRef.current.startTime) / 1000)
      const timeString = new Date(currentTime * 1000).toISOString().substr(14, 5)
      ctx.strokeText(timeString, 20, 35)
      ctx.fillText(timeString, 20, 35)
    }

    const checkCollision = () => {
      const { player, obstacles } = gameStateRef.current
      for (const obstacle of obstacles) {
        const dx = Math.abs(player.x - obstacle.x)
        const dy = Math.abs(player.y - obstacle.y)
        if (
          dx < (GAME_CONSTANTS.PLAYER_WIDTH + GAME_CONSTANTS.OBSTACLE_WIDTH) / 4 &&
          dy < (GAME_CONSTANTS.PLAYER_HEIGHT + GAME_CONSTANTS.OBSTACLE_HEIGHT) / 4
        ) {
          return true
        }
      }
      return false
    }

    const updateGame = () => {
      if (gameStateRef.current.isGameOver || !gameStateRef.current.isRunning) return

      const { player, obstacles, trailPoints } = gameStateRef.current
      const currentTime = Date.now()

      const gameElapsedTime = currentTime - gameStateRef.current.startTime
      const canSpawnObstacles = gameElapsedTime > 3000

      // Kamera takibi - oyuncuyu merkeze yakın tut
      const targetCameraX = player.x - GAME_CONSTANTS.CANVAS_WIDTH * 0.3
      gameStateRef.current.cameraX += (targetCameraX - gameStateRef.current.cameraX) * 0.1

      if (currentTime - gameStateRef.current.lastSpeedIncreaseTime >= 2500) {
        gameStateRef.current.gameSpeedMultiplier += 0.05
        gameStateRef.current.obstacleGenerationInterval = Math.max(
          30,
          gameStateRef.current.obstacleGenerationInterval - 5,
        )
        gameStateRef.current.lastSpeedIncreaseTime = currentTime
      }

      if (player.isMovingUp) {
        player.velocityY = Math.max(player.velocityY - 0.3, -GAME_CONSTANTS.MOVEMENT_SPEED * 1.2)
      } else {
        player.velocityY = Math.min(player.velocityY + GAME_CONSTANTS.GRAVITY, GAME_CONSTANTS.MOVEMENT_SPEED * 1.2)
      }

      player.y += player.velocityY
      player.x += GAME_CONSTANTS.MOVEMENT_SPEED * gameStateRef.current.gameSpeedMultiplier * 0.5

      if (player.y < 50) player.y = 50
      if (player.y > GAME_CONSTANTS.CANVAS_HEIGHT - 70) player.y = GAME_CONSTANTS.CANVAS_HEIGHT - 70

      trailPoints.unshift({ x: player.x, y: player.y + 10 })
      if (trailPoints.length > 50) {
        trailPoints.pop()
      }

      gameStateRef.current.obstacles = obstacles
        .map((obstacle) => ({
          ...obstacle,
          x: obstacle.x - GAME_CONSTANTS.MOVEMENT_SPEED * gameStateRef.current.gameSpeedMultiplier * 0.5,
        }))
        .filter((obstacle) => obstacle.x > gameStateRef.current.cameraX - 100)

      if (
        canSpawnObstacles &&
        gameStateRef.current.frameCount % gameStateRef.current.obstacleGenerationInterval === 0
      ) {
        gameStateRef.current.obstacles.push({
          x: gameStateRef.current.cameraX + GAME_CONSTANTS.CANVAS_WIDTH + 50,
          y: Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT - 100) + 50,
          sprite: getRandomObstacleSprite(),
        })
      }

      if (checkCollision()) {
        gameStateRef.current.isGameOver = true
        setGameOver(true)
        setGameTime(Math.floor((Date.now() - gameStateRef.current.startTime) / 1000))
        playGameOverSound() // This will stop background music and play game over sound
        return
      }

      if (gameStateRef.current.frameCount % 60 === 0) {
        gameStateRef.current.score += 10
      }

      gameStateRef.current.frameCount++
    }

    const gameLoop = () => {
      if (!gameStateRef.current.isRunning) return

      ctx.clearRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT)

      drawBackground()
      drawSkiTrail()
      drawObstacles()
      drawPlayer()
      drawUI()

      if (!gameStateRef.current.isGameOver) {
        updateGame()
        setScore(gameStateRef.current.score)
      }

      if (gameStateRef.current.isRunning) {
        animationFrameRef.current = requestAnimationFrame(gameLoop)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    gameLoop()
  }

  initGame()

  return () => {
    stopGame()
    window.removeEventListener("keydown", handleKeyDown)
    window.removeEventListener("keyup", handleKeyUp)
  }
}, [gameOver, gameTime, showCharacterSelect, selectedCharacter, isMobile])

return (
  <div
    className={`flex flex-col items-center justify-center min-h-screen ${isMobile ? "p-2" : "p-4"} relative`}
    style={{
      backgroundImage: 'url("/hell-background.gif")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    }}
  >
    {/* Sol üst - About ve Leaderboard butonları */}
    <div className={`absolute ${isMobile ? "top-2 left-2" : "top-4 left-4"} flex gap-1 z-10`}>
      <Button
        variant="outline"
        className={`border-red-600 text-red-600 hover:bg-red-600 hover:text-black bg-black/80 ${isMobile ? "px-2 py-1 text-xs" : "px-4 py-2"}`}
        style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "10px" : "12px" }}
        onClick={openAbout}
      >
        About
      </Button>
      <Button
        variant="outline"
        className={`border-red-600 text-red-600 hover:bg-red-600 hover:text-black bg-black/80 ${isMobile ? "px-2 py-1 text-xs" : "px-4 py-2"}`}
        style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "10px" : "12px" }}
        onClick={openLeaderboard}
      >
        Leaderboard
      </Button>
    </div>

    {/* Sağ üst - Sosyal medya butonları */}
    <div className={`absolute ${isMobile ? "top-2 right-2" : "top-4 right-4"} flex gap-1 z-10`}>
      <Button
        variant="outline"
        className={`border-red-600 text-red-600 hover:bg-red-600 hover:text-black bg-black/80 ${isMobile ? "px-2 py-1" : "px-3 py-2"}`}
        style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "8px" : "10px" }}
        onClick={() => {
          playClickSound()
          window.open("https://x.com/exitsdotfun", "_blank")
        }}
      >
        {isMobile ? "X" : "Twitter"}
      </Button>
      <Button
        variant="outline"
        className={`border-red-600 text-red-600 hover:bg-red-600 hover:text-black bg-black/80 ${isMobile ? "px-2 py-1" : "px-3 py-2"}`}
        style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "8px" : "10px" }}
        onClick={() => {
          playClickSound()
          window.open("https://t.me/exitsdotfun", "_blank")
        }}
      >
        {isMobile ? "TG" : "Telegram"}
      </Button>
      <Button
        variant="outline"
        className={`border-red-600 text-red-600 hover:bg-red-600 hover:text-black bg-black/80 ${isMobile ? "px-2 py-1" : "px-3 py-2"}`}
        style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "8px" : "10px" }}
        onClick={() => {
          playClickSound()
          window.open("https://bags.fm", "_blank")
        }}
      >
        {isMobile ? "BAGS" : "BAGS"}
      </Button>
    </div>

    {showCharacterSelect ? (
      <>
        <h1
          className={`${isMobile ? "text-2xl" : "text-4xl"} font-bold mb-8 text-red-600`}
          style={{
            fontFamily: '"8-BIT WONDER", monospace',
            textShadow: "1px 1px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000",
            WebkitTextStroke: "0.5px #000000",
          }}
        >
          EXITS
        </h1>

        <div
          className={`bg-black/80 ${isMobile ? "p-4" : "p-8"} rounded-lg border-2 border-red-600 ${isMobile ? "w-full max-w-sm" : ""}`}
        >
          <h2
            className={`${isMobile ? "text-lg" : "text-2xl"} font-bold mb-6 text-white text-center`}
            style={{
              fontFamily: '"8-BIT WONDER", monospace',
              textShadow: "1px 1px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000",
            }}
          >
            Select Character
          </h2>

          <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-3 gap-4"} mb-6`}>
            {IMAGES.CHARACTERS.map((character, index) => (
              <div
                key={index}
                className={`${isMobile ? "p-3" : "p-4"} border-2 rounded cursor-pointer transition-all ${
                  selectedCharacter === index
                    ? "border-green-400 bg-green-400/20"
                    : "border-gray-400 bg-gray-400/20 hover:border-white"
                }`}
                onClick={() => {
                  // playClickSound() kaldırıldı
                  setSelectedCharacter(index)
                  playCharacterSound(index)
                }}
              >
                <div
                  className={`${isMobile ? "w-12 h-12" : "w-16 h-16"} mx-auto mb-2 flex items-center justify-center`}
                >
                  <img
                    src={character.sprite || "/placeholder.svg"}
                    alt={character.name}
                    style={{
                      imageRendering: "pixelated",
                      width: isMobile ? "48px" : "56px",
                      height: isMobile ? "48px" : "56px",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=56&width=56&text=" + character.name
                    }}
                  />
                </div>
                <p
                  className={`text-white text-center ${isMobile ? "text-xs" : "text-xs"}`}
                  style={{
                    fontFamily: '"8-BIT WONDER", monospace',
                    textShadow:
                      "0.5px 0.5px 0px #000000, -0.5px -0.5px 0px #000000, 0.5px -0.5px 0px #000000, -0.5px 0.5px 0px #000000",
                    WebkitTextStroke: "0.3px #000000",
                  }}
                >
                  {character.name}
                </p>
              </div>
            ))}
          </div>

          <Button
            onClick={startGame}
            className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold ${isMobile ? "py-4 text-base" : "py-3"}`}
            style={{
              fontFamily: '"8-BIT WONDER", monospace',
              textShadow: "1px 1px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000",
              WebkitTextStroke: "0.5px #000000",
            }}
          >
            Start Game
          </Button>
          {/* Yeni Save Score butonu */}
          <Button
            onClick={openSaveScoreModal}
            className={`w-full bg-gray-700 hover:bg-gray-600 text-white font-bold ${isMobile ? "py-4 text-base mt-2" : "py-3 mt-2"}`}
            style={{
              fontFamily: '"8-BIT WONDER", monospace',
              textShadow: "1px 1px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000",
              WebkitTextStroke: "0.5px #000000",
            }}
          >
            Save Score
          </Button>
        </div>
      </>
    ) : (
      <>
        <h1
          className={`${isMobile ? "text-2xl" : "text-4xl"} font-bold mb-2 ${gameOver ? "text-red-600" : "text-red-600"}`}
          style={{
            fontFamily: '"8-BIT WONDER", monospace',
            textShadow: "1px 1px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000",
            WebkitTextStroke: "0.5px #000000",
          }}
        >
          {gameOver ? "GAME OVER - YOU DIE" : "EXITS"}
        </h1>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={isMobile ? Math.min(GAME_CONSTANTS.CANVAS_WIDTH, window.innerWidth - 20) : GAME_CONSTANTS.CANVAS_WIDTH}
            height={isMobile ? Math.min(GAME_CONSTANTS.CANVAS_HEIGHT, 300) : GAME_CONSTANTS.CANVAS_HEIGHT}
            className={`border-4 border-gray-700 rounded-lg ${isMobile ? "w-full max-w-sm" : ""}`}
            style={{
              touchAction: "none",
              maxWidth: isMobile ? "100%" : "none",
              height: isMobile ? "auto" : "auto",
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75">
              <div className="text-white text-center space-y-4">
                <button
                  onClick={backToCharacterSelect}
                  className={`${isMobile ? "px-3 py-2 text-sm" : "px-4 py-2"} bg-red-600 text-white rounded hover:bg-red-700 mr-2`}
                  style={{ fontFamily: '"8-BIT WONDER", monospace' }}
                >
                  Select Character
                </button>
                <button
                  onClick={startGame}
                  className={`${isMobile ? "px-3 py-2 text-sm" : "px-4 py-2"} bg-black text-white rounded hover:bg-gray-800`}
                  style={{ fontFamily: '"8-BIT WONDER", monospace' }}
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
        <p
          className={`text-white mt-4 text-center ${isMobile ? "text-xs px-4" : ""}`}
          style={{
            fontFamily: '"8-BIT WONDER", monospace',
            textShadow: "1px 1px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000",
          }}
        >
          {isMobile ? "Touch and hold screen to move up" : "Press and hold SPACE to move up"}
        </p>
      </>
    )}

    {/* About Modal - Overlay for Game Screen */}
    {showAbout && !showStory && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div
          className={`bg-black/90 ${isMobile ? "p-4 mx-2" : "p-8 mx-4"} rounded-lg border-4 border-red-600 ${isMobile ? "w-full max-w-sm" : "max-w-4xl w-full"} relative`}
        >
          <div className="bg-black/80 p-6 rounded-lg">
            <h2
              className={`${isMobile ? "text-xl" : "text-3xl"} font-bold mb-6 text-red-600 text-center`}
              style={{
                fontFamily: '"8-BIT WONDER", monospace',
                textShadow: "2px 2px 0px #000000",
              }}
            >
              CHARACTER STORIES
            </h2>

            <p
              className="text-white text-center mb-8"
              style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "10px" : "12px" }}
            >
              Choose a character to learn their story
            </p>

            <div className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-3 gap-6"} mb-8`}>
              {IMAGES.CHARACTERS.map((character, index) => (
                <div
                  key={index}
                  className={`${isMobile ? "p-3" : "p-4"} border-2 border-red-600 rounded cursor-pointer transition-all hover:border-red-300 hover:bg-red-400/10 bg-black/60`}
                  onClick={() => {
                    playClickSound() // Click sound added
                    openStory(index)
                  }}
                >
                  <div
                    className={`${isMobile ? "w-16 h-16" : "w-20 h-20"} mx-auto mb-4 flex items-center justify-center`}
                  >
                    <img
                      src={character.sprite || "/placeholder.svg"}
                      alt={character.name}
                      style={{
                        imageRendering: "pixelated",
                        width: isMobile ? "56px" : "64px",
                        height: isMobile ? "56px" : "64px",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=64&width=64&text=" + character.name
                      }}
                    />
                  </div>
                  <p
                    className="text-red-600 text-center font-bold"
                    style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "10px" : "12px" }}
                  >
                    {CHARACTER_STORIES[index as keyof typeof CHARACTER_STORIES].name}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={closeAbout}
                className={`bg-red-600 hover:bg-red-700 text-white font-bold ${isMobile ? "px-4 py-2" : "px-6 py-3"}`}
                style={{ fontFamily: '"8-BIT WONDER", monospace' }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Story Notebook Modal - Overlay for Game Screen */}
    {showStory && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2">
        <div className={`relative ${isMobile ? "w-full max-w-sm" : "max-w-7xl w-full mx-4"}`}>
          {isMobile ? (
            // Mobile Story View - Simple Card Layout
            <div className="bg-black/90 p-4 rounded-lg border-4 border-red-600">
              <h3
                className="text-lg font-bold mb-4 text-red-600 text-center"
                style={{
                  fontFamily: '"8-BIT WONDER", monospace',
                  textShadow: "2px 2px 0px #000000",
                }}
              >
                {CHARACTER_STORIES[selectedStoryCharacter as keyof typeof CHARACTER_STORIES].name}
              </h3>

              <div className="text-center mb-4">
                <img
                  src={IMAGES.CHARACTERS[selectedStoryCharacter].sprite || "/placeholder.svg"}
                  alt={CHARACTER_STORIES[selectedStoryCharacter as keyof typeof CHARACTER_STORIES].name}
                  style={{
                    imageRendering: "pixelated",
                    width: "64px",
                    height: "64px",
                    objectFit: "contain",
                  }}
                  className="mx-auto"
                />
              </div>

              <div className="space-y-4 mb-6">
                <p
                  className="text-white text-sm leading-relaxed"
                  style={{
                    fontFamily: '"8-BIT WONDER", monospace',
                    fontSize: "10px",
                    lineHeight: "16px",
                  }}
                >
                  {CHARACTER_STORIES[selectedStoryCharacter as keyof typeof CHARACTER_STORIES].story.page1}
                </p>

                <div className="h-px bg-red-500 my-4" />

                <p
                  className="text-white text-sm leading-relaxed"
                  style={{
                    fontFamily: '"8-BIT WONDER", monospace',
                    fontSize: "10px",
                    lineHeight: "16px",
                  }}
                >
                  {CHARACTER_STORIES[selectedStoryCharacter as keyof typeof CHARACTER_STORIES].story.page2}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={closeStory}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 text-xs"
                  style={{
                    fontFamily: '"8-BIT WONDER", monospace',
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={closeAbout}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-2 text-xs"
                  style={{
                    fontFamily: '"8-BIT WONDER", monospace',
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            // Desktop Story View - Book Layout (unchanged from previous version)
            <div
              className="relative mx-auto"
              style={{
                width: "800px",
                height: "600px",
                background: `
                  linear-gradient(135deg, #8B4513 0%, #A0522D 25%, #CD853F 50%, #A0522D 75%, #8B4513 100%)
                `,
                border: "12px solid #654321",
                borderRadius: "20px",
                boxShadow: `
                  0 0 0 4px #4A2C17,
                  0 20px 40px rgba(0,0,0,0.8),
                  inset 0 0 20px rgba(0,0,0,0.3)
                `,
                imageRendering: "pixelated",
              }}
            >
              {/* Book Spine Details */}
              <div
                className="absolute left-0 top-0 bottom-0 w-16"
                style={{
                  background: `
                    repeating-linear-gradient(
                      0deg,
                      #2F1B14 0px,
                      #2F1B14 8px,
                      #1A0F0A 8px,
                      #1A0F0A 12px,
                      #4A2C17 12px,
                      #4A2C17 20px
                    )
                  `,
                  borderRadius: "20px 0 0 20px",
                }}
              />

              {/* Metal Rings */}
              <div className="absolute left-12 top-16 w-8 h-8 bg-gray-600 rounded-full border-4 border-gray-800" />
              <div className="absolute left-12 top-32 w-8 h-8 bg-gray-600 rounded-full border-4 border-gray-800" />
              <div className="absolute left-12 bottom-32 w-8 h-8 bg-gray-600 rounded-full border-4 border-gray-800" />
              <div className="absolute left-12 bottom-16 w-8 h-8 bg-gray-600 rounded-full border-4 border-gray-800" />

              {/* Pages Container */}
              <div className="flex gap-4 ml-20 p-8 h-full">
                {/* Left Page */}
                <div
                  className="flex-1 relative"
                  style={{
                    background: "#FFFEF7",
                    border: "4px solid #E8E8E8",
                    borderRadius: "8px",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.1), 4px 4px 8px rgba(0,0,0,0.3)",
                    backgroundImage: `
                      repeating-linear-gradient(
                        transparent,
                        transparent 28px,
                        #E0E0E0 28px,
                        #E0E0E0 30px
                      )
                    `,
                  }}
                >
                  <div className="p-6 h-full flex flex-col">
                    <h3
                      className="text-2xl font-bold mb-4 text-red-700 text-center"
                      style={{
                        fontFamily: '"8-BIT WONDER", monospace',
                        textShadow: "2px 2px 0px rgba(0,0,0,0.3)",
                      }}
                    >
                      {CHARACTER_STORIES[selectedStoryCharacter as keyof typeof CHARACTER_STORIES].name}
                    </h3>
                    <div className="h-1 bg-red-500 mb-6 rounded" />
                    <p
                      className="text-black leading-relaxed flex-1"
                      style={{
                        fontFamily: '"8-BIT WONDER", monospace',
                        fontSize: "11px",
                        lineHeight: "30px",
                      }}
                    >
                      {CHARACTER_STORIES[selectedStoryCharacter as keyof typeof CHARACTER_STORIES].story.page1}
                    </p>
                  </div>
                </div>

                {/* Right Page */}
                <div
                  className="flex-1 relative"
                  style={{
                    background: "#FFFEF7",
                    border: "4px solid #E8E8E8",
                    borderRadius: "8px",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.1), 4px 4px 8px rgba(0,0,0,0.3)",
                    backgroundImage: `
                      repeating-linear-gradient(
                        transparent,
                        transparent 28px,
                        #E0E0E0 28px,
                        #E0E0E0 30px
                      )
                    `,
                  }}
                >
                  <div className="p-6 h-full flex flex-col">
                    <div className="h-8 mb-4" />
                    <div className="h-1 bg-red-500 mb-6 rounded" />
                    <p
                      className="text-black leading-relaxed mb-6"
                      style={{
                        fontFamily: '"8-BIT WONDER", monospace',
                        fontSize: "11px",
                        lineHeight: "30px",
                      }}
                    >
                      {CHARACTER_STORIES[selectedStoryCharacter as keyof typeof CHARACTER_STORIES].story.page2}
                    </p>
                    {/* Character Image */}
                    <div className="text-center mt-auto">
                      <div
                        className="inline-block p-4 bg-white rounded-lg border-4 border-gray-300"
                        style={{
                          boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)",
                        }}
                      >
                        <img
                          src={IMAGES.CHARACTERS[selectedStoryCharacter].sprite || "/placeholder.svg"}
                          alt={CHARACTER_STORIES[selectedStoryCharacter as keyof typeof CHARACTER_STORIES].name}
                          style={{
                            imageRendering: "pixelated",
                            width: "80px",
                            height: "80px",
                            objectFit: "contain",
                            filter: "sepia(10%) contrast(1.1)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons - Eşitlenmiş */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-between px-24">
                <Button
                  onClick={() => {
                    // playClickSound() kaldırıldı
                    closeStory()
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-3 border-4 border-gray-900"
                  style={{
                    fontFamily: '"8-BIT WONDER", monospace',
                    fontSize: "11px",
                    imageRendering: "pixelated",
                  }}
                >
                  Back to Stories
                </Button>
                <Button
                  onClick={() => {
                    // playClickSound() kaldırıldı
                    closeAbout()
                  }}
                  className="bg-red-700 hover:bg-red-600 text-white font-bold px-6 py-3 border-4 border-red-900"
                  style={{
                    fontFamily: '"8-BIT WONDER", monospace',
                    fontSize: "11px",
                    imageRendering: "pixelated",
                  }}
                >
                  Close Book
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    {/* Leaderboard Modal */}
    {showLeaderboard && <LeaderboardModal onClose={closeLeaderboard} isMobile={isMobile} />}
    {/* Save Score Form Modal */}
    {showSaveScoreModal && (
      <SaveScoreFormModal
        onClose={closeSaveScoreModal}
        isMobile={isMobile}
        lastScore={score}
        onSaveSuccess={handleSaveScoreSuccess} // Yeni prop
      />
    )}
    {/* Copyright Footer */}
    <div className="absolute bottom-4 left-0 right-0 text-center">
      <p
        className={`text-white ${isMobile ? "text-xs" : "text-xs"} opacity-70`}
        style={{
          fontFamily: '"8-BIT WONDER", monospace',
          textShadow: "1px 1px 0px #000000",
        }}
      >
        © 2025 EXITS. All rights reserved
      </p>
    </div>
  </div>
)
}
