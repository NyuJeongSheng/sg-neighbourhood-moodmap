const express = require('express');
const router = express.Router();
const { getCommentsByNeighbourhood, getAllComments } = require('../controllers/neighbourhoodController.js');

router.get('/comments', getAllComments);

router.get('/comments/:neighbourhood', getCommentsByNeighbourhood);

module.exports = router;
