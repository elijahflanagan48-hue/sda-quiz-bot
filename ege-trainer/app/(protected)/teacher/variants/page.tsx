import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function VariantsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  if (session.user.role !== 'TEACHER') redirect('/dashboard')

  const variants = await prisma.examVariant.findMany({
    include: { _count: { select: { tasks: true, attempts: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Варианты экзамена</h1>
        <p className="text-gray-500 mt-1">{variants.length} вариантов</p>
      </div>

      {variants.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          Нет вариантов экзамена. Создайте варианты через скрипты импорта.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {variants.map((v) => (
            <div key={v.id} className="p-4 flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-800">{v.title}</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {v.year && <span className="mr-3">Год: {v.year}</span>}
                  <span className="mr-3">{v._count.tasks} заданий</span>
                  <span>{v._count.attempts} попыток</span>
                </div>
              </div>
              {v.isOfficial && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Официальный</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
