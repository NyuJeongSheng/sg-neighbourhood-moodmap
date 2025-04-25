// services/scraperService.js
const path = require('path');
const { spawn } = require('child_process');

const scraperPath = path.join(__dirname, '..', 'scripts', 'scraper.js');

function runScraper() {
  return new Promise((resolve, reject) => {
    console.log('\n[scraperService] Running scraper.js...');

    const scraper = spawn('node', [scraperPath]);

    scraper.stdout.on('data', (data) => {
      console.log(`[scraper.js stdout] ${data.toString().trim()}`);
    });

    scraper.stderr.on('data', (data) => {
      console.error(`[scraper.js stderr] ${data.toString().trim()}`);
    });

    scraper.on('close', (code) => {
      console.log(`[scraper.js] Exited with code ${code}`);
      code === 0
        ? resolve()
        : reject(new Error(`scraper.js failed with exit code ${code}`));
    });
  });
}

module.exports = { runScraper };
