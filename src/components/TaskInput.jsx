import { useState } from 'react';

function TaskInput({
  onAddTask,
  priority,
  onPriorityChange,
  disabled = false,
}) {
  const [newTask, setNewTask] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const taskText = newTask.trim();
    if (taskText === '' || submitting) return;

    setSubmitting(true);
    try {
      if (await onAddTask(taskText, priority)) {
        setNewTask('');
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
    </form>
  );
}

export default TaskInput;
