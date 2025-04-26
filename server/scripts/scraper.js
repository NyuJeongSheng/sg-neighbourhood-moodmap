import fetch from 'node-fetch';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import btoa from 'btoa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Config ===
const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET is not set. Please check your .env file.');
}

const POST_IDS = ['137jihc', '1htiqn3', '14mp0be'];

const outputDir = path.join(__dirname, '..', 'data');
const outputPath = path.join(outputDir, 'processed', 'neighbourhood_comments.json');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// === Get OAuth token ===
async function getAccessToken() {
  const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await res.json();
  return data.access_token;
}

// === Recursively extract a comment tree ===
function extractCommentTree(node, flatList, postId, title) {
  if (node.kind === 't1' && node.data?.body) {
    flatList.push({
      post_id: postId,
      title,
      comment: node.data.body,
      timestamp: new Date(node.data.created_utc * 1000).toISOString()
    });

    const replies = node.data.replies;
    if (replies && typeof replies === 'object') {
      const children = replies.data?.children || [];
      children.forEach(reply => extractCommentTree(reply, flatList, postId, title));
    }
  }
}

// === Fetch comments for a single post ===
async function getComments(postId, token) {
  const url = `https://oauth.reddit.com/comments/${postId}?limit=1000`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'SG-Reddit-Scraper/1.0'
    }
  });

  const json = await res.json();
  const title = json[0]?.data?.children[0]?.data?.title || 'Untitled Post';

  const flatComments = [];
  const comments = json[1]?.data?.children || [];
  comments.forEach(c => extractCommentTree(c, flatComments, postId, title));

  return flatComments;
}

// === Main: scrape all and save if content changes ===
async function scrapeAll() {
  const token = await getAccessToken();
  let allComments = [];

  for (const id of POST_IDS) {
    const comments = await getComments(id, token);
    console.log(`${comments.length} comments scraped from ${id}`);
    allComments.push(...comments);
  }

  const newContent = JSON.stringify(allComments, null, 2);

  let currentContent = null;
  if (fs.existsSync(outputPath)) {
    currentContent = fs.readFileSync(outputPath, 'utf-8');
  }

  if (currentContent !== newContent) {
    fs.writeFileSync(outputPath, newContent);
    console.log(`File updated: ${outputPath}`);
  } else {
    console.log(`ℹNo changes detected. File not updated.`);
  }
}

scrapeAll();
