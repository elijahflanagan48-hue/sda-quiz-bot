'use client'

import { useState } from 'react'
import Image from 'next/image'

type Submission = {
  id: string
  answer: string
  imageUrl: string | null
  audioUrl: string | null
  createdAt: Date
  user: { id: string; name: string; email: string }
  task: { id: string; taskNumber: number; section: string; taskType: string; content: string }
}

export default function ReviewCard({
  submission,
  sectionNames,
}: {
  submission: Submission
  sectionNames: Record<string, string>
}) {
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  let taskContent: Record<string, string> = {}
  try { taskContent = JSON.parse(submission.task.content) } catch {}

  let answerText = submission.answer
  try {
    const parsed = JSON.parse(submission.answer)
    if (typeof parsed === 'string') answerText = parsed
    else answerText = JSON.stringify(parsed, null, 2)
  } catch {}

  async function handleGrade() {
    if (!score) return
    setSaving(true)
    await fetch('/api/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId: submission.id,
        teacherScore: parseInt(score),
        teacherFeedback: feedback || null,
      }),
    })
    setSaving(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
        ✅ Оценка выставлена для {submission.user.name}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-semibold text-gray-800">{submission.user.name}</span>
          <span className="text-gray-400 text-sm ml-2">{submission.user.email}</span>
          <div className="text-sm text-gray-500 mt-0.5">
            Задание {submission.task.taskNumber} · {sectionNames[submission.task.section]}
          </div>
        </div>
        <span className="text-xs text-gray-400">{new Date(submission.createdAt).toLocaleDateString('ru')}</span>
      </div>

      {taskContent.prompt && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
          <div className="font-medium text-gray-500 mb-1 text-xs uppercase tracking-wide">Задание</div>
          {taskContent.prompt}
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-3">
        <div className="font-medium text-gray-500 mb-1 text-xs uppercase tracking-wide">Ответ ученика</div>
        {submission.imageUrl ? (
          <div className="space-y-2">
            <Image src={submission.imageUrl} alt="Ответ" width={600} height={400} className="rounded-lg max-w-full" />
            {answerText && answerText !== 'null' && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{answerText}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{answerText}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 w-20">Оценка:</label>
          <input
            type="number"
            min="0"
            max="20"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0–20"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Комментарий учителя:</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Напишите комментарий для ученика..."
          />
        </div>
        <button
          onClick={handleGrade}
          disabled={saving || !score}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Выставить оценку'}
        </button>
      </div>
    </div>
  )
}
