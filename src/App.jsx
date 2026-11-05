import { useEffect, useState } from 'react';
import QuoteBox from './components/QuoteBox';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import AuthForm from './components/AuthForm';
import './App.css';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

async function apiRequest(path, token, options = {}) {
  const headers = { ...options.headers };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The server returned an invalid response.');
  }
  if (!response.ok) {
    const error = new Error(payload.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function getToday() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [priority, setPriority] = useState('Medium');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('todo-token'));
  const [username, setUsername] = useState(() =>
    localStorage.getItem('todo-username'),
  );
  const [theme, setTheme] = useState(
    () => (localStorage.getItem('todo-theme') === 'dark' ? 'dark' : 'light'),
  );
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('todo-token')));
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('todo-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const controller = new AbortController();
    async function loadTasks() {
      try {
        const loadedTasks = await apiRequest('/tasks', token, {
          signal: controller.signal,
        });
        if (!Array.isArray(loadedTasks)) {
          throw new Error('The tasks response was not a list.');
        }
        setTasks(loadedTasks);
        setError('');
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message || 'Unable to load tasks.');
          if (requestError.status === 401) logout();
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadTasks();
    return () => controller.abort();
  }, [token]);

  function handleAuthenticated(authData) {
    localStorage.setItem('todo-token', authData.token);
    localStorage.setItem('todo-username', authData.user.username);
    setToken(authData.token);
    setUsername(authData.user.username);
    setTasks([]);
    setLoading(true);
    setError('');
  }

  function logout() {
    localStorage.removeItem('todo-token');
    localStorage.removeItem('todo-username');
    setToken(null);
    setUsername(null);
    setTasks([]);
    setLoading(false);
    setError('');
    setFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
  }

  function handleRequestError(requestError, fallback) {
    setError(requestError.message || fallback);
    if (requestError.status === 401) logout();
  }

  async function addTask(taskText, taskPriority, dueDate, category) {
    const text = taskText.trim();
    if (!text) return false;
    try {
      const newTask = await apiRequest('/tasks', token, {
        method: 'POST',
        body: JSON.stringify({
          text,
          priority: taskPriority,
          due_date: dueDate || null,
          category,
        }),
      });
      setTasks((currentTasks) => [...currentTasks, newTask]);
      setPriority('Medium');
      setError('');
      return true;
    } catch (requestError) {
      handleRequestError(requestError, 'Unable to add task.');
      return false;
    }
  }

  async function toggleTask(id) {
    const task = tasks.find((currentTask) => currentTask.id === id);
    if (!task) return;
    try {
      const savedTask = await apiRequest(`/tasks/${encodeURIComponent(id)}`, token, {
        method: 'PUT',
        body: JSON.stringify({ ...task, completed: !task.completed }),
      });
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === id ? savedTask : currentTask,
        ),
      );
      setError('');
    } catch (requestError) {
      handleRequestError(requestError, 'Unable to update task.');
    }
  }

  async function deleteTask(id) {
    try {
      await apiRequest(`/tasks/${encodeURIComponent(id)}`, token, {
        method: 'DELETE',
      });
      const remainingTasks = tasks.filter((task) => task.id !== id);
      setTasks(remainingTasks);
      if (
        categoryFilter !== 'all' &&
        !remainingTasks.some((task) => task.category === categoryFilter)
      ) {
        setCategoryFilter('all');
      }
      setError('');
      return true;
    } catch (requestError) {
      handleRequestError(requestError, 'Unable to delete task.');
      return false;
    }
  }

  async function updateTaskText(id, newText) {
    const text = newText.trim();
    const task = tasks.find((currentTask) => currentTask.id === id);
    if (!text || !task) return false;
    try {
      const savedTask = await apiRequest(`/tasks/${encodeURIComponent(id)}`, token, {
        method: 'PUT',
        body: JSON.stringify({ ...task, text }),
      });
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === id ? savedTask : currentTask,
        ),
      );
      setError('');
      return true;
    } catch (requestError) {
      handleRequestError(requestError, 'Unable to update task.');
      return false;
    }
  }

  async function clearCompletedTasks() {
    if (!window.confirm('Clear all completed tasks? This cannot be undone.')) {
      return;
    }

    try {
      await apiRequest('/tasks/completed', token, { method: 'DELETE' });
      const remainingTasks = tasks.filter((task) => !task.completed);
      setTasks(remainingTasks);
      if (
        categoryFilter !== 'all' &&
        !remainingTasks.some((task) => task.category === categoryFilter)
      ) {
        setCategoryFilter('all');
      }
      setError('');
    } catch (requestError) {
      handleRequestError(requestError, 'Unable to clear completed tasks.');
    }
  }

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedTaskCount = tasks.filter((task) => task.completed).length;
  const normalizedSearchQuery = searchQuery.toLowerCase();
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filter === 'active'
        ? !task.completed
        : filter === 'completed'
          ? task.completed
          : true;
    const matchesSearch = task.text
      .toLowerCase()
      .includes(normalizedSearchQuery);
    const matchesCategory =
      categoryFilter === 'all' || task.category === categoryFilter;
    return matchesStatus && matchesSearch && matchesCategory;
  });
  const sortedTasks = [...filteredTasks].sort((first, second) => {
    if (sortBy === 'dueDate') {
      if (!first.due_date) return second.due_date ? 1 : 0;
      if (!second.due_date) return -1;
      return first.due_date.localeCompare(second.due_date);
    }
    if (sortBy === 'priority') {
      const firstPriority = PRIORITY_ORDER[first.priority] ?? PRIORITY_ORDER.Medium;
      const secondPriority = PRIORITY_ORDER[second.priority] ?? PRIORITY_ORDER.Medium;
      return firstPriority - secondPriority;
    }
    return 0;
  });
  const completionPercentage = tasks.length
    ? Math.round((completedTaskCount / tasks.length) * 100)
    : 0;

  return (
    <main className="container mt-5 app-shell">
      {!token ? (
        <div className="row">
          <div className="col-md-6 mx-auto">
            <section className="card shadow-sm p-4 app-card">
              <h1 className="text-primary mb-3">To-Do List</h1>
              <AuthForm onAuthenticated={handleAuthenticated} />
            </section>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-8 col-lg-7 mx-auto">
            <section className="card shadow-sm p-4 app-card">
              <header className="app-header d-flex justify-content-between align-items-center gap-3 mb-3">
                <div>
                  <h1 className="text-primary mb-0">To-Do List</h1>
                  {username && <small className="text-muted">Signed in as {username}</small>}
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() =>
                      setTheme((currentTheme) =>
                        currentTheme === 'light' ? 'dark' : 'light',
                      )
                    }
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  >
                    {theme === 'light' ? 'Dark mode' : 'Light mode'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={logout}
                  >
                    Log out
                  </button>
                </div>
              </header>
              <QuoteBox />
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <TaskInput
                onAddTask={addTask}
                priority={priority}
                onPriorityChange={setPriority}
                disabled={loading}
              />
              <p className="text-muted mb-3">
                <strong>{activeCount}</strong>{' '}
                {activeCount === 1 ? 'task' : 'tasks'} remaining
              </p>
              <div className="task-progress mb-4">
                <div className="task-progress-label">
                  <span>Task progress</span>
                  <strong>{completionPercentage}% Completed</strong>
                </div>
                <div
                  className="task-progress-track"
                  role="progressbar"
                  aria-label="Task completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={completionPercentage}
                >
                  <div
                    className="task-progress-fill"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              {loading ? (
                <p role="status">Loading tasks...</p>
              ) : (
                <TaskList
                  tasks={sortedTasks}
                  filter={filter}
                  onFilterChange={setFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  categoryFilter={categoryFilter}
                  onCategoryFilterChange={setCategoryFilter}
                  categories={[...new Set(tasks.map((task) => task.category).filter(Boolean))].sort()}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onUpdateTaskText={updateTaskText}
                  onClearCompleted={clearCompletedTasks}
                  totalTaskCount={tasks.length}
                  completedTaskCount={completedTaskCount}
                  today={getToday()}
                />
              )}
            </section>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
