// server/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const path = require('path');
const PORT = 5000;
const {spawn } = require('child_process');

// Paths
const scraperPath = path.join(__dirname, 'scripts', 'scraper.js');
const analyzerScript = path.join(__dirname, 'scripts', 'sentiment_analysis.py');
const redditJsonPath = path.join(__dirname, 'data', 'reddit_housing_comments.json');

app.use(cors());

app.get('/', (req, res) => {
    res.send('Server is up and running.');
});

// apis needed
// filter by neighbourhood
// filter by north/south/east/west  (?)
// filter by positive/ negative comments

// === Run scraper function ===
function runScraper() {
    console.log('\nRunning scraper.js...');
    const scraper = spawn('node', [scraperPath]);

    scraper.stdout.on('data', (data) => {
        console.log(`${data.toString().trim()}`);
    });

    scraper.stderr.on('data', (data) => {
        console.error(`scraper.js error:\n${data.toString().trim()}`);
    });

    scraper.on('close', (code) => {
        console.log(`scraper.js exited with code ${code}`);
    });
}

// === Run analyzer function ===
function runAnalyzer() {
    console.log('\nRunning sentiment_analysis.py...');
    const py = spawn('python', [analyzerScript]);

    py.stdout.on('data', (data) => {
        console.log(`Output: ${data.toString().trim()}`);
    });

    py.stderr.on('data', (data) => {
        console.error(`Python error: ${data.toString().trim()}`);
    });

    py.on('close', (code) => {
        console.log(`sentiment_analysis.py exited with code ${code}`);
    });
}

// === Watch JSON file for changes ===
fs.watchFile(redditJsonPath, { interval: 1000 }, (curr, prev) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
        console.log('\nreddit_housing_comments.json changed. Running analyzer...');
        runAnalyzer();
    }
});

// === Start server first ===
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Then start scraper
    runScraper();
    setInterval(runScraper, 15000); // every 15s
});
