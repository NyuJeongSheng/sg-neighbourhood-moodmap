// index.js
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Routes
import neighbourhoodRoute from './routes/neighbourhoodRoute.js';
import dataRoute from './routes/dataRoute.js';
import chatRoute from './routes/chatRoute.js';

// Services
import { processCSV } from './services/csvService.js';
import { runSentimentAnalysis } from './services/sentimentService.js';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static serving for JSON data
app.use('/files/processed', express.static(path.join(__dirname, 'data', 'processed')));
app.use('/files/raw', express.static(path.join(__dirname, 'data', 'raw')));

// API Routes
app.use('/api', neighbourhoodRoute);
app.use('/api', dataRoute);
app.use('/api', chatRoute);

// Root test route
app.get('/', (req, res) => {
  res.send('Server is up and running.');
});

const processedDir = path.join(__dirname, 'data', 'processed');
const sentimentPath = path.join(processedDir, 'neighbourhood_sentiment.json');
const customModelPath = path.join(__dirname, 'models', 'custom_model.pkl');
const vectorizerPath = path.join(__dirname, 'models', 'custom_vectorizer.pkl');

const trainCustomModelIfMissing = () => {
  return new Promise((resolve, reject) => {
    console.log('[BOOT] Custom model not found. Training...');
    exec('python ./scripts/custom_trainer.py', (error, stdout, stderr) => {
      if (error) {
        console.error('Custom model training failed:', stderr);
        reject(error);
      } else {
        console.log('Custom model training complete.');
        console.log(stdout);
        resolve();
      }
    });
  });
};

const startServer = async () => {
  try {
    // Ensure processed directory exists
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
      console.log('[BOOT] Created missing directory: data/processed');
    }

    // Step 1: Train custom model if not available
    const modelExists = fs.existsSync(customModelPath) && fs.existsSync(vectorizerPath);
    if (!modelExists) {
      await trainCustomModelIfMissing();
    } else {
      console.log('[BOOT] Custom model already exists. Skipping training.');
    }

    // Step 2: Run CSV + Sentiment pipeline if necessary
    if (!fs.existsSync(sentimentPath)) {
      console.log('[BOOT] neighbourhood_sentiment.json not found. Running CSV pipeline...');
      await processCSV();
      await runSentimentAnalysis('custom');
      console.log('[BOOT] CSV + Sentiment pipeline complete.');
    } else {
      console.log('[BOOT] neighbourhood_sentiment.json already exists. Skipping CSV pipeline.');
    }

    // Step 3: Start server
    app.listen(PORT, () => {
      console.log(`\nServer running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('[BOOT] Error during startup:', err);
  }
};

startServer();
