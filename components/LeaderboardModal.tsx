"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getLeaderboardScores } from "@/actions/leaderboard" // Server Action'ı import et

interface LeaderboardModalProps {
  onClose: () => void
  isMobile: boolean
}

interface ScoreEntry {
  name: string;
  score: number;
  wallet?: string;
  timestamp: number;
}

export default function LeaderboardModal({ onClose, isMobile }: LeaderboardModalProps) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedScores = await getLeaderboardScores();
      setScores(fetchedScores);
    } catch (err) {
      console.error("Failed to fetch leaderboard scores:", err);
      setError("Failed to load leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2">
      <div
        className={`bg-black/90 ${isMobile ? "p-4 mx-2" : "p-8 mx-4"} rounded-lg border-4 border-red-600 ${isMobile ? "w-full max-w-sm" : "max-w-2xl w-full"} relative`}
      >
        <div className="bg-black/80 p-6 rounded-lg">
          <h2
            className={`${isMobile ? "text-xl" : "text-3xl"} font-bold mb-6 text-red-600 text-center`}
            style={{
              fontFamily: '"8-BIT WONDER", monospace',
              textShadow: "2px 2px 0px #000000",
            }}
          >
            LEADERBOARD
          </h2>

          {loading ? (
            <div className="text-center text-white mb-6" style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "14px" : "18px" }}>
              Loading scores...
            </div>
          ) : error ? (
            <div className="text-center text-red-400 mb-6" style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "14px" : "18px" }}>
              {error}
            </div>
          ) : scores.length > 0 ? (
            <div className={`overflow-y-auto ${isMobile ? "max-h-[300px]" : "max-h-[400px]"} mb-6`}>
              <table className="w-full text-white text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-red-600">
                    <th className={`py-2 ${isMobile ? "text-xs" : "text-sm"}`} style={{ fontFamily: '"8-BIT WONDER", monospace' }}>RANK</th>
                    <th className={`py-2 ${isMobile ? "text-xs" : "text-sm"}`} style={{ fontFamily: '"8-BIT WONDER", monospace' }}>NAME</th>
                    <th className={`py-2 text-right ${isMobile ? "text-xs" : "text-sm"}`} style={{ fontFamily: '"8-BIT WONDER", monospace' }}>SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((entry, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white/5" : ""}>
                      <td className={`py-2 ${isMobile ? "text-xs" : "text-sm"}`} style={{ fontFamily: '"8-BIT WONDER", monospace' }}>{index + 1}.</td>
                      <td className={`py-2 ${isMobile ? "text-xs" : "text-sm"}`} style={{ fontFamily: '"8-BIT WONDER", monospace' }}>{entry.name}</td>
                      <td className={`py-2 text-right ${isMobile ? "text-xs" : "text-sm"}`} style={{ fontFamily: '"8-BIT WONDER", monospace' }}>{entry.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-white mb-6" style={{ fontFamily: '"8-BIT WONDER", monospace', fontSize: isMobile ? "14px" : "18px" }}>
              no scores yet
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={fetchScores} // Refresh butonu skorları yeniden çekecek
              className={`bg-red-600 hover:bg-red-700 text-white font-bold ${isMobile ? "px-4 py-2" : "px-6 py-3"}`}
              style={{ fontFamily: '"8-BIT WONDER", monospace' }}
              disabled={loading}
            >
              {loading ? 'REFRESHING...' : 'refresh leaderboard'}
            </Button>
            <Button
              onClick={onClose}
              className={`bg-gray-700 hover:bg-gray-600 text-white font-bold ${isMobile ? "px-4 py-2" : "px-6 py-3"} ml-2`}
              style={{ fontFamily: '"8-BIT WONDER", monospace' }}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
