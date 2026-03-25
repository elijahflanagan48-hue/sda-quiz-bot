import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = randomBytes(16).toString('hex')

  await prisma.user.update({
    where: { id: session.user.id },
    data: { telegramToken: token },
  })

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'eggee_bot_bot'
  const url = 'https://t.me/' + botUsername + '?start=' + token

  return NextResponse.json({ url })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { telegramChatId: null, telegramToken: null },
  })

  return NextResponse.json({ ok: true })
}
