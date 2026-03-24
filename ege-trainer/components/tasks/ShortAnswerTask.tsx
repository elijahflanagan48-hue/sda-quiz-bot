'use client'

import { useState } from 'react'

interface ShortAnswerTaskProps {
  task: {
    id: string
    content: string
    correctAnswer?: string
  }
  onSubmit: (answer: string) => void
  showAnswer?: boolean
  readonly?: boolean
}

export default function ShortAnswerTask({ task, onSubmit, showAnswer, readonly }: ShortAnswerTaskProps) {
  const content = JSON.parse(task.content) as {
    text: string
    blanks: Array<{ number: number; position: string }>
    instructions?: string
  }
  const correctAnswer = task.correctAnswer ? JSON.parse(task.correctAnswer) as Record<number, string> : null

  const [answers, setAnswers] = useState<Record<number, string>>({})

  function handleSubmit() {
    onSubmit(JSON.stringify(answers))
  }

  return (
    <div className="space-y-6">
      {content.instructions && (
        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg text-sm">{content.instructions}</p>
      )}

      <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border">
        {content.text}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Заполните пропуски:</h3>
        {content.blanks.map((blank) => {
          const correct = correctAnswer?.[blank.number]
          const userAnswer = answers[blank.number] || ''
          const isCorrect = correct && userAnswer.trim().toLowerCase() === correct.toLowerCase()

          return (
            <div key={blank.number} className="flex items-center gap-3">
              <span className="font-bold text-blue-700 w-6">{blank.number}.</span>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => !readonly && setAnswers((prev) => ({ ...prev, [blank.number]: e.target.value }))}
                disabled={readonly}
                placeholder="Введите ответ"
                className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 ${
                  showAnswer && correct
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              {showAnswer && correct && (
                <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '✓' : `→ ${correct}`}
                </span>
              )}
            </div>
          )
        })}
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
