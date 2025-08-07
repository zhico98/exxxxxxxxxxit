"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { addLeaderboardScore } from "@/actions/leaderboard" // Server Action'ı import et

interface SaveScoreFormModalProps {
  onClose: () => void
  isMobile: boolean
  lastScore: number
  onSaveSuccess: () => void; // Başarılı kayıttan sonra çağrılacak callback
}

export default function SaveScoreFormModal({ onClose, isMobile, lastScore, onSaveSuccess }: SaveScoreFormModalProps) {
  const [playerName, setPlayerName] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSaveScore = async () => {
    if (playerName.trim() === "") {
      alert("Player Name cannot be empty!")
      return
    }
    setSaveStatus('saving'); // Kaydediliyor durumuna geç

    try {
      const success = await addLeaderboardScore({ name: playerName, score: lastScore, wallet: walletAddress });
      if (success) {
        setSaveStatus('saved'); // Kaydedildi durumuna geç
        onSaveSuccess(); // Üst bileşene başarılı olduğunu bildir
        setTimeout(() => {
          onClose(); // 1.5 saniye sonra modalı kapat
        }, 1500);
      } else {
        setSaveStatus('error');
        alert('Failed to save score. Please try again.');
      }
    } catch (error) {
      console.error('Error saving score:', error);
      setSaveStatus('error');
      alert('An unexpected error occurred while saving score.');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2">
      <div
        className={`bg-black/90 ${isMobile ? "p-4 mx-2" : "p-8 mx-4"} rounded-lg border-4 border-red-600 ${isMobile ? "w-full max-w-sm" : "max-w-md w-full"} relative`}
      >
        <h2
          className={`${isMobile ? "text-xl" : "text-2xl"} font-bold mb-6 text-red-600 text-center`}
          style={{
            fontFamily: '"8-BIT WONDER", monospace',
            textShadow: "2px 2px 0px #000000",
          }}
        >
          {saveStatus === 'saved' ? 'SCORE SAVED!' : saveStatus === 'error' ? 'SAVE FAILED!' : 'SAVE YOUR SCORE'}
        </h2>
        {saveStatus === 'saved' ? (
          <p
            className="text-green-400 text-center mb-4"
            style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "14px" : "18px" }}
          >
            Your score has been recorded!
          </p>
        ) : saveStatus === 'error' ? (
          <p
            className="text-red-400 text-center mb-4"
            style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "14px" : "18px" }}
          >
            There was an error saving your score.
          </p>
        ) : (
          <p
            className="text-white text-center mb-4"
            style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "14px" : "18px" }}
          >
            Your Last Score: {lastScore}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="playerName"
              className="block text-white mb-2"
              style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "12px" : "14px" }}
            >
              Player Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="enter your name"
              className="w-full p-3 bg-black/60 border-2 border-white text-white placeholder-gray-400 focus:outline-none focus:border-red-600"
              style={{ fontFamily: '"8-BIT WONDER", monospace', imageRendering: "pixelated" }}
              required
              disabled={saveStatus !== 'idle'} // Disable when saving or saved
            />
          </div>
          <div>
            <label
              htmlFor="walletAddress"
              className="block text-white mb-2"
              style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "12px" : "14px" }}
            >
              Wallet Address optional
            </label>
            <input
              type="text"
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x... (optional)"
              className="w-full p-3 bg-black/60 border-2 border-white text-white placeholder-gray-400 focus:outline-none focus:border-red-600"
              style={{ fontFamily: '"8-BIT WONDER", monospace', imageRendering: "pixelated" }}
              disabled={saveStatus !== 'idle'} // Disable when saving or saved
            />
            <p
              className="text-gray-400 text-xs mt-1"
              style={{ fontFamily: '"8-BIT WONDER", monospace' }}
            >
              Add wallet to receive rewards
            </p>
          </div>
          <div className="flex gap-4 mt-6">
            <Button
              onClick={handleSaveScore}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 border-2 border-gray-900"
              style={{ fontFamily: '"8-BIT WONDER", monospace', imageRendering: "pixelated" }}
              disabled={playerName.trim() === "" || saveStatus !== 'idle'} // Disable when saving or saved
            >
              {saveStatus === 'saving' ? 'SAVING...' : 'save score'}
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 border-2 border-red-900"
              style={{ fontFamily: '"8-BIT WONDER", monospace', imageRendering: "pixelated" }}
              disabled={saveStatus === 'saving'} // Disable when saving
            >
              cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
