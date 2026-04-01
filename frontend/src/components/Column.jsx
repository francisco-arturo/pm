import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { getColumnTheme } from '../columnStyles';

export default function Column({
  status,
  tasks,
  onTaskClick,
  canRemove,
  onRemoveColumn,
  columnDragProvided,
  isDragging,
}) {
  const config = getColumnTheme(status);
  const { innerRef, draggableProps, dragHandleProps } = columnDragProvided;

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={`flex w-[min(100%,280px)] shrink-0 flex-col rounded-xl border border-white/[0.07] bg-white/[0.025] border-t-4 transition-[box-shadow,transform] duration-150 sm:w-[280px] ${config.border} ${
        isDragging
          ? 'z-10 scale-[1.02] shadow-2xl shadow-black/60 ring-1 ring-violet-500/40'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3.5">
        <div
          {...dragHandleProps}
          className="flex min-w-0 flex-1 cursor-grab items-center gap-2 active:cursor-grabbing"
          title="Drag to reorder column"
        >
          <span className="flex shrink-0 flex-col gap-0.5 text-gray-600" aria-hidden>
            <span className="flex gap-0.5">
              <span className="h-0.5 w-0.5 rounded-full bg-current" />
              <span className="h-0.5 w-0.5 rounded-full bg-current" />
            </span>
            <span className="flex gap-0.5">
              <span className="h-0.5 w-0.5 rounded-full bg-current" />
              <span className="h-0.5 w-0.5 rounded-full bg-current" />
            </span>
            <span className="flex gap-0.5">
              <span className="h-0.5 w-0.5 rounded-full bg-current" />
              <span className="h-0.5 w-0.5 rounded-full bg-current" />
            </span>
          </span>
          <span className={`h-2 w-2 shrink-0 rounded-full ${config.dot} shadow-sm`} style={{ boxShadow: `0 0 6px currentColor` }} />
          <h2 className="truncate text-xs font-semibold uppercase tracking-widest text-gray-400">
            {status}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${config.count}`}>
            {tasks.length}
          </span>
          {canRemove && onRemoveColumn && (
            <button
              type="button"
              onClick={() => onRemoveColumn(status)}
              className="rounded-md p-1 text-gray-600 transition-colors hover:bg-white/[0.08] hover:text-red-400"
              title="Remove column"
              aria-label={`Remove column ${status}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <Droppable droppableId={status} type="TASK">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[160px] flex-1 space-y-2 rounded-b-xl px-3 pb-3 transition-colors ${
              snapshot.isDraggingOver ? config.dragOver : ''
            }`}
          >
            {tasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} onClick={onTaskClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
