import express from 'express';
import cors from 'cors';
import { initDb, closeDb } from './database/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import projectsRouter from './routes/projects.js';
import timeEntriesRouter from './routes/timeEntries.js';
import exportRouter from './routes/export.js';
import templatesRouter from './routes/templates.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/projects', projectsRouter);
app.use('/api/time-entries', timeEntriesRouter);
app.use('/api/export', exportRouter);
app.use('/api/templates', templatesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Iniciar servidor
 */
async function startServer() {
  try {
    // Inicializar base de datos
    await initDb();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n✅ Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📚 API base: http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

/**
 * Manejo de cierre gracioso
 */
process.on('SIGINT', async () => {
  console.log('\n👋 Cerrando servidor...');
  await closeDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Cerrando servidor...');
  await closeDb();
  process.exit(0);
});

startServer();
