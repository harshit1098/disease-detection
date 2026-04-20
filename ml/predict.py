import pickle
import pandas as pd

model = pickle.load(open("ml/model.pkl", "rb"))

# Get columns order directly from the trained model
columns = list(model.feature_names_in_)

def predict_disease(symptoms_list):
    input_data = [0] * len(columns)

    for symptom in symptoms_list:
        if symptom in columns:
            index = columns.index(symptom)
            input_data[index] = 1

    # Pass as DataFrame to avoid feature name mismatch warning
    input_df = pd.DataFrame([input_data], columns=columns)
    prediction = model.predict(input_df)
    
    return prediction[0]