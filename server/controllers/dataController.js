const { runScraper } = require('../services/scraperService');
const { runSentimentAnalysis } = require('../services/sentimentService');
const { watchRedditJson } = require('../services/fileWatcher'); // ✅ import here
const { processCSV } = require('../services/csvService');

const runScraperAndAnalyze = async (req, res) => {
    try {
        await runScraper();
        await runSentimentAnalysis();
        watchRedditJson(); // ✅ start watcher only after first scrape
        res.status(200).json({ message: 'Scraper, analysis complete. Watcher started.' });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to run scraper and sentiment analyzer.' });
    }
};

const runCSVProcessing = async (req, res) => {
    try {
        await processCSV();
        res.status(200).json({ message: 'CSV data processed successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process CSV data.' });
    }
};

module.exports = {
    runScraperAndAnalyze,
    runCSVProcessing
};
