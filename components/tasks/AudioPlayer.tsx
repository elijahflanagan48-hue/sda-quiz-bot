'use client'

import { useState, useRef, useEffect } from 'react'

interface AudioPlayerProps {
  audioUrl: string
  maxPlays?: number
  preparationTimeSec?: number
}

export default function AudioPlayer({ audioUrl, maxPlays = 2, preparationTimeSec = 30 }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [plays, setPlays] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [prepCountdown, setPrepCountdown] = useState(preparationTimeSec)
  const [prepDone, setPrepDone] = useState(preparationTimeSec === 0)

  useEffect(() => {
    if (prepDone) return
    const timer = setInterval(() => {
      setPrepCountdown((t) => {
        if (t <= 1) {
          clearInterval(timer)
          setPrepDone(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [prepDone])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      if (plays >= maxPlays) return
      audio.play()
    }
  }

  function handleEnded() {
    setIsPlaying(false)
    setPlays((p) => p + 1)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const canPlay = prepDone && plays < maxPlays

  return (
    <div className="bg-gray-900 text-white rounded-xl p-4">
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
      />

      {!prepDone ? (
        <div className="text-center py-2">
          <p className="text-sm text-gray-400 mb-1">Время на подготовку</p>
          <p className="text-3xl font-mono font-bold text-yellow-400">{prepCountdown}с</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={!canPlay}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-full flex items-center justify-center text-lg transition-colors"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <div className="flex-1 bg-gray-700 rounded-full h-2 cursor-pointer" onClick={(e) => {
              if (!audioRef.current || !duration) return
              const rect = e.currentTarget.getBoundingClientRect()
              const ratio = (e.clientX - rect.left) / rect.width
              audioRef.current.currentTime = ratio * duration
            }}>
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>

            <span className="text-xs text-gray-400 w-24 text-right">
              {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} /
              {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Прослушиваний: {plays} / {maxPlays}</span>
            {plays >= maxPlays && <span className="text-red-400">Лимит прослушиваний исчерпан</span>}
          </div>
        </div>
      )}
    </div>
  )
}
