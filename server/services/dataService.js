// services/dataService.js
const fs = require('fs');
const path = require('path');

const processedDir = path.join(__dirname, '../data/processed');

// Ensure the directories exist
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
}

// Helper to read and parse a JSON file from the processed data directory
const readJSON = (filename) => {
  const filePath = path.join(processedDir, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// Public functions to get datasets
const getCommentSentimentsData = () => readJSON('comment_sentiment_scores.json');
const getSentimentData = () => readJSON('neighbourhood_sentiment.json');
const getCommentsData = () => readJSON('neighbourhood_comments.json');

module.exports = {
  getCommentSentimentsData,
  getSentimentData,
  getCommentsData,
};
