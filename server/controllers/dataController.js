const { runScraper } = require('../services/scraperService');
const { processCSV } = require('../services/csvService');
const { runSentimentAnalysis } = require('../services/sentimentService');

const runScraperAndAnalyze = async (req, res) => {
    try {
        const model = req.body.model || 'vader';
        await runScraper();
        await runSentimentAnalysis(model);
        res.status(200).json({ message: 'Scraper and analysis complete. Watcher started.' });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to run scraper and sentiment analyzer.' });
    }
};

const runCSVProcessing = async (req, res) => {
    try {
        const model = req.body.model || 'vader';
        await processCSV();
        await runSentimentAnalysis(model);
        res.status(200).json({ message: 'CSV data processed successfully and analysis complete.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process CSV data.' });
    }
};

module.exports = {
    runScraperAndAnalyze,
    runCSVProcessing
};
