import express from 'express';
import {
  getAllTimeEntries,
  getTimeEntriesByProject,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry
} from '../controllers/timeEntriesController.js';

const router = express.Router();

router.get('/', getAllTimeEntries);
router.get('/project/:projectId', getTimeEntriesByProject);
router.post('/', createTimeEntry);
router.put('/:id', updateTimeEntry);
router.delete('/:id', deleteTimeEntry);

export default router;
