// controllers/neighbourhoodController.js
import { getCommentSentimentsData } from '../services/dataService.js';

export function getCommentsByNeighbourhood(req, res) {
  const { neighbourhood } = req.params;

  try {
    const comments = getCommentSentimentsData();
    const filtered = comments.filter(entry =>
      entry.matched_neighbourhoods.includes(neighbourhood.toLowerCase())
    );

    res.status(200).json({ count: filtered.length, results: filtered });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load or parse comment data. Error: ' + err });
  }
}
