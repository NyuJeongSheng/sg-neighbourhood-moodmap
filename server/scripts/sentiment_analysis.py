import os
import json
import argparse
from sentiment.vader_model import run_vader_analysis
from sentiment.custom_model import run_custom_analysis

# === Parse command-line arguments ===
parser = argparse.ArgumentParser()
parser.add_argument('--model', choices=['vader', 'custom'], default='vader')
args = parser.parse_args()

# === Define file paths ===
script_dir = os.path.dirname(__file__)
data_dir = os.path.join(script_dir, '..', 'data')

input_path = os.path.join(data_dir, 'processed', 'neighbourhood_comments.json')
neigh_path = os.path.join(data_dir, 'raw', 'neighbourhoods.json')
comment_out = os.path.join(
    data_dir, 'processed', 'comment_sentiment_scores.json'
)
neigh_out = os.path.join(data_dir, 'processed', 'neighbourhood_sentiment.json')

# === Load input data ===
with open(input_path, 'r', encoding='utf-8') as f:
    comments = json.load(f)

# === Run sentiment analysis based on model ===
if args.model == 'vader':
    print("[Model] Running VADER sentiment analysis")
    run_vader_analysis(input_path, neigh_path, comment_out, neigh_out)

elif args.model == 'custom':
    print("[Model] Running custom sentiment analysis")
    run_custom_analysis(input_path, neigh_path, comment_out, neigh_out)

# === Done ===
print(
    f"[Done] Sentiment analysis complete using '{args.model}' model. "
    f"Output: {comment_out}"
)
