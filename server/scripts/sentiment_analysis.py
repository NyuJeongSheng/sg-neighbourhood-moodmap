import json
import os
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# === Paths ===
script_dir = os.path.dirname(__file__)
data_dir = os.path.join(script_dir, '..', 'data')
comments_path = os.path.join(data_dir, 'reddit_housing_comments.json')
neighbourhoods_path = os.path.join(data_dir, 'neighbourhoods.json')
neigh_output_path = os.path.join(data_dir, 'neighbourhood_sentiment.json')
comment_output_path = os.path.join(data_dir, 'comment_sentiment_scores.json')

# === Load Data ===
with open(neighbourhoods_path, 'r', encoding='utf-8') as f:
    neighbourhoods = [n.lower() for n in json.load(f)]

with open(comments_path, 'r', encoding='utf-8') as f:
    comments = json.load(f)

# === Sentiment Analyzer ===
analyzer = SentimentIntensityAnalyzer()

# === Storage ===
neigh_sentiments = {n: [] for n in neighbourhoods}
comment_scores = []

# === Process Comments ===
for entry in comments:
    comment_text = entry['comment']
    comment_lower = comment_text.lower()
    sentiment = analyzer.polarity_scores(comment_text)
    compound_score = sentiment['compound']
    matched_neighs = [n for n in neighbourhoods if n in comment_lower]

    if matched_neighs:
        # Store per-neighbourhood score
        for n in matched_neighs:
            neigh_sentiments[n].append(compound_score)

        # Store per-comment record
        comment_scores.append({
            "comment": comment_text,
            "matched_neighbourhoods": matched_neighs,
            "sentiment": {
                "neg": round(sentiment['neg'], 3),
                "neu": round(sentiment['neu'], 3),
                "pos": round(sentiment['pos'], 3),
                "compound": round(compound_score, 3)
            }
        })

# === Compute Average Per-Neighbourhood ===
neigh_result = {}
for neigh, scores in neigh_sentiments.items():
    if scores:
        avg = sum(scores) / len(scores)
        neigh_result[neigh] = round(avg, 3)

# === Save Outputs ===
with open(neigh_output_path, 'w', encoding='utf-8') as f:
    json.dump(neigh_result, f, indent=2, ensure_ascii=False)

with open(comment_output_path, 'w', encoding='utf-8') as f:
    json.dump(comment_scores, f, indent=2, ensure_ascii=False)

print(f"Saved average sentiment to: {neigh_output_path}")
print(f"Saved per-comment sentiment to: {comment_output_path}")
