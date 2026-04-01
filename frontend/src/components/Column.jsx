import { useState, useEffect, useRef } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { getColumnTheme } from '../columnStyles';

export default function Column({
  status,
  tasks,
  onTaskClick,
  canRemove,
  onRemoveColumn,
  onRenameColumn,
  columnDragProvided,
  isDragging,
  autoEditColumnName,
  onAutoEditTitleConsumed,
}) {
  const config = getColumnTheme(status);
  const { innerRef, draggableProps, dragHandleProps } = columnDragProvided;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(status);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(status);
  }, [status]);

  const autoEditOpenedRef = useRef(false);

  useEffect(() => {
    if (autoEditColumnName !== status) return;
    setDraft(status);
    setEditing(true);
  }, [autoEditColumnName, status]);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    if (!editing || autoEditColumnName !== status) return;
    if (autoEditOpenedRef.current) return;
    autoEditOpenedRef.current = true;
    const id = requestAnimationFrame(() => {
      onAutoEditTitleConsumed?.();
    });
    return () => cancelAnimationFrame(id);
  }, [editing, autoEditColumnName, status, onAutoEditTitleConsumed]);

  async function commitRename() {
    const v = draft.trim();
    if (!v) {
      setDraft(status);
      setEditing(false);
      return;
    }
    if (v === status) {
      setEditing(false);
      return;
    }
    const ok = await onRenameColumn(status, v);
    if (ok) setEditing(false);
  }

  function cancelRename() {
    setDraft(status);
    setEditing(false);
  }

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={`flex min-w-[220px] flex-1 basis-0 flex-col rounded-xl border border-white/[0.07] bg-white/[0.025] border-t-4 transition-[box-shadow,transform] duration-150 ${config.border} ${
        isDragging
          ? 'z-10 scale-[1.02] shadow-2xl shadow-black/60 ring-1 ring-violet-500/40'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3.5">
        <div
          {...dragHandleProps}
          className="flex shrink-0 cursor-grab items-center gap-2 active:cursor-grabbing"
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
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={() => commitRename()}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitRename();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelRename();
                }
              }}
              onMouseDown={e => e.stopPropagation()}
              className="w-full rounded-md border border-violet-500/40 bg-black/40 px-2 py-1 text-xs font-semibold uppercase tracking-widest text-gray-200 outline-none ring-1 ring-violet-500/30 focus:border-violet-500/60"
              aria-label="Column name"
            />
          ) : (
            <h2
              className="cursor-default truncate text-xs font-semibold uppercase tracking-widest text-gray-400 select-none"
              title="Double-click to rename"
              onDoubleClick={e => {
                e.preventDefault();
                setDraft(status);
                setEditing(true);
              }}
            >
              {status}
            </h2>
          )}
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
