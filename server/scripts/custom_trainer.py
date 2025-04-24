import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

# === Paths ===
script_dir = os.path.dirname(__file__)  # scripts/
data_path = os.path.join(script_dir, '..', 'data', 'sentiment_training_data.csv')
model_dir = os.path.join(script_dir, '..', 'models')
os.makedirs(model_dir, exist_ok=True)

model_path = os.path.join(model_dir, 'custom_model.pkl')
vectorizer_path = os.path.join(model_dir, 'custom_vectorizer.pkl')

# === Load training data ===
df = pd.read_csv(data_path)

if 'comment' not in df.columns or 'label' not in df.columns:
    raise ValueError("CSV must contain 'comment' and 'label' columns.")

print(f"Loaded {len(df)} samples from: {data_path}")

X = df['comment']
y = df['label']

# === Vectorize text ===
vectorizer = TfidfVectorizer(stop_words='english')
X_vec = vectorizer.fit_transform(X)

# === Train classifier ===
model = LogisticRegression(max_iter=1000, multi_class='multinomial', solver='lbfgs')
model.fit(X_vec, y)

# === Save model and vectorizer ===
joblib.dump(model, model_path)
joblib.dump(vectorizer, vectorizer_path)

print(f"Model saved to: {model_path}")
print(f"Vectorizer saved to: {vectorizer_path}")
