
import pandas as pd
import sys

# Set pandas display options to ensure all columns are shown
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 1000)

file_path = "binişler_tum.xlsx"

try:
    df = pd.read_excel(file_path)
    
    with open("analysis_output.txt", "w", encoding="utf-8") as f:
        f.write("File loaded successfully.\n")
        f.write(f"Shape: {df.shape}\n")
        f.write("\nColumns:\n")
        for col in df.columns:
            f.write(f"- {col}\n")
        
        f.write("\nData Types:\n")
        f.write(df.dtypes.to_string())
        
        f.write("\n\nFirst 5 rows:\n")
        f.write(df.head().to_string())
        
        f.write("\n\nNumeric Description:\n")
        f.write(df.describe().to_string())
        
    print("Analysis saved to analysis_output.txt")
    
except Exception as e:
    print(f"Error: {e}")
