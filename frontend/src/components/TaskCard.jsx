import { Draggable } from '@hello-pangea/dnd';

export default function TaskCard({ task, index, onClick }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm cursor-pointer transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
          }`}
        >
          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-1">{task.id}</p>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug">
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}
          {task.comments.length > 0 && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}
