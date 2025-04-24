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

const { exec } = require('child_process');
const customModelPath = path.join(__dirname, 'models', 'custom_model.pkl');
const vectorizerPath = path.join(__dirname, 'models', 'custom_vectorizer.pkl');

app.use(cors());
app.use(express.json());

app.use('/api', neighbourhoodRoute); // <-- mount them at /api
app.use('/api', dataRoute);
app.use('/api', chatRoute);

app.get('/', (req, res) => {
  res.send('Server is up and running.');
});

const startServer = async () => {
  const processedDir = path.join(__dirname, 'data', 'processed');
  const sentimentPath = path.join(processedDir, 'neighbourhood_sentiment.json');

  try {

    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
      console.log('[BOOT] Created missing directory: data/processed');
    }

    // 1. Check if custom model needs training
    if (!fs.existsSync(customModelPath) || !fs.existsSync(vectorizerPath)) {
      console.log('[BOOT] Custom model not found. Training...');

      await new Promise((resolve, reject) => {
        exec('python ./scripts/custom_trainer.py', (error, stdout, stderr) => {
          if (error) {
            console.error('Custom model training failed:', stderr);
            return reject(error);
          } else {
            console.log('Custom model training complete.');
            console.log(stdout);
            return resolve();
          }
        });
      });
    } else {
      console.log('Custom model already exists. Skipping training.');
    }

    // 2. Run CSV + Sentiment Pipeline
    if (!fs.existsSync(sentimentPath)) {
      console.log('[BOOT] neighbourhood_sentiment.json not found. Running CSV pipeline...');
      await processCSV();
      await runSentimentAnalysis('custom');
      console.log('[BOOT] CSV + Sentiment pipeline complete.');
    } else {
      console.log('[BOOT] neighbourhood_sentiment.json already exists. Skipping CSV pipeline.');
    }

    // 3. Start server only after all above is successful
    app.listen(PORT, () => {
      console.log(`\nServer running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[BOOT] Error during startup:', err);
  }
};

startServer();