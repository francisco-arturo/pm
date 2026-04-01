import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Column from './Column';

const COLUMN_DND_PREFIX = '__col__:';

function columnToDraggableId(status) {
  return `${COLUMN_DND_PREFIX}${encodeURIComponent(status)}`;
}

export default function Board({
  columns,
  tasks,
  statusCounts,
  onDragEnd,
  onTaskClick,
  onAddColumn,
  onRemoveColumn,
}) {
  const grouped = Object.fromEntries(columns.map(s => [s, []]));
  for (const t of tasks) {
    if (grouped[t.status]) grouped[t.status].push(t);
  }

  const [addingOpen, setAddingOpen] = useState(false);
  const [newName, setNewName] = useState('');

  function submitAdd(e) {
    e?.preventDefault();
    const name = newName.trim();
    if (!name) return;
    onAddColumn(name);
    setNewName('');
    setAddingOpen(false);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="-mx-4 flex flex-nowrap gap-4 overflow-x-auto px-4 pb-2">
        <Droppable droppableId="board-columns" type="COLUMN" direction="horizontal">
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-nowrap gap-4"
            >
              {columns.map((status, index) => (
                <Draggable key={status} draggableId={columnToDraggableId(status)} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    <Column
                      status={status}
                      tasks={grouped[status] || []}
                      onTaskClick={onTaskClick}
                      canRemove={(statusCounts[status] || 0) === 0}
                      onRemoveColumn={onRemoveColumn}
                      columnDragProvided={dragProvided}
                      isDragging={dragSnapshot.isDragging}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <div
          className={`flex shrink-0 flex-col items-stretch rounded-xl border border-dashed border-white/[0.06] bg-transparent transition-[width] duration-200 ${
            addingOpen ? 'w-[min(220px,calc(100vw-2.5rem))]' : 'w-14'
          }`}
          title="Add column"
        >
          <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center px-1 py-4">
            {!addingOpen ? (
              <button
                type="button"
                onClick={() => setAddingOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-white/[0.06] hover:text-violet-400"
                aria-label="Add column"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            ) : (
              <form
                onSubmit={submitAdd}
                className="flex w-full flex-col gap-2 rounded-lg border border-white/[0.08] bg-gray-950/90 p-2 shadow-xl backdrop-blur-sm"
                onClick={e => e.stopPropagation()}
              >
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Column name"
                  autoFocus
                  className="w-full rounded-md border border-white/[0.1] bg-white/[0.05] px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                />
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAddingOpen(false);
                      setNewName('');
                    }}
                    className="rounded px-2 py-1 text-[11px] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-violet-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-violet-500"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
