import MatchingTask from './MatchingTask'
import MultipleChoiceTask from './MultipleChoiceTask'
import ShortAnswerTask from './ShortAnswerTask'
import WritingTask from './WritingTask'

interface Task {
  id: string
  section: string
  taskNumber: number
  taskType: string
  content: string
  correctAnswer?: string | null
  explanation?: string | null
  audioUrl?: string | null
  imageUrl?: string | null
}

interface TaskRendererProps {
  task: Task
  mode: 'practice' | 'exam'
  onSubmit: (answer: string) => void
  showAnswer?: boolean
  readonly?: boolean
}

export default function TaskRenderer({ task, mode, onSubmit, showAnswer, readonly }: TaskRendererProps) {
  const commonProps = { task, onSubmit, showAnswer, readonly }

  switch (task.taskType) {
    case 'MATCHING':
    case 'HEADING_MATCHING':
      return <MatchingTask {...commonProps} />

    case 'MULTIPLE_CHOICE':
    case 'MULTIPLE_CHOICE_CLOZE':
    case 'LEXICAL_CLOZE':
    case 'TRUE_NOT_STATED_FALSE':
      return <MultipleChoiceTask {...commonProps} />

    case 'SHORT_ANSWER':
    case 'GRAMMAR_TRANSFORMATION':
    case 'WORD_FORMATION':
      return <ShortAnswerTask {...commonProps} />

    case 'EMAIL':
    case 'ESSAY':
      return <WritingTask task={task} onSubmit={onSubmit} readonly={readonly} />

    default:
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
          Тип задания <strong>{task.taskType}</strong> пока не поддерживается в интерфейсе.
        </div>
      )
  }
}
