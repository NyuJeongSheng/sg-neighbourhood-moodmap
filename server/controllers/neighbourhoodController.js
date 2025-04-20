const fs = require('fs');
const path = require('path');

const COMMENTS_PATH = path.join(__dirname, '..', 'data', 'comment_sentiment_scores.json');

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
};
