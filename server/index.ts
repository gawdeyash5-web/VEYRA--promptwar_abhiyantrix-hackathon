import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve Vite production build static assets in production (for Cloud Run / Docker)
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Run HTTP listener only when running directly (standalone Node.js / Docker / Cloud Run)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`⚡ VEYRA Event OS Server running on port ${PORT}`);
  });
}

export default app;
