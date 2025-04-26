// routes/dataRoute.js
import express from 'express';
import { runScraperAndAnalyze, runCSVProcessing } from '../controllers/dataController.js';

const router = express.Router();

router.post('/scrape', runScraperAndAnalyze);
router.post('/process-csv', runCSVProcessing);

export default router;
