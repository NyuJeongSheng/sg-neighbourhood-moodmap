// services/csvService.js
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

const inputPath = path.join(__dirname, '..', 'data', 'dummy_data.csv');
const outputPath = path.join(__dirname, '..', 'data', 'neighbourhood_comments.json');

async function processCSV() {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(inputPath)
      .pipe(csvParser())
      .on('data', (row) => {
        if (row.comment && row.neighbourhood && row.timestamp) {
          results.push({
            comment: row.comment,
            neighbourhood: row.neighbourhood,
            timestamp: new Date(row.timestamp).toISOString(),
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

module.exports = {
  processCSV,
};
