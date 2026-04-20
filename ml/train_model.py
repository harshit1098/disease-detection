import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import pickle

# Load dataset
train = pd.read_csv("ml/Training.csv")

# Remove unwanted column if exists
if 'Unnamed: 133' in train.columns:
    train = train.drop('Unnamed: 133', axis=1)

# Features and target
X = train.drop('prognosis', axis=1)
y = train['prognosis']

# Train model
model = DecisionTreeClassifier()
model.fit(X, y)

# Save model
pickle.dump(model, open("ml/model.pkl", "wb"))

print("🔥 Model trained and saved successfully!")