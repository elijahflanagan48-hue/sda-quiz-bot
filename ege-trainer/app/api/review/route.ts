import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram'

// Student submits work for teacher review
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { submissionId } = await req.json()

  const submission = await prisma.taskSubmission.findUnique({
    where: { id: submissionId },
    include: { user: true, task: true },
  })

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (submission.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.taskSubmission.update({
    where: { id: submissionId },
    data: { submittedForReview: true },
  })

  // Notify all teachers via Telegram
  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER', telegramChatId: { not: null } },
    select: { telegramChatId: true },
  })

  const taskName = `задание ${submission.task.taskNumber} (${submission.task.section})`
  const msg = `📬 Ученик <b>${submission.user.name}</b> отправил работу на проверку: ${taskName}`

  await Promise.all(
    teachers.map((t) => sendTelegramMessage(t.telegramChatId!, msg))
  )

  return NextResponse.json({ ok: true })
}

// Teacher grades a submission
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { submissionId, teacherScore, teacherFeedback, criteriaScores } = await req.json()

  const submission = await prisma.taskSubmission.findUnique({
    where: { id: submissionId },
    include: { user: true, task: true },
  })

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.taskSubmission.update({
    where: { id: submissionId },
    data: {
      teacherScore,
      teacherFeedback,
      criteriaScores: criteriaScores ? JSON.stringify(criteriaScores) : null,
      reviewedAt: new Date(),
    },
  })

  // Notify student
  if (submission.user.telegramChatId) {
    const taskName = `задание ${submission.task.taskNumber}`
    const msg = `✅ Учитель проверил вашу работу: ${taskName}\nОценка: <b>${teacherScore}</b>${teacherFeedback ? '\nКомментарий: ' + teacherFeedback : ''}`
    await sendTelegramMessage(submission.user.telegramChatId, msg)
  }

  return NextResponse.json({ ok: true })
}
