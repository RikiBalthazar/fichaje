import express from 'express';
import { exportJSON, importJSON, getAuditLogs } from '../controllers/backupController.js';

const router = express.Router();

// Exportar datos como JSON
router.get('/json', exportJSON);

// Importar datos desde JSON
router.post('/json', importJSON);

// Obtener logs de auditoría
router.get('/audit-logs', getAuditLogs);

export default router;
