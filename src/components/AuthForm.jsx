import { useState } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Unable to ${mode} (${response.status})`);
      }
      onAuthenticated(result);
    } catch (requestError) {
      setError(requestError.message || `Unable to ${mode}.`);
    } finally {
      setSubmitting(false);
    }
  }

  const isRegistering = mode === 'register';

  return (
    <>
      <p className="text-muted">
        {isRegistering
          ? 'Create an account to keep your tasks private.'
          : 'Sign in to access your tasks.'}
      </p>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="auth-username" className="form-label">
          Username
        </label>
        <input
          id="auth-username"
          className="form-control mb-3"
          type="text"
          autoComplete="username"
          minLength={3}
          maxLength={32}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          disabled={submitting}
        />
        <label htmlFor="auth-password" className="form-label">
          Password
        </label>
        <input
          id="auth-password"
          className="form-control mb-3"
          type="password"
          autoComplete={isRegistering ? 'new-password' : 'current-password'}
          minLength={8}
          maxLength={72}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={submitting}
        />
        <button
          className="btn btn-primary w-100"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? 'Please wait...'
            : isRegistering
              ? 'Create account'
              : 'Log in'}
        </button>
      </form>
      <p className="text-center mt-3 mb-0">
        {isRegistering ? 'Already have an account?' : 'New here?'}{' '}
        <button
          type="button"
          className="btn btn-link p-0 align-baseline"
          onClick={() => {
            setMode(isRegistering ? 'login' : 'register');
            setError('');
          }}
          disabled={submitting}
        >
          {isRegistering ? 'Log in' : 'Create an account'}
        </button>
      </p>
    </>
  );
}

export default AuthForm;
