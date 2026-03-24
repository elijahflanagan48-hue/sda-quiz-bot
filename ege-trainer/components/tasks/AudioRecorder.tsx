'use client'

import { useState, useRef, useEffect } from 'react'

interface AudioRecorderProps {
  preparationTimeSec: number
  maxRecordingTimeSec: number
  onRecordingComplete: (blob: Blob) => void
}

type Phase = 'prep' | 'ready' | 'recording' | 'done'

export default function AudioRecorder({ preparationTimeSec, maxRecordingTimeSec, onRecordingComplete }: AudioRecorderProps) {
  const [phase, setPhase] = useState<Phase>('prep')
  const [countdown, setCountdown] = useState(preparationTimeSec)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (phase !== 'prep') return
    const timer = setInterval(() => {
      setCountdown((t) => {
        if (t <= 1) {
          clearInterval(timer)
          setPhase('ready')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase])

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    mediaRecorderRef.current = mr
    chunksRef.current = []

    mr.ondataavailable = (e) => chunksRef.current.push(e.data)
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      onRecordingComplete(blob)
      stream.getTracks().forEach((t) => t.stop())
      setPhase('done')
    }

    mr.start()
    setPhase('recording')
    setRecordingTime(0)

    timerRef.current = setInterval(() => {
      setRecordingTime((t) => {
        if (t + 1 >= maxRecordingTimeSec) {
          stopRecording()
          return maxRecordingTimeSec
        }
        return t + 1
      })
    }, 1000)
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
  }

  const progress = (recordingTime / maxRecordingTimeSec) * 100

  return (
    <div className="bg-gray-900 text-white rounded-xl p-4 space-y-3">
      {phase === 'prep' && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-400 mb-1">Время на подготовку</p>
          <p className="text-4xl font-mono font-bold text-yellow-400">{countdown}с</p>
        </div>
      )}

      {phase === 'ready' && (
        <div className="text-center space-y-3">
          <p className="text-gray-300">Время подготовки истекло. Нажмите для начала записи.</p>
          <button
            onClick={startRecording}
            className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            🎙 Начать запись
          </button>
        </div>
      )}

      {phase === 'recording' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-medium">Запись...</span>
            <span className="ml-auto font-mono text-lg">
              {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')} / {Math.floor(maxRecordingTimeSec / 60)}:{String(maxRecordingTimeSec % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="bg-gray-700 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <button
            onClick={stopRecording}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
          >
            Остановить запись
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div className="text-center py-2">
          <p className="text-green-400 font-semibold">✓ Запись сохранена</p>
        </div>
      )}
    </div>
  )
}
