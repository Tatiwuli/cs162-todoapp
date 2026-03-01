import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import './Card.css'


// level 3 card - sub sub task 
function SubSubCard({task, onUpdate, onDelete}) {
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        task_title: task.task_title,
        task_description: task.task_description,
        task_deadline: task.task_deadline || '',
  })
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSave() {

    onUpdate(task.task_id, editData) // update the data with editData
    setIsEditing(false)  // leave edit mode
  }

  const isDone = task.task_status === 'done'

    return (
    <div className="sub-card">
      <div className="card-header">
        <input
          type="checkbox"
        //   when checked, mark status as done
          checked={isDone}
        
          onChange={() => onUpdate(task.task_id, { task_status: isDone ? 'todo' : 'done' })}
          className="card-checkbox"
        />
         {/* when on edit mode  */}
        {isEditing ? (
          <input
            className="card-title-input"
            value={editData.task_title}
            onChange={e => setEditData({ ...editData, task_title: e.target.value })}
          />
        ) : (
            // when not in edit mode. If status is done, show it
          <span className={`card-title ${isDone ? 'done' : ''}`}>{task.task_title}</span>
        )}
        <div className="menu-wrapper">
          <button className="menu-btn"
          //v represents curr state of the menu. And we want to flip the state everytime user clicks it; If v = open, we close it ( !v) if user clicks the menu
           onClick={() => setMenuOpen(v => !v)}>⋮</button>
          {menuOpen && (
            // when menu is open and use click on one of the options
            <ul className="menu-dropdown">
              <li onClick={() => { setMenuOpen(false); setIsEditing(true) }}>Edit</li>
              <li onClick={() => { setMenuOpen(false); onDelete(task.task_id) }}>Delete</li>
            </ul>
          )}
        </div>
      </div>
        {/* When it's on edit mode */}
  
      {isEditing ? (
        <div className="card-body">
          <textarea
            className="card-desc-input"
            value={editData.task_description}
            placeholder="Description"
            onChange={e => setEditData({ ...editData, task_description: e.target.value })}
          />
     
          <input
            type="date" // browser render a date-picker calendar
            className="card-deadline-input"
            value={editData.task_deadline}
            onChange={e => setEditData({ ...editData, task_deadline: e.target.value })} // e.target is the <input> element. `.value` is the value seleted by the user
          />
          {/* When clicked save, leave edit mode and update all the data as defined in the function handleSave */}
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      ) : (
        // When it's not in edit mode, just display the fields
        <div className="card-body">
          {task.task_description && <p className="card-desc">{task.task_description}</p>}
          {task.task_deadline && <p className="card-deadline">📅 {task.task_deadline}</p>}
        </div>
      )}
    </div>
  )

}
// ─── Level 2: Sub-task ──────────────────────────────────────────────────────
function SubCard({ task, onUpdate, onDelete, onAddSubSubtask, onUpdateSubSub, onDeleteSubSub }) {
  const [isEditing, setIsEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showSubSubtasks, setShowSubSubtasks] = useState(true)
  const [editData, setEditData] = useState({
    task_title: task.task_title,
    task_description: task.task_description,
    task_deadline: task.task_deadline || '',
  })

  function handleSave() {
    onUpdate(task.task_id, editData)
    setIsEditing(false)
  }

  const isDone = task.task_status === 'done'
  const hasSubSubtasks = task.subsubtasks && task.subsubtasks.length > 0

  return (
    <div className="sub-card">
      <div className="card-header">
        <input
          type="checkbox"
          checked={isDone}
          onChange={() => onUpdate(task.task_id, { task_status: isDone ? 'todo' : 'done' })}
          className="card-checkbox"
        />
        {/* // if the card has subtasks , render a toggle btn */}
        {/* Rendering ONLY the toggle btn first, because it should be next to the card's header. While the sub task list is under the card's body below */}
        {hasSubSubtasks && (

          <button className="toggle-btn" onClick={() => setShowSubSubtasks(v => !v)}>
             {/* arrow pointing down when showSubSubtask is true; else , pointing side */}
            {showSubSubtasks ? '▾' : '▸'} 
           
          </button>
        )}
        {isEditing ? (
          <input
            className="card-title-input"
            value={editData.task_title}
            onChange={e => setEditData({ ...editData, task_title: e.target.value })}
          />
        ) : (
          <span className={`card-title ${isDone ? 'done' : ''}`}>{task.task_title}</span>
        )}
        <div className="menu-wrapper">
          <button className="menu-btn" onClick={() => setMenuOpen(v => !v)}>⋮</button>
          {menuOpen && (
            <ul className="menu-dropdown">
              <li onClick={() => { setMenuOpen(false); setIsEditing(true) }}>Edit</li>
              <li onClick={() => { setMenuOpen(false); onDelete(task.task_id) }}>Delete</li>
              <li onClick={() => { setMenuOpen(false); onAddSubSubtask(task.task_id) }}>Add sub-sub-task</li>
            </ul>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="card-body">
          <textarea
            className="card-desc-input"
            value={editData.task_description}
            placeholder="Description"
            onChange={e => setEditData({ ...editData, task_description: e.target.value })}
          />
          <input
            type="date"
            className="card-deadline-input"
            value={editData.task_deadline}
            onChange={e => setEditData({ ...editData, task_deadline: e.target.value })}
          />
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div className="card-body">
          {task.task_description && <p className="card-desc">{task.task_description}</p>}
          {task.task_deadline && <p className="card-deadline">📅 {task.task_deadline}</p>}
        </div>
      )}

      {hasSubSubtasks && showSubSubtasks && (
        <div className="subsubtasks">
          {task.subsubtasks.map(sub => (
            <SubSubCard
              key={sub.task_id}
              task={sub}
              onUpdate={(id, updates) => onUpdateSubSub(task.task_id, id, updates)}
              onDelete={(id) => onDeleteSubSub(task.task_id, id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Level 1: Main card (draggable) ─────────────────────────────────────────
export default function Card({ task, onUpdate, onDelete, onAddSubtask, onUpdateSub, onDeleteSub, onAddSubSubtask, onUpdateSubSub, onDeleteSubSub }) {
  const [isEditing, setIsEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(true)
  const [editData, setEditData] = useState({
    task_title: task.task_title,
    task_description: task.task_description,
    task_deadline: task.task_deadline || '',
  })
  //attributes: add accessibility attribute `arria-*` 
  // listeners: listen to the mouse/touch event from the user to stat the drag
  // setNodeRRef: attaches to the <div> so dnd-kit knows which DOM element to drag
  //useSortable a hook from dnd-kit to register the task id as draggable item
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.task_id,
  })

  // set the style between when the card is being dragged/not dragged 
  const style = {
    transform: CSS.Transform.toString(transform), // make a position offset effect as user  drag the card 
    transition, // smooth animation when the card snaps back
    opacity: isDragging ? 0.5 : 1, // when the carrd is being drragged, put the opacity to 0.5 ( transparent effect)
  }

  function handleSave() {
    onUpdate(task.task_id, editData)
    setIsEditing(false)
  }

  const isDone = task.task_status === 'done'
  const hasSubtasks = task.subtasks && task.subtasks.length > 0

  return (
    <div ref={setNodeRef} style={style} className={`card ${isDragging ? 'dragging' : ''}`}>
      <div className="card-header">
        {/* // add the acessibility attributes and listeners only to the ⠿ */}
        <span className="drag-handle" {...attributes} {...listeners}>⠿</span>
        <input
          type="checkbox"
          checked={isDone}
          onChange={() => onUpdate(task.task_id, { task_status: isDone ? 'todo' : 'done' })}
          className="card-checkbox"
        />
        {hasSubtasks && (
          <button className="toggle-btn" onClick={() => setShowSubtasks(v => !v)}>
            {showSubtasks ? '▾' : '▸'}
          </button>
        )}
        {isEditing ? (
          <input
            className="card-title-input"
            value={editData.task_title}
            onChange={e => setEditData({ ...editData, task_title: e.target.value })}
          />
        ) : (
          <span className={`card-title ${isDone ? 'done' : ''}`}>{task.task_title}</span>
        )}
        <div className="menu-wrapper">
          <button className="menu-btn" onClick={() => setMenuOpen(v => !v)}>⋮</button>
          {menuOpen && (
            <ul className="menu-dropdown">
              <li onClick={() => { setMenuOpen(false); setIsEditing(true) }}>Edit</li>
              <li onClick={() => { setMenuOpen(false); onDelete(task.task_id) }}>Delete</li>
              <li onClick={() => { setMenuOpen(false); onAddSubtask(task.task_id) }}>Add sub-task</li>
            </ul>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="card-body">
          <textarea
            className="card-desc-input"
            value={editData.task_description}
            placeholder="Description"
            onChange={e => setEditData({ ...editData, task_description: e.target.value })}
          />
          <input
            type="date"
            className="card-deadline-input"
            value={editData.task_deadline}
            onChange={e => setEditData({ ...editData, task_deadline: e.target.value })}
          />
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div className="card-body">
          {task.task_description && <p className="card-desc">{task.task_description}</p>}
          {task.task_deadline && <p className="card-deadline">📅 {task.task_deadline}</p>}
        </div>
      )}

      {hasSubtasks && showSubtasks && (
        <div className="subtasks">
          {task.subtasks.map(sub => (
            <SubCard
              key={sub.task_id}
              task={sub}
              onUpdate={(id, updates) => onUpdateSub(task.task_id, id, updates)}
              onDelete={(id) => onDeleteSub(task.task_id, id)}
              // rendering subsubtask and its options only if SubTask exist
              onAddSubSubtask={(subId) => onAddSubSubtask(task.task_id, subId)}
              onUpdateSubSub={(subId, subsubId, updates) => onUpdateSubSub(task.task_id, subId, subsubId, updates)}
              onDeleteSubSub={(subId, subsubId) => onDeleteSubSub(task.task_id, subId, subsubId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}



