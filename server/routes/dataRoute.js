const express = require('express');
const router = express.Router();
const { runScraperAndAnalyze, runCSVProcessing } = require('../controllers/dataController');

router.post('/scrape', runScraperAndAnalyze);
router.post('/process-csv', runCSVProcessing);

module.exports = router;
