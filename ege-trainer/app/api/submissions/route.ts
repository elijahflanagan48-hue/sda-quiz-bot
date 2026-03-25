import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, answer, mode, attemptId, imageUrl } = await req.json()
  const userId = session.user.id

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  let isCorrect: boolean | null = null
  let autoScore: number | null = null

  const autoCheckTypes = [
    'MATCHING', 'MULTIPLE_CHOICE', 'SHORT_ANSWER', 'HEADING_MATCHING',
    'TRUE_NOT_STATED_FALSE', 'MULTIPLE_CHOICE_CLOZE', 'GRAMMAR_TRANSFORMATION',
    'WORD_FORMATION', 'LEXICAL_CLOZE',
  ]

  if (task.correctAnswer && autoCheckTypes.includes(task.taskType)) {
    try {
      const correct = JSON.parse(task.correctAnswer)
      const userAnswer = JSON.parse(answer)

      if (Array.isArray(correct) && Array.isArray(userAnswer)) {
        const correctCount = correct.filter((v, i) =>
          userAnswer[i]?.trim().toUpperCase() === v?.toString().toUpperCase()
        ).length
        autoScore = correctCount
        isCorrect = correctCount === correct.length
      } else if (typeof correct === 'object' && typeof userAnswer === 'object') {
        const keys = Object.keys(correct)
        const correctCount = keys.filter((k) =>
          userAnswer[k]?.trim().toUpperCase() === correct[k]?.toString().toUpperCase()
        ).length
        autoScore = correctCount
        isCorrect = correctCount === keys.length
      } else {
        isCorrect = answer.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase()
        autoScore = isCorrect ? 1 : 0
      }
    } catch {
      isCorrect = null
    }
  }

  const submission = await prisma.taskSubmission.create({
    data: {
      userId,
      taskId,
      attemptId: attemptId || null,
      mode,
      answer,
      imageUrl: imageUrl || null,
      isCorrect,
      autoScore,
    },
  })

  return NextResponse.json({ id: submission.id, isCorrect, autoScore }, { status: 201 })
}
