import { useState, useEffect } from 'react'
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
  { id: 'todo',        title: 'To Do',       color: '#c8a96e' },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6' },
  { id: 'done',        title: 'Done',        color: '#22c55e' },
]

export default function Board() {
  const [tasks, setTasks] = useState([])

  // Load all tasks from the API on mount
  useEffect(() => {
    //call api/tasks endpoint
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data)) // update the setTasks with fetched data
  }, [])

  const sensors = useSensors(useSensor(PointerSensor))

  // ── Drag & drop ────────────────────────────────────────────────────────────
  async function handleDragDrop(event) {
    const { active, over } = event
    if (!over) return

    const draggedId = active.id
    const overId = over.id
    const columnIds = STATUSES.map(s => s.id)

    //update the db
    await fetch(`/api/tasks/${draggedId}`, {   
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_status: overId }),
  })

    
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
  async function handleUpdate(taskId, updates) {
    
    await fetch(`/api/tasks/${taskId}`,{
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    })

    setTasks(prev =>
      prev.map(t => t.task_id === taskId ? { ...t, ...updates } : t)
    )
  }

  async function handleDelete(taskId) {
    // include existing task which task_id is not equal to the target task_id 
    setTasks(prev => prev.filter(t => t.task_id !== taskId))
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
  }

  async function handleAddSubtask(taskId) {
    // new sub task information

    const res = await fetch(`/api/subtasks/${taskId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_title: 'New sub-task', task_status: 'todo' }),
  })

  const newSub = await res.json() // wait for the api's return 

    // Iterate through every existig task; If a task id equals the target task's id, coppy the previous subtasks if exist, with the new subtask
    setTasks(prev =>
      prev.map(t =>
        t.task_id === taskId
          ? { ...t, subtasks: [...t.subtasks, newSub] }
          : t
      )
    )
    
  }

  // ── Subtask (level 2) handlers ─────────────────────────────────────────────
  async function handleUpdateSub(taskId, subId, updates) {
    // send PATCH API to backend 
    const res = await fetch(`/api/subtasks/${subId}`,{
      method : 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(updates)
    })
    
    // Iterate through existing tasks. For task id equals to the target task, copy the sub task's data and add the updates. 
    setTasks(prev =>
      prev.map(t =>
        t.task_id === taskId
          ? { ...t, subtasks: t.subtasks.map(s => s.task_id === subId ? { ...s, ...updates } : s) }
          : t
      )
    )
   
  }

  async function handleDeleteSub(taskId, subId) {
    // Iterate through existing tasks and include in the subtasks list except the task that has the id equal to the target task_id 

    setTasks(prev =>
      prev.map(t =>
        t.task_id === taskId
          ? { ...t, subtasks: t.subtasks.filter(s => s.task_id !== subId) }
          : t
      )
    )

    await fetch(`/api/subtasks/${subId}`, 
      { method : 'DELETE' })

  }

  async function handleAddSubSubtask(taskId, subId) {

    const res = await fetch(`/api/subsubtasks/${subId}`, {
      method: "POST", 
      headers: {"Content-Type" : "application/json"},
      body: JSON.stringify({"task_title": 'New sub-sub task', "task_status": 'todo'})
    })
    
    const newSubSub = await res.json() 

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
   
  }

  // ── Sub-sub-task (level 3) handlers ───────────────────────────────────────
  async function handleUpdateSubSub(taskId, subId, subsubId, updates) {

    await fetch(`/api/subsubtasks/${subsubId}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(updates)
    })

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
    
  }

  async function handleDeleteSubSub(taskId, subId, subsubId) {
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
    await fetch(`/api/subsubtasks/${subsubId}`, { method: 'DELETE' })
  }

  // ── Add a new top-level card ───────────────────────────────────────────────
  async function handleAddCard() {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_title: 'New task', task_status: 'todo' }),
    })
    const newTask = await res.json()
    // Update Tasks with the added new task 
    setTasks(prev => [...prev, newTask])
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
              color={status.color}
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
