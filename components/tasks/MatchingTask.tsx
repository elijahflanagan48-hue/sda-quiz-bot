'use client'

import { useState, useEffect } from 'react'

interface MatchingTaskProps {
  task: {
    id: string
    content: string
    correctAnswer?: string
  }
  onSubmit: (answer: string) => void
  showAnswer?: boolean
  readonly?: boolean
}

export default function MatchingTask({ task, onSubmit, showAnswer, readonly }: MatchingTaskProps) {
  const content = JSON.parse(task.content) as {
    speakers: string[]
    statements: string[]
    instructions?: string
  }
  const correctAnswer = task.correctAnswer ? JSON.parse(task.correctAnswer) as string[] : null
  const letters = 'ABCDEFG'.split('').slice(0, content.statements.length)

  const [answers, setAnswers] = useState<string[]>(new Array(content.speakers.length).fill(''))

  function handleChange(speakerIdx: number, value: string) {
    if (readonly) return
    const next = [...answers]
    next[speakerIdx] = value
    setAnswers(next)
  }

  function handleSubmit() {
    onSubmit(JSON.stringify(answers))
  }

  return (
    <div className="space-y-6">
      {content.instructions && (
        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg text-sm">{content.instructions}</p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Высказывания</h3>
          <div className="space-y-2">
            {content.speakers.map((speaker, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="font-bold text-blue-700 w-8">Г{idx + 1}</span>
                <select
                  value={answers[idx]}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  disabled={readonly}
                  className={`flex-1 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    showAnswer && correctAnswer
                      ? answers[idx] === correctAnswer[idx]
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">— выберите —</option>
                  {letters.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                {showAnswer && correctAnswer && (
                  <span className={`text-sm font-medium ${answers[idx] === correctAnswer[idx] ? 'text-green-600' : 'text-red-600'}`}>
                    {answers[idx] === correctAnswer[idx] ? '✓' : `→ ${correctAnswer[idx]}`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Утверждения</h3>
          <div className="space-y-2">
            {content.statements.map((stmt, idx) => (
              <div key={idx} className="flex gap-2 text-sm">
                <span className="font-bold text-gray-500 w-6">{letters[idx]}.</span>
                <span className="text-gray-700">{stmt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!readonly && (
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Проверить
        </button>
      )}
    </div>
  )
}
