const { getCommentSentimentsData } = require('../services/dataService');

const getCommentsByNeighbourhood = (req, res) => {
    const { neighbourhood } = req.params;

    try {
        const comments = getCommentSentimentsData();
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
