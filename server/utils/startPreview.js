process.env.CORS_ORIGIN = 'http://localhost:5000,http://127.0.0.1:5000,http://localhost:5173,http://127.0.0.1:5173';
import express from 'express';
import path from 'path';
import apiRouter from '../routes/index.js';
import cookieParser from 'cookie-parser';
import { configureCors } from '../middleware/security.js';

// Setup isolated preview server
const previewApp = express();
previewApp.use(express.json());
previewApp.use(cookieParser());
previewApp.use(configureCors());

// Mount backend API gateway routes
previewApp.use('/api', apiRouter);

// Serve static compiled frontend assets
previewApp.use(express.static(path.join(process.cwd(), 'dist')));

// SPA fallback routing
previewApp.get('/admin', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'admin', 'index.html'));
});
previewApp.get('/admin/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'admin', 'index.html'));
});
previewApp.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;

previewApp.listen(PORT, () => {
  console.log('\n==================================================');
  console.log('🚀 NATURE\'S ALCHEMY PREVIEW SERVER IS NOW LIVE');
  console.log('==================================================');
  console.log(`👉 Storefront Preview: http://localhost:${PORT}`);
  console.log(`👉 Admin Panel Preview: http://localhost:${PORT}/admin/`);
  console.log('==================================================\n');
});
