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
      You are a helpful assistant that recommends Singapore neighbourhoods based on sentiment data.

      Here is the full neighbourhood sentiment JSON:
      ${fullSentimentText}

      Here is the full comment sentiment JSON:
      ${fullCommentText}

      Now, based on all of the above, answer the following user question:
      "${userMessage}"

      Respond clearly and concisely.
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
