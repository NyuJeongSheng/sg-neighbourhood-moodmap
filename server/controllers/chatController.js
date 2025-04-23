const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = 'AIzaSyBO2zhrKgYzqhIi3ht_NXj5ju8ppQA5WVM';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const handleChat = async (req, res) => {
  const userMessage = req.body.message;
  const sentimentPath = path.join(__dirname, '../data/neighbourhood_sentiment.json');
  const commentPath = path.join(__dirname, '../data/comment_sentiment_scores.json');
  const fullSentimentText = fs.readFileSync(sentimentPath, 'utf-8');
  const fullCommentText = fs.readFileSync(commentPath, 'utf-8');

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
    You are a helpful assistant that recommends Singapore neighbourhoods based on sentiment analysis of user comments.
    
    The following two datasets are provided in JSON format:
    1. Neighbourhood Sentiment Scores (normalized between -1 and 1): 
    ${fullSentimentText}
    
    2. Individual Comment Sentiment Results (for context and justification):
    ${fullCommentText}
    
    Please answer the user's question below using only the data provided. Do not make assumptions beyond the scope of the data.
    
    User question:
    "${userMessage}"
    
    Instructions:
    - Only reference neighbourhoods or comments that exist in the data.
    - Avoid speculation or general advice.
    - Provide responses that are factual, concise, and grounded in the data.
    - If insufficient data exists to answer the question, say so clearly.
    
    Respond in a clear and concise tone.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Gemini error:', error.message || error);
    res.status(500).json({ error: 'Gemini API failed to respond' });
  }
};

module.exports = { handleChat };
