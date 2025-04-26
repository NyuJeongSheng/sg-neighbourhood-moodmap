// chatController.js
import { getSentimentData, getCommentSentimentsData } from '../services/dataService.js';
import { generateResponse } from '../services/geminiService.js';

export async function handleChat(req, res) {
  const userMessage = req.body.message;

  try {
    const sentimentData = getSentimentData();
    const commentData = getCommentSentimentsData();

    const reply = await generateResponse(userMessage, sentimentData, commentData);
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(error.status).json({ error: error.errorDetails[1]["message"] });
  }
}
