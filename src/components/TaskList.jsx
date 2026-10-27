import { useState } from 'react';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

function getBadgeClass(priority) {
  switch (priority) {
    case 'High':
      return 'badge bg-danger ms-2 priority-high';
    case 'Low':
      return 'badge bg-success ms-2 priority-low';
    case 'Medium':
    default:
      return 'badge bg-warning text-dark ms-2 priority-medium';
  }
}

function TaskList({
  tasks,
  filter,
  onFilterChange,
  searchQuery,
  onSearchQueryChange,
  onToggleTask,
  onDeleteTask,
  onUpdateTaskText,
  onClearCompleted,
  totalTaskCount,
  completedTaskCount,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState('');

  function startEditing(task) {
    setEditingId(task.id);
    setEditedText(task.text);
  }

  async function saveEdit(event, taskId) {
    event.preventDefault();
    if (!editedText.trim()) return;

    if (await onUpdateTaskText(taskId, editedText)) {
      setEditingId(null);
      setEditedText('');
    }
  }

  return (
    <>
      <label htmlFor="task-search" className="form-label">
        Search tasks
      </label>
      <input
        id="task-search"
        type="search"
        className="form-control mb-3"
        value={searchQuery}
        onChange={(event) => onSearchQueryChange(event.target.value)}
        placeholder="Search by task name"
      />
      <div className="btn-group mb-3" role="group" aria-label="Filter tasks">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`btn ${
              filter === value ? 'btn-primary' : 'btn-outline-primary'
            }`}
            aria-pressed={filter === value}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted" aria-live="polite">
          {totalTaskCount - completedTaskCount} active · {completedTaskCount}{' '}
          completed
        </small>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onClearCompleted}
          disabled={completedTaskCount === 0}
        >
          Clear Completed
        </button>
      </div>
      <ul className="list-group">
        {tasks.length === 0 ? (
          <li className="list-group-item text-center text-muted">
            No tasks to show.
          </li>
        ) : (
          tasks.map((task) => (
            <li
              key={task.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div className="task-content d-grid align-items-center gap-2 flex-grow-1 me-2">
                <input
                  type="checkbox"
                  className="form-check-input me-2"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  aria-label={`Mark ${task.text} as ${
                    task.completed ? 'active' : 'completed'
                  }`}
                />
                {editingId === task.id ? (
                  <form
                    className="task-edit-form"
                    onSubmit={(event) => saveEdit(event, task.id)}
                  >
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={editedText}
                      onChange={(event) => setEditedText(event.target.value)}
                      aria-label={`Edit ${task.text}`}
                      autoFocus
                    />
                  </form>
                ) : (
                  <>
                    <span
                      className={
                        task.completed
                          ? 'text-muted text-decoration-line-through'
                          : ''
                      }
                    >
                      {task.text}
                    </span>
                    <span className={getBadgeClass(task.priority)}>
                      {task.priority || 'Medium'}
                    </span>
                  </>
                )}
              </div>
              <div className="d-flex gap-2">
                {editingId === task.id ? (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={(event) => saveEdit(event, task.id)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => startEditing(task)}
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onDeleteTask(task.id)}
                  aria-label={`Delete ${task.text}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </>
  );
}

export default TaskList;
