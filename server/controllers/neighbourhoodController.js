const fs = require('fs');
const path = require('path');

const COMMENTS_PATH = path.join(__dirname, '..', 'data', 'comment_sentiment_scores.json');
const CSV_PATH = path.join(__dirname, '..', 'data', 'dummy_data.csv');

const getAllComments = (req, res) => {
    const source = req.query.source || 'csv';

    try {
        if (source === 'online') {
            const data = JSON.parse(fs.readFileSync(REDDIT_PATH, 'utf-8'));
            return res.status(200).json(data);
        }

        const results = [];
        fs.createReadStream(CSV_PATH)
            .pipe(csv())
            .on('data', (row) => results.push(row))
            .on('end', () => {
                res.status(200).json(results);
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load comments.' });
    }
};

const getCommentsByNeighbourhood = (req, res) => {
    const { neighbourhood } = req.params;

    try {
        const rawData = fs.readFileSync(COMMENTS_PATH, 'utf-8');
        const comments = JSON.parse(rawData);

        const filtered = comments.filter(entry =>
            entry.matched_neighbourhoods.includes(neighbourhood.toLowerCase())
        );

        res.status(200).json({ count: filtered.length, results: filtered });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load or parse comment data.' });
    }
};

module.exports = {
    getCommentsByNeighbourhood,
    getAllComments
};
