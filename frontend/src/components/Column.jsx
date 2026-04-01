import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const STATUS_CONFIG = {
  'To Do': {
    dot: 'bg-blue-500',
    count: 'bg-blue-500/15 text-blue-400',
    dragOver: 'bg-blue-500/[0.04]',
    border: 'border-t-blue-500',
  },
  'In Progress': {
    dot: 'bg-amber-500',
    count: 'bg-amber-500/15 text-amber-400',
    dragOver: 'bg-amber-500/[0.04]',
    border: 'border-t-amber-500',
  },
  'Done': {
    dot: 'bg-emerald-500',
    count: 'bg-emerald-500/15 text-emerald-400',
    dragOver: 'bg-emerald-500/[0.04]',
    border: 'border-t-emerald-500',
  },
};

export default function Column({ status, tasks, onTaskClick }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['To Do'];

  return (
    <div className={`flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.025] border-t-4 ${config.border}`}>
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${config.dot} shadow-sm`} style={{ boxShadow: `0 0 6px currentColor` }} />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {status}
          </h2>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${config.count}`}>
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 px-3 pb-3 min-h-[160px] rounded-b-xl transition-colors ${
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
