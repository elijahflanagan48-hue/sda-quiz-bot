'use client'

interface ExamNavigatorProps {
  totalTasks: number
  completedTasks: Set<number>
  currentTask: number
  onNavigate: (taskIndex: number) => void
}

export default function ExamNavigator({ totalTasks, completedTasks, currentTask, onNavigate }: ExamNavigatorProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">Навигация</h3>
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: totalTasks }, (_, i) => (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
              i === currentTask
                ? 'bg-blue-600 text-white'
                : completedTasks.has(i)
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded" /> Выполнено</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded" /> Текущее</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 rounded border" /> Пропущено</span>
      </div>
    </div>
  )
}
