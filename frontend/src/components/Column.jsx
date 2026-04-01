import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const STATUS_COLORS = {
  'To Do': 'border-t-blue-500',
  'In Progress': 'border-t-amber-500',
  'Done': 'border-t-emerald-500',
};

export default function Column({ status, tasks, onTaskClick }) {
  return (
    <div className={`flex flex-col rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 border-t-4 ${STATUS_COLORS[status] || ''}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
          {status}
        </h2>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 px-3 pb-3 min-h-[120px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-950/30' : ''
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
