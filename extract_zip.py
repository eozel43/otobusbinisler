
import zipfile
import os

zip_path = "c:/Users/Ulasim/Downloads/agent_files.zip"
extract_to = "c:/Users/Ulasim/Downloads/binisler/agent_extracted"

try:
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    print(f"Extracted to {extract_to}")
except Exception as e:
    print(f"Error: {e}")
