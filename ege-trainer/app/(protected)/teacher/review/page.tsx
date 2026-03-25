import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ReviewCard from './ReviewCard'

export default async function ReviewPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  if (session.user.role !== 'TEACHER') redirect('/dashboard')

  const submissions = await prisma.taskSubmission.findMany({
    where: { submittedForReview: true, reviewedAt: null },
    include: {
      user: { select: { id: true, name: true, email: true } },
      task: { select: { id: true, taskNumber: true, section: true, taskType: true, content: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const reviewed = await prisma.taskSubmission.findMany({
    where: { submittedForReview: true, reviewedAt: { not: null } },
    include: {
      user: { select: { name: true } },
      task: { select: { taskNumber: true, section: true } },
    },
    orderBy: { reviewedAt: 'desc' },
    take: 20,
  })

  const sectionNames: Record<string, string> = {
    LISTENING: 'Аудирование', READING: 'Чтение',
    GRAMMAR_VOCAB: 'Грамматика', WRITING: 'Письмо', ORAL: 'Устная часть',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Очередь проверки</h1>
        <p className="text-gray-500 mt-1">{submissions.length} работ ожидают проверки</p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          Нет работ, ожидающих проверки
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <ReviewCard key={s.id} submission={s} sectionNames={sectionNames} />
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Проверенные работы</h2>
          <div className="space-y-2">
            {reviewed.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{s.user.name} — Задание {s.task.taskNumber}, {sectionNames[s.task.section]}</span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-green-600">{s.teacherScore} б.</span>
                  <span className="text-gray-400">{new Date(s.reviewedAt!).toLocaleDateString('ru')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
