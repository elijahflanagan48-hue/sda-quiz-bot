import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function TeacherPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  if (session.user.role !== 'TEACHER') redirect('/dashboard')

  const [studentCount, pendingReviewCount, recentSubmissions] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.taskSubmission.count({
      where: { submittedForReview: true, reviewedAt: null },
    }),
    prisma.taskSubmission.findMany({
      where: { submittedForReview: true, reviewedAt: null },
      include: { user: { select: { name: true } }, task: { select: { taskNumber: true, section: true, taskType: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const sectionNames: Record<string, string> = {
    LISTENING: 'Аудирование', READING: 'Чтение',
    GRAMMAR_VOCAB: 'Грамматика', WRITING: 'Письмо', ORAL: 'Устная часть',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель учителя</h1>
        <p className="text-gray-500 mt-1">Привет, {session.user.name}!</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-bold text-blue-600">{studentCount}</div>
          <div className="text-sm text-gray-500 mt-1">Учеников</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-bold text-amber-600">{pendingReviewCount}</div>
          <div className="text-sm text-gray-500 mt-1">Ожидают проверки</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/teacher/review" className="bg-amber-50 border border-amber-200 rounded-xl p-5 hover:bg-amber-100 transition-colors block">
          <div className="text-2xl mb-2">📋</div>
          <div className="font-semibold text-gray-800">Очередь проверки</div>
          <div className="text-sm text-gray-500 mt-1">{pendingReviewCount} работ ожидают</div>
        </Link>
        <Link href="/teacher/students" className="bg-blue-50 border border-blue-200 rounded-xl p-5 hover:bg-blue-100 transition-colors block">
          <div className="text-2xl mb-2">👥</div>
          <div className="font-semibold text-gray-800">Ученики</div>
          <div className="text-sm text-gray-500 mt-1">Статистика и прогресс</div>
        </Link>
      </div>

      {recentSubmissions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Последние работы на проверке</h2>
          <div className="space-y-3">
            {recentSubmissions.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800">{s.user.name}</span>
                  <span className="text-gray-400 mx-2">—</span>
                  <span className="text-gray-600 text-sm">
                    Задание {s.task.taskNumber}, {sectionNames[s.task.section]}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('ru')}</div>
              </div>
            ))}
          </div>
          <Link href="/teacher/review" className="mt-4 block text-center text-sm text-blue-600 hover:underline">
            Перейти к проверке →
          </Link>
        </div>
      )}
    </div>
  )
}
