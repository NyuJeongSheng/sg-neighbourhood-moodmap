// fileWatcher.js
const fs = require('fs');
const path = require('path');
const { runSentimentAnalysis } = require('./sentimentService');

const redditJsonPath = path.join(__dirname, '../data/neighbourhood_comments.json');
let isWatching = false;

function watchRedditJson() {
  if (isWatching) return;

  fs.watchFile(redditJsonPath, (curr, prev) => {
    console.log('[Watcher] File changed. Running sentiment analysis...');
    runSentimentAnalysis().catch(console.error);
  });

  isWatching = true;
  console.log('[Watcher] Started watching neighbourhood_comments.json');
}

module.exports = { watchRedditJson };
