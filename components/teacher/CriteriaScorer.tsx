'use client'

import { useState } from 'react'

interface Criterion {
  id: string
  nameRu: string
  maxPoints: number
}

interface CriteriaScorerProps {
  criteria: Criterion[]
  onChange: (scores: Record<string, number>) => void
  initialScores?: Record<string, number>
}

export default function CriteriaScorer({ criteria, onChange, initialScores = {} }: CriteriaScorerProps) {
  const [scores, setScores] = useState<Record<string, number>>(initialScores)

  function handleChange(criterionId: string, value: number) {
    const next = { ...scores, [criterionId]: value }
    setScores(next)
    onChange(next)
  }

  const total = criteria.reduce((sum, c) => sum + (scores[c.id] || 0), 0)
  const maxTotal = criteria.reduce((sum, c) => sum + c.maxPoints, 0)

  return (
    <div className="space-y-3">
      {criteria.map((criterion) => (
        <div key={criterion.id} className="flex items-center gap-3">
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">{criterion.id}: {criterion.nameRu}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: criterion.maxPoints + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleChange(criterion.id, i)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                  scores[criterion.id] === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 w-16 text-right">макс: {criterion.maxPoints}</span>
        </div>
      ))}

      <div className="border-t pt-3 flex items-center justify-between">
        <span className="font-semibold text-gray-700">Итого:</span>
        <span className={`text-xl font-bold ${total > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
          {total} / {maxTotal}
        </span>
      </div>
    </div>
  )
}
