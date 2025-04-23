const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

const neighbourhoodRoute = require('./routes/neighbourhoodRoute.js'); // <-- your custom routes
const dataRoute = require('./routes/dataRoute.js');
const chatRoute = require('./routes/chatRoute.js');

const { processCSV } = require('./services/csvService');
const { runSentimentAnalysis } = require('./services/sentimentService');
const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(express.json());

app.use('/api', neighbourhoodRoute); // <-- mount them at /api
app.use('/api', dataRoute);
app.use('/api', chatRoute);

app.get('/', (req, res) => {
    res.send('Server is up and running.');
});

// === Start server first ===
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // watchRedditJson();               // start the file watcher
    // runScraper().catch(console.error);
    // setInterval(() => {
    //     runScraper().catch(console.error);
    // }, 15000);

    // Startup data pipeline
    // (async () => {
    //     try {
    //         watchRedditJson();
    //         console.log('Processing CSV...');
    //         await processCSV();

    //         console.log('CSV + Sentiment pipeline complete.');
    //     } catch (err) {
    //         console.error('Error during startup:', err);
    //     }
    // })();

    const sentimentPath = path.join(__dirname, 'data', 'neighbourhood_sentiment.json');

    (async () => {
        try {
            // If sentiment file doesn't exist, run CSV processing
            if (!fs.existsSync(sentimentPath)) {
                console.log('[BOOT] neighbourhood_sentiment.json not found. Running CSV pipeline...');
                await processCSV();
                await runSentimentAnalysis('csv');
                console.log('[BOOT] CSV + Sentiment pipeline complete.');
            } else {
                console.log('[BOOT] neighbourhood_sentiment.json already exists. Skipping CSV pipeline.');
            }

            // Start watcher for online mode (optional)
            // watchRedditJson();
        } catch (err) {
            console.error('[BOOT] Error during startup:', err);
        }
    })();
});