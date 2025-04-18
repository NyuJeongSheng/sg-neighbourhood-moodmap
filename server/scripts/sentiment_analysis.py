import json
import os
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# === Paths ===
script_dir = os.path.dirname(__file__)
data_dir = os.path.join(script_dir, '..', 'data')
comments_path = os.path.join(data_dir, 'neighbourhood_comments.json')
neighbourhoods_path = os.path.join(data_dir, 'neighbourhoods.json')  # now contains name, lat, lng
neigh_output_path = os.path.join(data_dir, 'neighbourhood_sentiment.json')
comment_output_path = os.path.join(data_dir, 'comment_sentiment_scores.json')

# === Load Neighbourhood Data ===
with open(neighbourhoods_path, 'r', encoding='utf-8') as f:
    neighbourhoods_data = json.load(f)

# Extract names and lowercase for matching
neighbourhood_map = {n['name'].lower(): n['name'] for n in neighbourhoods_data}
neighbourhood_names_lower = list(neighbourhood_map.keys())

# === Load Reddit Comments ===
with open(comments_path, 'r', encoding='utf-8') as f:
    comments = json.load(f)

# === Sentiment Analyzer ===
analyzer = SentimentIntensityAnalyzer()

# === Storage ===
neigh_sentiments = {n: [] for n in neighbourhood_names_lower}
comment_scores = []

# === Process Comments ===
for entry in comments:
    comment_text = entry['comment']
    comment_lower = comment_text.lower()
    sentiment = analyzer.polarity_scores(comment_text)
    compound_score = sentiment['compound']
    matched_neighs = [n for n in neighbourhood_names_lower if n in comment_lower]

    if matched_neighs:
        for n in matched_neighs:
            neigh_sentiments[n].append(compound_score)

        comment_scores.append({
            "comment": comment_text,
            "timestamp": entry.get("timestamp"),
            "matched_neighbourhoods": matched_neighs,
            "sentiment": {
                "neg": round(sentiment['neg'], 3),
                "neu": round(sentiment['neu'], 3),
                "pos": round(sentiment['pos'], 3),
                "compound": round(compound_score, 3)
            }
        })

# === Compute Averages (Only Name + Sentiment) ===
neigh_result = {}
for neigh, scores in neigh_sentiments.items():
    if scores:
        avg = sum(scores) / len(scores)
        original_name = neighbourhood_map[neigh]
        neigh_result[original_name] = round(avg, 3)

# === Save Outputs ===
with open(neigh_output_path, 'w', encoding='utf-8') as f:
    json.dump(neigh_result, f, indent=2, ensure_ascii=False)

with open(comment_output_path, 'w', encoding='utf-8') as f:
    json.dump(comment_scores, f, indent=2, ensure_ascii=False)

print(f"Saved average sentiment to: {neigh_output_path}")
print(f"Saved per-comment sentiment to: {comment_output_path}")
