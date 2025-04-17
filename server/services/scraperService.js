const path = require('path');
const { spawn } = require('child_process');

const scraperPath = path.join(__dirname, '..', 'scripts', 'scraper.js');

function runScraper() {
    return new Promise((resolve, reject) => {
        console.log('\nRunning scraper.js...');
        const scraper = spawn('node', [scraperPath]);

        scraper.stdout.on('data', (data) => {
            console.log(`${data.toString().trim()}`);
        });

        scraper.stderr.on('data', (data) => {
            console.error(`scraper.js error:\n${data.toString().trim()}`);
        });

        scraper.on('close', (code) => {
            console.log(`scraper.js exited with code ${code}`);
            code === 0 ? resolve() : reject(new Error(`Scraper exited with code ${code}`));
        });
    });
}

module.exports = { runScraper };
