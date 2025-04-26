// services/dataService.js
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processedDir = path.join(__dirname, '..', 'data', 'processed');

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
export function getCommentSentimentsData() {
  return readJSON('comment_sentiment_scores.json');
}

export function getSentimentData() {
  return readJSON('neighbourhood_sentiment.json');
}

export function getCommentsData() {
  return readJSON('neighbourhood_comments.json');
}
