import { useState } from 'react';

function TaskInput({
  onAddTask,
  priority,
  onPriorityChange,
  disabled = false,
}) {
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Personal');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const taskText = newTask.trim();
    if (taskText === '' || submitting) return;

    setSubmitting(true);
    try {
      if (await onAddTask(taskText, priority, dueDate, category)) {
        setNewTask('');
        setDueDate('');
        setCategory('Personal');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label htmlFor="task-input" className="form-label">
        Enter a task
      </label>
      <div className="input-group">
        <input
          id="task-input"
          type="text"
          className="form-control"
          value={newTask}
          onChange={(event) => setNewTask(event.target.value)}
          placeholder="What needs to be done?"
          disabled={disabled || submitting}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={disabled || submitting}
        >
          Add Task
        </button>
      </div>
      <label htmlFor="task-priority" className="form-label mt-3">
        Priority
      </label>
      <select
        id="task-priority"
        className="form-select"
        value={priority}
        onChange={(event) => onPriorityChange(event.target.value)}
        disabled={disabled || submitting}
      >
        <option value="High">High Priority</option>
        <option value="Medium">Medium Priority</option>
        <option value="Low">Low Priority</option>
      </select>
      <label htmlFor="task-due-date" className="form-label mt-3">
        Due date
      </label>
      <input
        id="task-due-date"
        type="date"
        className="form-control"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
        disabled={disabled || submitting}
      />
      <label htmlFor="task-category" className="form-label mt-3">
        Category
      </label>
      <select
        id="task-category"
        className="form-select"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        disabled={disabled || submitting}
      >
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
        <option value="Shopping">Shopping</option>
        <option value="Other">Other</option>
      </select>
    </form>
  );
}

export default TaskInput;
