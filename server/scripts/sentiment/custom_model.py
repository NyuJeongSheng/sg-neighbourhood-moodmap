import json
import os
import joblib
import math


def run_custom_analysis(input_path, neighbourhoods_path, comment_output_path, neighbourhood_output_path):
    # === Load Neighbourhood Data ===
    with open(neighbourhoods_path, 'r', encoding='utf-8') as f:
        neighbourhoods_data = json.load(f)

    neighbourhood_map = {n['name'].lower(): n['name'] for n in neighbourhoods_data}
    neighbourhood_names_lower = list(neighbourhood_map.keys())

    # === Load Comments ===
    with open(input_path, 'r', encoding='utf-8') as f:
        comments = json.load(f)

    # === Load Trained Model & Vectorizer ===
    script_dir = os.path.dirname(__file__)
    model_dir = os.path.join(script_dir, '..', '..', 'models')
    model = joblib.load(os.path.join(model_dir, 'custom_model.pkl'))
    vectorizer = joblib.load(os.path.join(model_dir, 'custom_vectorizer.pkl'))

    comment_scores = []
    neigh_sentiments = {n: [] for n in neighbourhood_names_lower}

    for entry in comments:
        comment_text = entry.get('comment', '')
        comment_lower = comment_text.lower()
        vec = vectorizer.transform([comment_text])
        probs = model.predict_proba(vec)[0]
        labels = model.classes_

        prob_map = dict(zip(labels, probs))

        sentiment = {
            "neg": round(prob_map.get("negative", 0.0), 3),
            "neu": round(prob_map.get("neutral", 0.0), 3),
            "pos": round(prob_map.get("positive", 0.0), 3)
        }

        # Tunable parameters
        spread = 5.0
        pos_weight = 0.8
        neg_weight = 0.5
        neutral_power = 2.0
        epsilon = 1e-6  # Prevent division by zero

        pos = sentiment["pos"]
        neg = sentiment["neg"]
        neu = sentiment["neu"]

        # Final compound score
        valence = (pos_weight * pos - neg_weight * neg) / (pos + neg + epsilon)
        compound = math.tanh(spread * valence) * (1 - neu ** neutral_power)
        sentiment["compound"] = round(compound, 3)

        post_id = entry.get('post_id')
        timestamp = entry.get('timestamp')

        if 'neighbourhood' in entry:
            n = entry['neighbourhood'].lower()
            matched_neighs = [n] if n in neighbourhood_names_lower else []
        else:
            matched_neighs = [n for n in neighbourhood_names_lower if n in comment_lower]

        if matched_neighs:
            for n in matched_neighs:
                neigh_sentiments[n].append(sentiment["compound"])

            comment_scores.append({
                "comment": comment_text,
                "post_id": post_id,
                "timestamp": timestamp,
                "matched_neighbourhoods": matched_neighs,
                "sentiment": sentiment
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
        json.dump({"model": "custom", "sentiment": neigh_result}, f, indent=2, ensure_ascii=False)

    with open(comment_output_path, 'w', encoding='utf-8') as f:
        json.dump(comment_scores, f, indent=2, ensure_ascii=False)

    print(f"[CUSTOM] Saved average sentiment to: {neighbourhood_output_path}")
    print(f"[CUSTOM] Saved per-comment sentiment to: {comment_output_path}")
