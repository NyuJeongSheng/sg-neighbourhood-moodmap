import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def build_neighbourhood_map(neighbourhoods_data):
    return {n['name'].lower(): n['name'] for n in neighbourhoods_data}

def match_neighbourhood(entry, neighbourhood_names):
    if 'neighbourhood' in entry:
        n = entry['neighbourhood'].lower()
        if n in neighbourhood_names:
            return [n]
    comment = entry.get('comment', '').lower()
    return [n for n in neighbourhood_names if n in comment]

def analyze_comment(comment_text, analyzer):
    sentiment = analyzer.polarity_scores(comment_text)
    return {
        "neg": round(sentiment['neg'], 3),
        "neu": round(sentiment['neu'], 3),
        "pos": round(sentiment['pos'], 3),
        "compound": round(sentiment['compound'], 3)
    }

def compute_neighbourhood_averages(sentiments, neighbourhood_map):
    return {
        neighbourhood_map[n]: round(sum(scores) / len(scores), 3)
        for n, scores in sentiments.items() if scores
    }

def run_vader_analysis(input_path, neighbourhoods_path, comment_output_path, neighbourhood_output_path):
    neighbourhood_data = load_json(neighbourhoods_path)
    comments = load_json(input_path)

    neighbourhood_map = build_neighbourhood_map(neighbourhood_data)
    neighbourhood_names = list(neighbourhood_map.keys())

    analyzer = SentimentIntensityAnalyzer()
    neighbourhood_sentiments = {n: [] for n in neighbourhood_names}
    comment_scores = []

    for entry in comments:
        comment_text = entry.get('comment', '')
        sentiment = analyze_comment(comment_text, analyzer)
        matched_neighs = match_neighbourhood(entry, neighbourhood_names)

        if matched_neighs:
            for n in matched_neighs:
                neighbourhood_sentiments[n].append(sentiment["compound"])

            comment_scores.append({
                "comment": comment_text,
                "post_id": entry.get('post_id'),
                "timestamp": entry.get('timestamp'),
                "matched_neighbourhoods": matched_neighs,
                "sentiment": sentiment
            })

    neighbourhood_result = compute_neighbourhood_averages(neighbourhood_sentiments, neighbourhood_map)

    save_json(neighbourhood_output_path, {"model": "vader", "sentiment": neighbourhood_result})
    save_json(comment_output_path, comment_scores)

    print(f"[VADER] Saved average sentiment to: {neighbourhood_output_path}")
    print(f"[VADER] Saved per-comment sentiment to: {comment_output_path}")
