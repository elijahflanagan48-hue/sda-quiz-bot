'use client'

import { useState } from 'react'

export default function TelegramSettings({ currentChatId }: { currentChatId: string }) {
  const [chatId, setChatId] = useState(currentChatId)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch('/api/settings/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramChatId: chatId }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex gap-3 items-center">
      <input
        type="text"
        value={chatId}
        onChange={(e) => setChatId(e.target.value)}
        placeholder="Ваш Telegram Chat ID (например: 123456789)"
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Сохранение...' : saved ? '✅ Сохранено' : 'Сохранить'}
      </button>
    </div>
  )
}
