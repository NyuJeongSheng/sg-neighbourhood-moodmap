const path = require('path');
const { spawn } = require('child_process');

const analyzerScript = path.join(__dirname, '..', 'scripts', 'sentiment_analysis.py');

function runSentimentAnalysis() {
    return new Promise((resolve, reject) => {
        console.log('\nRunning sentiment_analysis.py...');
        const py = spawn('python', [analyzerScript]);

        py.stdout.on('data', (data) => {
            console.log(`Output: ${data.toString().trim()}`);
        });

        py.stderr.on('data', (data) => {
            console.error(`Python error: ${data.toString().trim()}`);
        });

        py.on('close', (code) => {
            console.log(`sentiment_analysis.py exited with code ${code}`);
            code === 0 ? resolve() : reject(new Error(`Analyzer exited with code ${code}`));
        });
    });
}

module.exports = { runSentimentAnalysis };
