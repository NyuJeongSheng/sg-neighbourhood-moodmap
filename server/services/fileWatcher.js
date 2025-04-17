const fs = require('fs');
const path = require('path');
const { runSentimentAnalysis } = require('./sentimentService');

function watchRedditJson() {
    const redditJsonPath = path.join(__dirname, '..', 'data', 'reddit_housing_comments.json');

    fs.watchFile(redditJsonPath, { interval: 1000 }, (curr, prev) => {
        if (curr.mtimeMs !== prev.mtimeMs) {
            console.log('\nreddit_housing_comments.json changed. Running analyzer...');
            runSentimentAnalysis().catch(console.error);
        }
    });

    console.log(`\nWatching ${redditJsonPath} for changes...`);
}

module.exports = { watchRedditJson };
