import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Card from '../Card/Card'
import './Column.css'


export default function Column({ id, title, tasks, onUpdate, onDelete, onAddSubtask, onUpdateSub, onDeleteSub, onAddSubSubtask, onUpdateSubSub, onDeleteSubSub }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="column">
      <h2 className="column-title">
        {title}
        <span className="column-count">{tasks.length}</span>
      </h2>
      <div ref={setNodeRef} className="column-body">
        
        <SortableContext items={tasks.map(t => t.task_id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <Card
              key={task.task_id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              onUpdateSub={onUpdateSub}
              onDeleteSub={onDeleteSub}
              onAddSubSubtask={onAddSubSubtask}
              onUpdateSubSub={onUpdateSubSub}
              onDeleteSubSub={onDeleteSubSub}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
