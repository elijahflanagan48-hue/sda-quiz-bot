'use client'

import { useState } from 'react'

interface MultipleChoiceTaskProps {
  task: {
    id: string
    content: string
    correctAnswer?: string
  }
  onSubmit: (answer: string) => void
  showAnswer?: boolean
  readonly?: boolean
}

export default function MultipleChoiceTask({ task, onSubmit, showAnswer, readonly }: MultipleChoiceTaskProps) {
  const content = JSON.parse(task.content) as {
    questions: Array<{
      number: number
      question: string
      options: { A: string; B: string; C: string }
    }>
    instructions?: string
  }
  const correctAnswer = task.correctAnswer ? JSON.parse(task.correctAnswer) as Record<number, string> : null

  const [answers, setAnswers] = useState<Record<number, string>>({})

  function handleChange(questionNumber: number, value: string) {
    if (readonly) return
    setAnswers((prev) => ({ ...prev, [questionNumber]: value }))
  }

  function handleSubmit() {
    onSubmit(JSON.stringify(answers))
  }

  return (
    <div className="space-y-6">
      {content.instructions && (
        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg text-sm">{content.instructions}</p>
      )}

      <div className="space-y-5">
        {content.questions.map((q) => {
          const isCorrect = correctAnswer && answers[q.number] === correctAnswer[q.number]
          return (
            <div key={q.number} className="border border-gray-200 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-3">
                <span className="text-blue-700 font-bold mr-2">{q.number}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {(['A', 'B', 'C'] as const).map((letter) => (
                  <label
                    key={letter}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      showAnswer && correctAnswer
                        ? letter === correctAnswer[q.number]
                          ? 'bg-green-50 border border-green-300'
                          : answers[q.number] === letter && letter !== correctAnswer[q.number]
                          ? 'bg-red-50 border border-red-300'
                          : 'hover:bg-gray-50'
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q${q.number}`}
                      value={letter}
                      checked={answers[q.number] === letter}
                      onChange={() => handleChange(q.number, letter)}
                      disabled={readonly}
                      className="text-blue-600"
                    />
                    <span className="font-medium text-gray-600">{letter}.</span>
                    <span className="text-gray-700">{q.options[letter]}</span>
                  </label>
                ))}
              </div>
              {showAnswer && correctAnswer && answers[q.number] && (
                <p className={`text-sm mt-2 font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '✓ Верно' : `✗ Правильный ответ: ${correctAnswer[q.number]}`}
                </p>
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
