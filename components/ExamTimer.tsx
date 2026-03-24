'use client'

import { useState, useEffect, useCallback } from 'react'

interface ExamTimerProps {
  totalSeconds: number
  warningThresholds?: number[]
  onExpire?: () => void
}

export default function ExamTimer({ totalSeconds, warningThresholds = [1800, 600], onExpire }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const [warned, setWarned] = useState<Set<number>>(new Set())

  const tick = useCallback(() => {
    setRemaining((t) => {
      if (t <= 1) {
        onExpire?.()
        return 0
      }
      return t - 1
    })
  }, [onExpire])

  useEffect(() => {
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [tick])

  useEffect(() => {
    for (const threshold of warningThresholds) {
      if (remaining <= threshold && !warned.has(threshold)) {
        setWarned((w) => new Set(w).add(threshold))
        // Could trigger a toast/notification here
      }
    }
  }, [remaining, warningThresholds, warned])

  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60

  const isRed = remaining <= 600
  const isYellow = remaining <= 1800 && remaining > 600

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-2xl font-bold tabular-nums ${
      isRed ? 'bg-red-100 text-red-700' : isYellow ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
    }`}>
      <span>{String(hours).padStart(2, '0')}</span>
      <span>:</span>
      <span>{String(minutes).padStart(2, '0')}</span>
      <span>:</span>
      <span>{String(seconds).padStart(2, '0')}</span>
    </div>
  )
}
