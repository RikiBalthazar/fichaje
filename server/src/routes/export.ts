import express from 'express';
import { exportToTxt } from '../controllers/exportController.js';

const router = express.Router();

router.get('/txt', exportToTxt);

export default router;
