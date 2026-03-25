'use client'

import { useState } from 'react'
import TaskRenderer from '@/components/tasks/TaskRenderer'
import Link from 'next/link'

interface Task {
  id: string
  section: string
  taskNumber: number
  taskType: string
  content: string
  correctAnswer?: string | null
  explanation?: string | null
  audioUrl?: string | null
  imageUrl?: string | null
}

interface Result {
  isCorrect: boolean | null
  autoScore: number | null
  submissionId: string
}

export default function PracticeSession({
  tasks,
  section,
  userId,
}: {
  tasks: Task[]
  section: string
  userId: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<(Result | null)[]>(Array(tasks.length).fill(null))
  const [showAnswer, setShowAnswer] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [pendingReview, setPendingReview] = useState<string[]>([])
  const [sentForReview, setSentForReview] = useState<Set<string>>(new Set())

  const currentTask = tasks[currentIndex]
  const isWritingOrOral = currentTask?.section === 'WRITING' || currentTask?.section === 'ORAL'

  async function handleSubmit(answer: string, imageUrl?: string) {
    if (submitting) return
    setSubmitting(true)

    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: currentTask.id,
        answer,
        mode: 'PRACTICE',
        imageUrl: imageUrl || null,
      }),
    })

    const data = await res.json()
    const newResults = [...results]
    newResults[currentIndex] = {
      isCorrect: data.isCorrect,
      autoScore: data.autoScore,
      submissionId: data.id,
    }
    setResults(newResults)

    if (isWritingOrOral && data.id) {
      setPendingReview((prev) => [...prev, data.id])
    }

    setSubmitting(false)
    setShowAnswer(true)
  }

  async function sendForReview(submissionId: string) {
    await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    })
    setSentForReview((prev) => new Set(prev).add(submissionId))
  }

  function goNext() {
    if (currentIndex < tasks.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    } else {
      setSessionComplete(true)
    }
  }

  if (sessionComplete) {
    const answered = results.filter((r) => r !== null)
    const autoGraded = answered.filter((r) => r?.isCorrect !== null)
    const correct = autoGraded.filter((r) => r?.isCorrect).length
    const total = autoGraded.length
    const pct = total > 0 ? Math.round((correct / total) * 100) : null

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">{pct !== null && pct >= 70 ? '🎉' : '📝'}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Тренировка завершена!</h2>
          {total > 0 && (
            <p className={`text-lg font-medium ${pct! >= 70 ? 'text-green-600' : 'text-red-600'}`}>
              {correct} / {total} верных ответов ({pct}%)
            </p>
          )}
          {pendingReview.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 font-medium mb-3">Отправить письменные/устные работы на проверку учителю?</p>
              <div className="space-y-2">
                {pendingReview.map((id, i) => (
                  <div key={id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Работа {i + 1}</span>
                    {sentForReview.has(id) ? (
                      <span className="text-green-600 text-sm">✅ Отправлено</span>
                    ) : (
                      <button
                        onClick={() => sendForReview(id)}
                        className="text-sm bg-amber-600 text-white px-4 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Отправить на проверку
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <Link href="/practice" className="flex-1 text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Ещё тренировка
          </Link>
          <Link href="/profile" className="flex-1 text-center bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
            Мой прогресс
          </Link>
        </div>
      </div>
    )
  }

  const result = results[currentIndex]

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/practice" className="text-blue-600 hover:underline text-sm">← Разделы</Link>
        <div className="flex gap-1">
          {tasks.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i < currentIndex
                  ? results[i]?.isCorrect
                    ? 'bg-green-500'
                    : results[i]?.isCorrect === false
                    ? 'bg-red-400'
                    : 'bg-blue-400'
                  : i === currentIndex
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">{currentIndex + 1} / {tasks.length}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="mb-4 text-xs text-gray-400 uppercase tracking-wide font-medium">
          Задание {currentTask.taskNumber}
        </div>

        <TaskRenderer
          task={currentTask}
          mode="practice"
          onSubmit={handleSubmit}
          showAnswer={showAnswer}
          readonly={!!result}
        />

        {submitting && (
          <div className="mt-4 text-center text-blue-600 text-sm">Сохранение...</div>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            {result.isCorrect !== null && (
              <div className={`rounded-xl p-3 text-sm font-medium ${
                result.isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {result.isCorrect ? '✅ Правильно!' : `❌ Неправильно. Баллов: ${result.autoScore ?? 0}`}
              </div>
            )}
            {isWritingOrOral && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                Работа сохранена. Вы можете отправить её на проверку учителю после завершения тренировки.
              </div>
            )}
            <button
              onClick={goNext}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {currentIndex < tasks.length - 1 ? 'Следующее задание →' : 'Завершить тренировку'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
