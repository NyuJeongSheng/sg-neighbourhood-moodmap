// server/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

const { watchRedditJson } = require('./services/fileWatcher');
const { runScraper } = require('./services/scraperService');

app.use(cors());

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