const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

const apiRoutes = require('./routes/neighbourhoodRoute.js'); // <-- your custom routes

const { watchRedditJson } = require('./services/fileWatcher');
const { runScraper } = require('./services/scraperService');

app.use(cors());

app.use('/api', apiRoutes); // <-- mount them at /api

app.get('/', (req, res) => {
    res.send('Server is up and running.');
});

// === Start server first ===
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

    watchRedditJson();               // start the file watcher
    runScraper().catch(console.error);
    setInterval(() => {
        runScraper().catch(console.error);
    }, 15000);
});