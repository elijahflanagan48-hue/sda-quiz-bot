'use client'

import { useState } from 'react'

export default function TelegramLinkButton({ linked }: { linked: boolean }) {
  const [loading, setLoading] = useState(false)
  const [unlinking, setUnlinking] = useState(false)

  async function handleLink() {
    setLoading(true)
    const res = await fetch('/api/telegram/link', { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (data.url) {
      window.open(data.url, '_blank')
    }
  }

  async function handleUnlink() {
    setUnlinking(true)
    await fetch('/api/telegram/link', { method: 'DELETE' })
    setUnlinking(false)
    window.location.reload()
  }

  if (linked) {
    return (
      <button
        onClick={handleUnlink}
        disabled={unlinking}
        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
      >
        {unlinking ? 'Отвязываем...' : 'Отвязать Telegram'}
      </button>
    )
  }

  return (
    <button
      onClick={handleLink}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.02 9.52c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.883.701z"/>
      </svg>
      {loading ? 'Создаём ссылку...' : 'Привязать Telegram'}
    </button>
  )
}
