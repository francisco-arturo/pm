import { Draggable } from '@hello-pangea/dnd';
import { getColumnTheme } from '../columnStyles';

export default function TaskCard({ task, index, onClick }) {
  const leftBorder = getColumnTheme(task.status).left;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`group rounded-lg border border-l-[3px] border-white/[0.07] bg-white/[0.04] p-3.5 cursor-pointer transition-all duration-150 ${leftBorder} ${
            snapshot.isDragging
              ? 'shadow-2xl shadow-black/60 ring-1 ring-violet-500/40 scale-[1.02] bg-white/[0.07]'
              : 'hover:border-white/[0.12] hover:bg-white/[0.06] hover:shadow-xl hover:shadow-black/40 hover:-translate-y-px'
          }`}
        >
          <p className="text-[10px] font-mono text-gray-600 mb-1.5 truncate">{task.id}</p>
          <h3 className="font-medium text-gray-100 text-sm leading-snug">
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
          {task.comments.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 text-gray-600">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-[11px] tabular-nums">{task.comments.length}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
