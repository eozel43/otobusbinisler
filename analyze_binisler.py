
import pandas as pd
import os

file_path = "c:/Users/Ulasim/Downloads/binisler/binişler_tum.xlsx"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    # Try just filename if in same dir
    file_path = "binişler_tum.xlsx"

try:
    df = pd.read_excel(file_path)
    print("File loaded successfully.")
    print(f"Shape: {df.shape}")
    print("\nColumns:")
    print(df.columns.tolist())
    print("\nData Types:")
    print(df.dtypes)
    print("\nFirst 5 rows:")
    print(df.head().to_string())
    
    # Basic stats if numeric columns exist
    print("\nDescription:")
    print(df.describe().to_string())
    
except Exception as e:
    print(f"Error loading file: {e}")
