import json
import os
import joblib
import math

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_model_and_vectorizer(model_dir):
    model = joblib.load(os.path.join(model_dir, 'custom_model.pkl'))
    vectorizer = joblib.load(os.path.join(model_dir, 'custom_vectorizer.pkl'))
    return model, vectorizer

def calculate_sentiment_probs(comment, model, vectorizer):
    vec = vectorizer.transform([comment])
    probs = model.predict_proba(vec)[0]
    labels = model.classes_
    prob_map = dict(zip(labels, probs))
    return {
        "neg": round(prob_map.get("negative", 0.0), 3),
        "neu": round(prob_map.get("neutral", 0.0), 3),
        "pos": round(prob_map.get("positive", 0.0), 3)
    }

def calculate_compound_score(sentiment):
    spread = 5.0
    pos_weight = 0.8
    neg_weight = 0.5
    neutral_power = 2.0
    epsilon = 1e-6

    pos = sentiment["pos"]
    neg = sentiment["neg"]
    neu = sentiment["neu"]

    valence = (pos_weight * pos - neg_weight * neg) / (pos + neg + epsilon)
    compound = math.tanh(spread * valence) * (1 - neu ** neutral_power)
    return round(compound, 3)

def match_neighbourhood(entry, neighbourhood_names):
    if 'neighbourhood' in entry:
        n = entry['neighbourhood'].lower()
        if n in neighbourhood_names:
            return [n]
    comment = entry.get('comment', '').lower()
    return [n for n in neighbourhood_names if n in comment]

def compute_neighbourhood_averages(sentiments, neighbourhood_map):
    return {
        neighbourhood_map[n]: round(sum(scores) / len(scores), 3)
        for n, scores in sentiments.items() if scores
    }

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def run_custom_analysis(input_path, neighbourhoods_path, comment_output_path, neighbourhood_output_path):
    neighbourhood_data = load_json(neighbourhoods_path)
    comments = load_json(input_path)

    neighbourhood_map = {n['name'].lower(): n['name'] for n in neighbourhood_data}
    neighbourhood_names = list(neighbourhood_map.keys())

    model_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'models')
    model, vectorizer = load_model_and_vectorizer(model_dir)

    comment_scores = []
    neighbourhood_sentiments = {n: [] for n in neighbourhood_names}

    for entry in comments:
        comment_text = entry.get('comment', '')
        sentiment = calculate_sentiment_probs(comment_text, model, vectorizer)
        sentiment["compound"] = calculate_compound_score(sentiment)

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

    save_json(neighbourhood_output_path, {"model": "custom", "sentiment": neighbourhood_result})
    save_json(comment_output_path, comment_scores)

    print(f"[CUSTOM] Saved average sentiment to: {neighbourhood_output_path}")
    print(f"[CUSTOM] Saved per-comment sentiment to: {comment_output_path}")
