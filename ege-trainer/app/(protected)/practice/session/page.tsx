import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PracticeSession from './PracticeSession'

const TASKS_PER_SESSION = 5

export default async function PracticeSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const { section } = await searchParams
  if (!section) redirect('/practice')

  const tasks = await prisma.task.findMany({
    where: { section: section as never, isActive: true },
    select: {
      id: true,
      section: true,
      taskNumber: true,
      taskType: true,
      content: true,
      correctAnswer: true,
      explanation: true,
      audioUrl: true,
      imageUrl: true,
    },
    orderBy: { taskNumber: 'asc' },
    take: TASKS_PER_SESSION,
  })

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">📭</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Нет заданий в этом разделе</h2>
        <p className="text-gray-500">Учитель ещё не добавил задания для этого раздела.</p>
        <a href="/practice" className="mt-6 inline-block text-blue-600 hover:underline">← Назад к разделам</a>
      </div>
    )
  }

  return (
    <PracticeSession
      tasks={tasks}
      section={section}
      userId={session.user.id}
    />
  )
}
