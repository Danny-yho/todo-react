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
  sortBy,
  onSortChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  searchQuery,
  onSearchQueryChange,
  onToggleTask,
  onDeleteTask,
  onUpdateTaskText,
  onClearCompleted,
  totalTaskCount,
  completedTaskCount,
  today,
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
      <div className="task-controls">
        <div className="task-status-filters mb-3" role="group" aria-label="Filter tasks">
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
        <div className="category-filters mb-3" role="group" aria-label="Filter by category">
          {['all', ...categories].map((category) => (
            <button
              key={category}
              type="button"
              className={`btn btn-sm ${
                categoryFilter === category
                  ? 'btn-secondary'
                  : 'btn-outline-secondary'
              }`}
              aria-pressed={categoryFilter === category}
              onClick={() => onCategoryFilterChange(category)}
            >
              {category === 'all' ? 'All categories' : category}
            </button>
          ))}
        </div>
        <div className="task-sort-control">
          <label htmlFor="task-sort" className="form-label mb-0">
            Sort by
          </label>
          <select
            id="task-sort"
            className="form-select form-select-sm"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <option value="default">Added order</option>
            <option value="dueDate">Due date (closest first)</option>
            <option value="priority">Priority (high to low)</option>
          </select>
        </div>
        <div className="task-summary-bar">
          <small className="text-muted" aria-live="polite">
            {totalTaskCount - completedTaskCount} active · {completedTaskCount}{' '}
            completed
          </small>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm clear-completed-button"
            onClick={onClearCompleted}
            disabled={completedTaskCount === 0}
          >
            Clear Completed
          </button>
        </div>
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
              className="list-group-item task-list-item"
            >
              <div className="task-content">
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
                  <div className="task-details">
                    <span
                      className={
                        task.completed
                            ? 'task-text is-completed'
                            : 'task-text'
                      }
                    >
                      {task.text}
                    </span>
                    <div className="task-meta d-flex flex-wrap gap-2 mt-2">
                      <span className={getBadgeClass(task.priority)}>
                        {task.priority || 'Medium'}
                      </span>
                      <span className="badge bg-secondary">
                        {task.category || 'Personal'}
                      </span>
                      {task.due_date && (
                        <time
                          className={`badge ${
                            !task.completed && task.due_date < today
                              ? 'bg-danger'
                              : 'bg-light text-dark due-date-badge'
                          }`}
                          dateTime={task.due_date}
                        >
                          Due {task.due_date}
                          {!task.completed && task.due_date < today
                            ? ' · Overdue'
                            : ''}
                        </time>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="task-actions">
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
