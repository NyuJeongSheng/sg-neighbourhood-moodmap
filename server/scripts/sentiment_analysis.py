import json
import os
import argparse
from sentiment.vader_model import run_vader_analysis
from sentiment.custom_model import run_custom_analysis

# === Parse command-line arguments ===
parser = argparse.ArgumentParser()
parser.add_argument('--model', choices=['vader', 'custom'], default='vader')
args = parser.parse_args()

# === File paths ===
script_dir = os.path.dirname(__file__)
data_dir = os.path.join(script_dir, '..', 'data')
input_path = os.path.join(data_dir, 'neighbourhood_comments.json')
neigh_path = os.path.join(data_dir, 'neighbourhoods.json')
comment_out = os.path.join(data_dir, 'comment_sentiment_scores.json')
neigh_out = os.path.join(data_dir, 'neighbourhood_sentiment.json')

# === Load input ===
with open(input_path, 'r', encoding='utf-8') as f:
    comments = json.load(f)

results = []

# === VADER analysis ===
if args.model == 'vader':
    print("[Model] Running VADER sentiment analysis")
    run_vader_analysis(input_path, neigh_path, comment_out, neigh_out)

# === Custom model analysis ===
elif args.model == 'custom':
    print("[Model] Running custom sentiment analysis")
    run_custom_analysis(input_path, neigh_path, comment_out, neigh_out)

print(f"Sentiment analysis complete using {args.model}. Output: {comment_out}")