// services/csvService.js
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '..', 'data', 'raw', 'dummy_data.csv');
const outputPath = path.join(__dirname, '..', 'data', 'processed', 'neighbourhood_comments.json');

export async function processCSV() {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(inputPath)
      .pipe(csvParser())
      .on('data', (row) => {
        const { comment, neighbourhood, timestamp } = row;
        if (comment && neighbourhood && timestamp) {
          results.push({
            comment,
            neighbourhood,
            timestamp: new Date(Number(timestamp)).toISOString()
          });
        }
      })
      .on('end', () => {
        const newContent = JSON.stringify(results, null, 2);

        let currentContent = null;
        if (fs.existsSync(outputPath)) {
          currentContent = fs.readFileSync(outputPath, 'utf-8');
        }

        if (currentContent !== newContent) {
          fs.writeFileSync(outputPath, newContent);
          console.log(`[csvService] File updated: ${outputPath}`);
        } else {
          console.log(`[csvService] No changes detected.`);
        }

        resolve();
      })
      .on('error', (err) => reject(err));
  });
}
