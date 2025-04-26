import os
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# === Define Paths ===
script_dir = os.path.dirname(__file__)  # scripts/
data_path = os.path.join(
    script_dir, '..', 'data', 'raw', 'sentiment_training_data.csv'
)

model_dir = os.path.join(script_dir, '..', 'models')

model_path = os.path.join(model_dir, 'custom_model.pkl')
vectorizer_path = os.path.join(model_dir, 'custom_vectorizer.pkl')

os.makedirs(model_dir, exist_ok=True)

# === Load Training Data ===
df = pd.read_csv(data_path)

if 'comment' not in df.columns or 'label' not in df.columns:
    raise ValueError("CSV must contain 'comment' and 'label' columns.")

print(f"[TRAINING] Loaded {len(df)} samples from: {data_path}")

X = df['comment']
y = df['label']

# === Text Vectorization ===
vectorizer = TfidfVectorizer(stop_words='english')
X_vec = vectorizer.fit_transform(X)

# === Train Logistic Regression Classifier ===
model = LogisticRegression(
    max_iter=1000,
    multi_class='multinomial',
    solver='lbfgs'
)
model.fit(X_vec, y)

# === Save Model & Vectorizer ===
joblib.dump(model, model_path)
joblib.dump(vectorizer, vectorizer_path)

print(f"Model saved to: {model_path}")
print(f"Vectorizer saved to: {vectorizer_path}")
