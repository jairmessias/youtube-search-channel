// API base URL: same-origin '/api' proxy (nginx handles it both locally and in production).
window.API_BASE = window.location.protocol === 'file:' ? 'http://localhost:8000' : '/api';