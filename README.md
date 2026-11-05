# To-Do frontend

## Run locally

Start the backend using the instructions in
[`todo-backend/README.md`](../../todo-backend/README.md), then install and run
the frontend:

```powershell
npm install
npm run dev
```

By default, the client connects to `http://localhost:5000/api`. To use another
API, configure `VITE_API_BASE_URL` in the Vite environment, for example:

```text
VITE_API_BASE_URL=https://api.example.com/api
```

Set this variable in the environment used for the production build as well;
Vite embeds it into the generated frontend bundle.

Create an account or sign in to manage private tasks. The session token and
selected light/dark theme are persisted in browser local storage.
