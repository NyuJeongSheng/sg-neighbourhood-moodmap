const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const btoa = require('btoa');

// Reddit API credentials
const CLIENT_ID = 'YIqyqDHdK7wsVxzR0Iz1VQ';
const CLIENT_SECRET = 'qTthamiAEcUfxgMjlk4ougtZRRiuDg';

// List of post IDs to scrape
const POST_IDS = ['137jihc', '1htiqn3', '14mp0be'];

const outputDir = path.join(__dirname, '..', 'data');
const outputPath = path.join(outputDir, 'reddit_housing_comments.json');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Get OAuth token
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

// Recursively extract comment and replies
function extractCommentTree(node, flatList, postId, title) {
  if (node.kind === 't1' && node.data?.body) {
    flatList.push({
      post_id: postId,
      title: title,
      comment: node.data.body,
      timestamp: new Date(node.data.created_utc * 1000).toISOString()
    });

    const replies = node.data.replies;
    if (replies && typeof replies === 'object') {
      const replyChildren = replies.data?.children || [];
      replyChildren.forEach(reply => extractCommentTree(reply, flatList, postId, title));
    }
  }
}

// Get all comments (including replies) for a post
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

  const topLevelComments = json[1]?.data?.children || [];
  const flatComments = [];

  topLevelComments.forEach(c => extractCommentTree(c, flatComments, postId, title));

  return flatComments;
}

// Run and save flat output only if changed
async function scrapeAll() {
  const token = await getAccessToken();
  let allComments = [];

  for (let id of POST_IDS) {
    const comments = await getComments(id, token);
    console.log(`${comments.length} comments scraped from ${id}`);
    allComments.push(...comments);
  }

  const newContent = JSON.stringify(allComments, null, 2);

  // Only write if content has changed
  let currentContent = null;
  if (fs.existsSync(outputPath)) {
    currentContent = fs.readFileSync(outputPath, 'utf-8');
  }

  if (currentContent !== newContent) {
    fs.writeFileSync(outputPath, newContent);
    console.log(`File updated: ${outputPath}`);
  } else {
    console.log(`No changes detected. File not updated.`);
  }
}

scrapeAll();
