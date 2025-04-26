// controllers/dataController.js
import { runScraper } from '../services/scraperService.js';
import { processCSV } from '../services/csvService.js';
import { runSentimentAnalysis } from '../services/sentimentService.js';

export async function runScraperAndAnalyze(req, res) {
    try {
        const model = req.body.model || 'vader';
        await runScraper();
        await runSentimentAnalysis(model);
        res.status(200).json({ message: 'Scraper and analysis complete. Watcher started.' });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to run scraper and sentiment analyzer.' });
    }
}

export async function runCSVProcessing(req, res) {
    try {
        const model = req.body.model || 'vader';
        await processCSV();
        await runSentimentAnalysis(model);
        res.status(200).json({ message: 'CSV data processed successfully and analysis complete.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process CSV data. Error: ' + err });
    }
}
