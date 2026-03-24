'use client'

import { useState } from 'react'

interface WritingTaskProps {
  task: {
    id: string
    content: string
    taskNumber: number
  }
  onSubmit: (answer: string) => void
  readonly?: boolean
  initialValue?: string
}

export default function WritingTask({ task, onSubmit, readonly, initialValue }: WritingTaskProps) {
  const content = JSON.parse(task.content) as {
    stimulus: string
    instructions: string
    wordLimitMin: number
    wordLimitMax: number
  }

  const [text, setText] = useState(initialValue || '')

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const isUnder = wordCount < content.wordLimitMin
  const isOver = wordCount > content.wordLimitMax
  const isOk = !isUnder && !isOver && wordCount > 0

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-700 mb-2">Задание-стимул:</h3>
        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{content.stimulus}</p>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700">
        {content.instructions}
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => !readonly && setText(e.target.value)}
          disabled={readonly}
          rows={12}
          placeholder="Введите ваш ответ здесь..."
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed disabled:bg-gray-50"
        />
        <div className={`absolute bottom-3 right-3 text-sm font-medium px-2 py-1 rounded ${
          isOk ? 'bg-green-100 text-green-700' : isOver ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {wordCount} / {content.wordLimitMin}–{content.wordLimitMax} слов
        </div>
      </div>

      {!readonly && (
        <button
          onClick={() => onSubmit(text)}
          disabled={wordCount === 0}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Отправить на проверку
        </button>
      )}
    </div>
  )
}
