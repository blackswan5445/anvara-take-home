import app from './app.js';

const PORT = process.env.BACKEND_PORT || 4291;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
