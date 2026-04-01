import { useState, useEffect, Fragment } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Column from './Column';
import ConfirmDialog from './ConfirmDialog';

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
  onRenameColumn,
  columnToAutoEdit,
  onColumnAutoEditConsumed,
}) {
  const [columnPendingDelete, setColumnPendingDelete] = useState(null);

  useEffect(() => {
    if (!columnPendingDelete) return;
    function onKey(e) {
      if (e.key === 'Escape') setColumnPendingDelete(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [columnPendingDelete]);

  const grouped = Object.fromEntries(columns.map(s => [s, []]));
  for (const t of tasks) {
    if (grouped[t.status]) grouped[t.status].push(t);
  }

  async function confirmRemoveColumn() {
    if (columnPendingDelete) await onRemoveColumn(columnPendingDelete);
    setColumnPendingDelete(null);
  }

  return (
    <Fragment>
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex w-full min-w-0 gap-4">
        <div className="min-w-0 flex-1 overflow-x-auto pb-2">
          <Droppable droppableId="board-columns" type="COLUMN" direction="horizontal">
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex w-max min-w-full flex-nowrap gap-4"
              >
                {columns.map((status, index) => (
                  <Draggable key={status} draggableId={columnToDraggableId(status)} index={index}>
                    {(dragProvided, dragSnapshot) => (
                      <Column
                        status={status}
                        tasks={grouped[status] || []}
                        onTaskClick={onTaskClick}
                        canRemove={(statusCounts[status] || 0) === 0}
                        onRemoveColumn={setColumnPendingDelete}
                        onRenameColumn={onRenameColumn}
                        columnDragProvided={dragProvided}
                        isDragging={dragSnapshot.isDragging}
                        autoEditColumnName={columnToAutoEdit}
                        onAutoEditTitleConsumed={onColumnAutoEditConsumed}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div
          className="flex w-14 shrink-0 flex-col items-stretch rounded-xl border border-dashed border-white/[0.06] bg-transparent"
          title="Add column"
        >
          <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center px-1 py-4">
            <button
              type="button"
              onClick={() => onAddColumn()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-white/[0.06] hover:text-violet-400"
              aria-label="Add column"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </DragDropContext>

    {columnPendingDelete && (
      <ConfirmDialog
        title="Remove column?"
        message={`Remove "${columnPendingDelete}" from the board and columns file? This cannot be undone.`}
        confirmLabel="Remove"
        danger
        onCancel={() => setColumnPendingDelete(null)}
        onConfirm={confirmRemoveColumn}
      />
    )}
    </Fragment>
  );
}
