// routes/neighbourhoodRoute.js
import express from 'express';
import { getCommentsByNeighbourhood } from '../controllers/neighbourhoodController.js';

const router = express.Router();

router.get('/comments/:neighbourhood', getCommentsByNeighbourhood);

export default router;
