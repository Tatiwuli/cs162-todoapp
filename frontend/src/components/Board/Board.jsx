import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import Column from '../Column/Column'
import './Board.css'

const STATUSES = [
  { id: 'todo',    title: 'To Do' },
  { id: 'pending', title: 'In Progress' },
  { id: 'done',    title: 'Done' },
]

// Temporary mock data — replace with API call later
const MOCK_TASKS = [
  {
    task_id: 1,
    task_title: 'Design the UI',
    task_description: 'Wireframes and mockups',
    task_deadline: '2025-03-10',
    task_status: 'todo',
    subtasks: [],
  },
  {
    task_id: 2,
    task_title: 'Set up Flask backend',
    task_description: '',
    task_deadline: '',
    task_status: 'pending',
    subtasks: [],
  },
]

export default function Board() {
  const [tasks, setTasks] = useState(MOCK_TASKS)

  const sensors = useSensors(useSensor(PointerSensor))

  // ── Drag & drop ────────────────────────────────────────────────────────────
  function handleDragDrop(event) {
    const { active, over } = event
    if (!over) return

    const draggedId = active.id
    const overId = over.id
    const columnIds = STATUSES.map(s => s.id)

    // Dropped onto a column → move to that status
    if (columnIds.includes(overId)) {
      setTasks(prev =>
        prev.map(t => t.task_id === draggedId ? { ...t, task_status: overId } : t)
      )
      return
    }

    // Dropped onto another card → move to that card's column
    const overTask = tasks.find(t => t.task_id === overId)
    if (overTask && overTask.task_id !== draggedId) {
      setTasks(prev =>
        prev.map(t =>
          t.task_id === draggedId ? { ...t, task_status: overTask.task_status } : t
        )
      )
    }
  }

  // ── Task (level 1) handlers ────────────────────────────────────────────────
  function handleUpdate(taskId, updates) {
    setTasks(prev =>
      prev.map(t => t.task_id === taskId ? { ...t, ...updates } : t)
    )
    // TODO: PATCH /api/tasks/:taskId
  }

  function handleDelete(taskId) {
    // include existing task which task_id is not equal to the target task_id 
    setTasks(prev => prev.filter(t => t.task_id !== taskId))
    // TODO: DELETE /api/tasks/:taskId
  }

  function handleAddSubtask(taskId) {
    // new sub task information
    const newSub = {
      task_id: Date.now(),
      parent_task_id: taskId,
      task_title: 'New sub-task',
      task_description: '',
      task_deadline: '',
      task_status: 'todo',
      subsubtasks: [],
    }
    // Iterate through every existig task; If a task id equals the target task's id, coppy the previous subtasks if exist, with the new subtask
    setTasks(prev =>
      prev.map(t =>
        t.task_id === taskId
          ? { ...t, subtasks: [...t.subtasks, newSub] }
          : t
      )
    )
    // TODO: POST /api/subtasks/:taskId
  }

  // ── Subtask (level 2) handlers ─────────────────────────────────────────────
  function handleUpdateSub(taskId, subId, updates) {
    // Iterate through existing tasks. For task id equals to the target task, copy the sub task's data and add the updates. 
    setTasks(prev =>
      prev.map(t =>
        t.task_id === taskId
          ? { ...t, subtasks: t.subtasks.map(s => s.task_id === subId ? { ...s, ...updates } : s) }
          : t
      )
    )
    // TODO: PATCH /api/subtasks/:subId
  }

  function handleDeleteSub(taskId, subId) {
    // Iterate through existing tasks and include in the subtasks list except the task that has the id equal to the target task_id 
    setTasks(prev =>
      prev.map(t =>
        t.task_id === taskId
          ? { ...t, subtasks: t.subtasks.filter(s => s.task_id !== subId) }
          : t
      )
    )
    // TODO: DELETE /api/subtasks/:subId
  }

  function handleAddSubSubtask(taskId, subId) {
    const newSubSub = {
      task_id: Date.now(),
      parent_task_id: subId,
      task_title: 'New sub-sub-task',
      task_description: '',
      task_deadline: '',
      task_status: 'todo',
    }
    setTasks(prev =>
      prev.map(t =>
        t.task_id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map(s =>
                s.task_id === subId
                  ? { ...s, subsubtasks: [...s.subsubtasks, newSubSub] }
                  : s
              ),
            }
          : t
      )
    )
    // TODO: POST /api/subsubtasks/:subId
  }

  // ── Sub-sub-task (level 3) handlers ───────────────────────────────────────
  function handleUpdateSubSub(taskId, subId, subsubId, updates) {
    setTasks(prev =>
      prev.map(t =>
        t.task_id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map(s =>
                s.task_id === subId
                  ? {
                      ...s,
                      subsubtasks: s.subsubtasks.map(ss =>
                        ss.task_id === subsubId ? { ...ss, ...updates } : ss
                      ),
                    }
                  : s
              ),
            }
          : t
      )
    )
    // TODO: PATCH /api/subsubtasks/:subsubId
  }

  function handleDeleteSubSub(taskId, subId, subsubId) {
    setTasks(prev =>
      prev.map(t =>
        t.task_id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map(s =>
                s.task_id === subId
                  ? { ...s, subsubtasks: s.subsubtasks.filter(ss => ss.task_id !== subsubId) }
                  : s
              ),
            }
          : t
      )
    )
    // TODO: DELETE /api/subsubtasks/:subsubId
  }

  // ── Add a new top-level card ───────────────────────────────────────────────
  function handleAddCard() {
    const newTask = {
      task_id: Date.now(),
      task_title: 'New task',
      task_description: '',
      task_deadline: '',
      task_status: 'todo',
      subtasks: [],
    }
    setTasks(prev => [...prev, newTask])
    // TODO: POST /api/tasks
  }

  const sharedHandlers = {
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onAddSubtask: handleAddSubtask,
    onUpdateSub: handleUpdateSub,
    onDeleteSub: handleDeleteSub,
    onAddSubSubtask: handleAddSubSubtask,
    onUpdateSubSub: handleUpdateSubSub,
    onDeleteSubSub: handleDeleteSubSub,
  }

  return (
    <div className="board-wrapper">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragDrop}>
        <div className="board">
            {/*  for each status, add the columnn component */}
          {STATUSES.map(status => (
            <Column
              key={status.id}
              id={status.id}
              title={status.title}
            //   Include the tasks, which status == to status id of current column
              tasks={tasks.filter(t => t.task_status === status.id)}
              {...sharedHandlers}
            />
          ))}
        </div>
      </DndContext>

      <button className="add-card-btn" onClick={handleAddCard}>+ Add Card</button>
    </div>
  )
}
