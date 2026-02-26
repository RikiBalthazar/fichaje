import express from 'express';
import { getTimerState, startTimer, pauseTimer, stopTimer } from '../controllers/timerController.js';

const router = express.Router();

router.get('/state', getTimerState);
router.post('/start', startTimer);
router.post('/pause', pauseTimer);
router.post('/stop', stopTimer);

export default router;
