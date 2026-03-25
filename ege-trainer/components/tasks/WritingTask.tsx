'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface WritingTaskProps {
  task: {
    id: string
    content: string
    taskNumber: number
  }
  onSubmit: (answer: string, imageUrl?: string) => void
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

  const [mode, setMode] = useState<'type' | 'photo'>('type')
  const [text, setText] = useState(initialValue || '')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const isUnder = wordCount < content.wordLimitMin
  const isOver = wordCount > content.wordLimitMax
  const isOk = !isUnder && !isOver && wordCount > 0

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setImageUrl(data.url)
    setUploading(false)
  }

  function handleSubmit() {
    if (mode === 'photo' && imageUrl) {
      onSubmit('[Фото]', imageUrl)
    } else {
      onSubmit(text)
    }
  }

  const canSubmit = mode === 'photo' ? !!imageUrl : wordCount > 0

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-700 mb-2">Задание-стимул:</h3>
        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{content.stimulus}</p>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700">
        {content.instructions}
      </div>

      {!readonly && (
        <div className="flex gap-2">
          <button
            onClick={() => setMode('type')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'type' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Печатать
          </button>
          <button
            onClick={() => setMode('photo')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'photo' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Фото рукописного текста
          </button>
        </div>
      )}

      {mode === 'type' ? (
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
      ) : (
        <div className="space-y-3">
          {imageUrl ? (
            <div className="space-y-2">
              <Image src={imageUrl} alt="Ваш ответ" width={600} height={400} className="rounded-xl border border-gray-200 max-w-full" />
              {!readonly && (
                <button
                  onClick={() => { setImageUrl(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Удалить фото
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={() => !readonly && fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="text-4xl mb-2">📷</div>
              <div className="text-gray-500 text-sm">
                {uploading ? 'Загрузка...' : 'Нажмите, чтобы загрузить фото рукописного текста'}
              </div>
              <div className="text-gray-400 text-xs mt-1">JPG, PNG, WEBP до 10 МБ</div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {!readonly && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Сохранить ответ
        </button>
      )}
    </div>
  )
}
