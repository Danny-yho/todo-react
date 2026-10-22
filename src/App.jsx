import { useEffect, useState } from 'react';
import QuoteBox from './components/QuoteBox';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const completedTaskCount = tasks.filter((task) => task.completed).length;
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      try {
        const response = await fetch('http://localhost:5000/api/tasks', {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Unable to load tasks (${response.status})`);
        }

        const loadedTasks = await response.json();
        if (!Array.isArray(loadedTasks)) {
          throw new Error('The tasks response was not a list.');
        }
        setTasks(loadedTasks);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message || 'Unable to load tasks.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTasks();
    return () => controller.abort();
  }, []);

  async function addTask(taskText) {
    const text = taskText.trim();
    if (text === '') return false;

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        throw new Error(`Unable to add task (${response.status})`);
      }

      const newTask = await response.json();
      setTasks((currentTasks) => [...currentTasks, newTask]);
      setError('');
      return true;
    } catch (requestError) {
      setError(requestError.message || 'Unable to add task.');
      return false;
    }
  }

  async function toggleTask(id) {
    const task = tasks.find((currentTask) => currentTask.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${encodeURIComponent(id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        },
      );
      if (!response.ok) {
        throw new Error(`Unable to update task (${response.status})`);
      }

      const savedTask = await response.json();
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === id ? savedTask : currentTask,
        ),
      );
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to update task.');
    }
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      );
      if (!response.ok) {
        throw new Error(`Unable to delete task (${response.status})`);
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id),
      );
      setError('');
      return true;
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete task.');
      return false;
    }
  }

  async function updateTaskText(id, newText) {
    const text = newText.trim();
    if (text === '') return false;

    const task = tasks.find((currentTask) => currentTask.id === id);
    if (!task) return false;

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${encodeURIComponent(id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...task, text }),
        },
      );
      if (!response.ok) {
        throw new Error(`Unable to update task (${response.status})`);
      }

      const savedTask = await response.json();
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === id ? savedTask : currentTask,
        ),
      );
      setError('');
      return true;
    } catch (requestError) {
      setError(requestError.message || 'Unable to update task.');
      return false;
    }
  }

  async function clearCompletedTasks() {
    const completedTasks = tasks.filter((task) => task.completed);
    await Promise.all(completedTasks.map((task) => deleteTask(task.id)));
  }

  return (
    <main className="container mt-5">
      <div className="row">
        <div className="col-md-6 mx-auto">
          <section className="card shadow-sm p-4">
            <QuoteBox />
            <h1 className="text-primary mb-4">To-Do List</h1>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <TaskInput onAddTask={addTask} disabled={loading} />
            {loading ? (
              <p role="status">Loading tasks...</p>
            ) : (
              <TaskList
                tasks={filteredTasks}
                filter={filter}
                onFilterChange={setFilter}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onUpdateTaskText={updateTaskText}
                onClearCompleted={clearCompletedTasks}
                totalTaskCount={tasks.length}
                completedTaskCount={completedTaskCount}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;