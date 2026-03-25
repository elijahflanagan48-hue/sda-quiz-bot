import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const message = body?.message
  if (!message) return NextResponse.json({ ok: true })

  const chatId = String(message.chat.id)
  const text: string = message.text || ''
  const firstName = message.from?.first_name || ''

  // Handle /start <token>
  if (text.startsWith('/start')) {
    const parts = text.split(' ')
    const token = parts[1]?.trim()

    if (!token) {
      await sendTelegramMessage(chatId,
        `Привет, ${firstName}! 👋\n\nЭтот бот отправляет уведомления от тренажёра ЕГЭ.\n\nЧтобы привязать аккаунт, перейдите в Настройки приложения и нажмите «Привязать Telegram».`
      )
      return NextResponse.json({ ok: true })
    }

    // Find user by token
    const user = await prisma.user.findUnique({
      where: { telegramToken: token },
    })

    if (!user) {
      await sendTelegramMessage(chatId,
        '❌ Ссылка недействительна или устарела. Сгенерируйте новую в настройках приложения.'
      )
      return NextResponse.json({ ok: true })
    }

    // Save chat ID and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: chatId, telegramToken: null },
    })

    await sendTelegramMessage(chatId,
      `✅ Аккаунт привязан! Теперь вы будете получать уведомления здесь, ${user.name}.`
    )

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
