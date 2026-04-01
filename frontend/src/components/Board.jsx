import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';

const STATUSES = ['To Do', 'In Progress', 'Done'];

export default function Board({ tasks, onDragEnd, onTaskClick }) {
  const grouped = Object.fromEntries(STATUSES.map(s => [s, []]));
  for (const t of tasks) {
    if (grouped[t.status]) grouped[t.status].push(t);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATUSES.map(status => (
          <Column
            key={status}
            status={status}
            tasks={grouped[status]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
