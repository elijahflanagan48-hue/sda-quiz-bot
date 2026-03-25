import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TelegramLinkButton from './TelegramLinkButton'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { telegramChatId: true, name: true },
  })

  const isLinked = !!user?.telegramChatId

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">✈️</div>
          <div>
            <h2 className="font-semibold text-gray-800">Telegram-уведомления</h2>
            <p className="text-sm text-gray-500 mt-1">
              Получайте уведомления, когда учитель проверит вашу работу.
            </p>
          </div>
        </div>

        {isLinked ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <span className="text-green-600 text-lg">✅</span>
              <span className="text-green-700 text-sm font-medium">Telegram привязан</span>
            </div>
            <TelegramLinkButton linked={true} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <span className="text-gray-400 text-lg">○</span>
              <span className="text-gray-500 text-sm">Telegram не привязан</span>
            </div>
            <p className="text-sm text-gray-500">
              Нажмите кнопку ниже — откроется наш бот в Telegram. Просто нажмите <strong>Старт (Start)</strong>, и аккаунт привяжется автоматически.
            </p>
            <TelegramLinkButton linked={false} />
          </div>
        )}
      </div>
    </div>
  )
}
