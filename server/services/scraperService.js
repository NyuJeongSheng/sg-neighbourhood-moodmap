// services/scraperService.js
import { fileURLToPath } from 'url';
import path from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scraperPath = path.join(__dirname, '..', 'scripts', 'scraper.js');

export function runScraper() {
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
