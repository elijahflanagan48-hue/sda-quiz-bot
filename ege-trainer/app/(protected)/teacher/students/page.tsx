import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function StudentsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  if (session.user.role !== 'TEACHER') redirect('/dashboard')

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      practiceSessions: { orderBy: { startedAt: 'desc' }, take: 1 },
      _count: {
        select: {
          practiceSessions: true,
          submissions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get pending review count per student
  const pendingByStudent = await prisma.taskSubmission.groupBy({
    by: ['userId'],
    where: { submittedForReview: true, reviewedAt: null },
    _count: { id: true },
  })
  const pendingMap = Object.fromEntries(pendingByStudent.map((p) => [p.userId, p._count.id]))

  const sectionNames: Record<string, string> = {
    LISTENING: 'Аудирование', READING: 'Чтение',
    GRAMMAR_VOCAB: 'Грамматика', WRITING: 'Письмо', ORAL: 'Устная часть',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ученики</h1>
        <p className="text-gray-500 mt-1">{students.length} зарегистрировано</p>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          Нет зарегистрированных учеников
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student) => {
            const lastSession = student.practiceSessions[0]
            const pending = pendingMap[student.id] || 0
            return (
              <Link key={student.id} href={`/teacher/students/${student.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </div>
                  <div className="text-right text-sm">
                    {pending > 0 && (
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {pending} на проверке
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-6 text-sm text-gray-500">
                  <span>Тренировок: <strong className="text-gray-700">{student._count.practiceSessions}</strong></span>
                  <span>Ответов: <strong className="text-gray-700">{student._count.submissions}</strong></span>
                  {lastSession && (
                    <span>Последняя: <strong className="text-gray-700">{sectionNames[lastSession.section]}</strong> ({new Date(lastSession.startedAt).toLocaleDateString('ru')})</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
