// services/sentimentService.js
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const analyzerScript = path.join(__dirname, '..', 'scripts', 'sentiment_analysis.py');

export function runSentimentAnalysis(model = 'vader') {
  return new Promise((resolve, reject) => {
    console.log(`\n[sentimentService] Running sentiment_analysis.py with model: ${model}`);

    const py = spawn('python', [analyzerScript, '--model', model]);

    py.stdout.on('data', (data) => {
      console.log(`[sentiment.py stdout] ${data.toString().trim()}`);
    });

    py.stderr.on('data', (data) => {
      console.error(`[sentiment.py stderr] ${data.toString().trim()}`);
    });

    py.on('close', (code) => {
      console.log(`[sentiment.py] Exited with code ${code}`);
      code === 0
        ? resolve()
        : reject(new Error(`Analyzer exited with code ${code}`));
    });
  });
}
