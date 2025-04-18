const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

const neighbourhoodRoute = require('./routes/neighbourhoodRoute.js'); // <-- your custom routes
const dataRoute = require('./routes/dataRoute.js');

const { processCSV } = require('./services/csvService');
const { runSentimentAnalysis } = require('./services/sentimentService');
const { watchRedditJson } = require('./services/fileWatcher.js');

app.use(cors());

app.use('/api', neighbourhoodRoute); // <-- mount them at /api
app.use('/api', dataRoute);

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
});