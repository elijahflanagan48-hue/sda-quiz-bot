import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TelegramSettings from './TelegramSettings'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { telegramChatId: true },
  })

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || ''

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-700 mb-1">Telegram-уведомления</h2>
        <p className="text-sm text-gray-500 mb-4">
          Получайте уведомления о проверке работ в Telegram.
          {botUsername && (
            <> Сначала <a href={'https://t.me/' + botUsername} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              напишите боту @{botUsername}
            </a>, затем введите ваш Chat ID.</>
          )}
        </p>
        <TelegramSettings currentChatId={user?.telegramChatId || ''} />
      </div>
    </div>
  )
}
