import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

def run_vader_analysis(input_path, neighbourhoods_path, comment_output_path, neighbourhood_output_path):
    # === Load Neighbourhood Data ===
    with open(neighbourhoods_path, 'r', encoding='utf-8') as f:
        neighbourhoods_data = json.load(f)

    neighbourhood_map = {n['name'].lower(): n['name'] for n in neighbourhoods_data}
    neighbourhood_names_lower = list(neighbourhood_map.keys())

    # === Load Reddit Comments ===
    with open(input_path, 'r', encoding='utf-8') as f:
        comments = json.load(f)

    analyzer = SentimentIntensityAnalyzer()
    neigh_sentiments = {n: [] for n in neighbourhood_names_lower}
    comment_scores = []

    for entry in comments:
        comment_text = entry.get('comment', '')
        comment_lower = comment_text.lower()
        sentiment = analyzer.polarity_scores(comment_text)
        compound_score = sentiment['compound']

        post_id = entry.get('post_id')
        timestamp = entry.get('timestamp')

        if 'neighbourhood' in entry:
            n = entry['neighbourhood'].lower()
            matched_neighs = [n] if n in neighbourhood_names_lower else []
        else:
            matched_neighs = [n for n in neighbourhood_names_lower if n in comment_lower]

        if matched_neighs:
            for n in matched_neighs:
                neigh_sentiments[n].append(compound_score)

            comment_scores.append({
                "comment": comment_text,
                "post_id": post_id,
                "timestamp": timestamp,
                "matched_neighbourhoods": matched_neighs,
                "sentiment": {
                    "neg": round(sentiment['neg'], 3),
                    "neu": round(sentiment['neu'], 3),
                    "pos": round(sentiment['pos'], 3),
                    "compound": round(compound_score, 3)
                }
            })

    # === Compute Averages ===
    neigh_result = {}
    for neigh, scores in neigh_sentiments.items():
        if scores:
            avg = sum(scores) / len(scores)
            original_name = neighbourhood_map[neigh]
            neigh_result[original_name] = round(avg, 3)

    # === Save Outputs ===
    with open(neighbourhood_output_path, 'w', encoding='utf-8') as f:
        json.dump({"model": "vader", "sentiment": neigh_result}, f, indent=2, ensure_ascii=False)

    with open(comment_output_path, 'w', encoding='utf-8') as f:
        json.dump(comment_scores, f, indent=2, ensure_ascii=False)

    print(f"[VADER] Saved average sentiment to: {neighbourhood_output_path}")
    print(f"[VADER] Saved per-comment sentiment to: {comment_output_path}")
