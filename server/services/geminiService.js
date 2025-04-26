// services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateResponse(userMessage, sentimentData, commentData) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please check your .env file.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
    You are a helpful assistant that recommends Singapore neighbourhoods based on sentiment analysis of user comments.

    The following two datasets are provided in JSON format:
    1. Neighbourhood Sentiment Scores (normalized between -1 and 1): 
    ${JSON.stringify(sentimentData)}

    2. Individual Comment Sentiment Results (for context and justification):
    ${JSON.stringify(commentData)}

    Please answer the user's question below using only the data provided. Do not make assumptions beyond the scope of the data.

    User question:
    "${userMessage}"

    Instructions:
    - Only reference neighbourhoods or comments that exist in the data.
    - Avoid speculation or general advice.
    - Provide responses that are factual, concise, and grounded in the data.
    - If insufficient data exists to answer the question, say so clearly.

    Respond in a clear and concise tone.`;

  const result = await model.generateContent(prompt);
  return await result.response.text();
}
