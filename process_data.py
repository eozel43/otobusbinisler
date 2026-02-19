
import pandas as pd
import json
import os
import numpy as np

# Input/Output paths
INPUT_FILE = "binişler_tum.xlsx"
OUTPUT_DIR = "frontend/public/data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "dashboard_data.json")

def process_data():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    print(f"Loading {INPUT_FILE}...")
    try:
        df = pd.read_excel(INPUT_FILE)
    except FileNotFoundError:
        print(f"Error: {INPUT_FILE} not found.")
        return

    print("Processing data...")
    
    # Ensure Date is datetime
    df['Tarih'] = pd.to_datetime(df['Tarih'])
    
    # --- Filter Options ---
    # Extract unique values for filter dropdowns
    routes = sorted(df['Uzun Hat Adı'].unique().tolist())
    clusters = sorted(df['Kart Tipi Kümelenmiş'].dropna().unique().tolist())
    types = sorted(df['Ücretli/Ucretsiz kart'].dropna().unique().tolist())

    # --- Grouped Data for Frontend Filtering ---
    # Instead of sending every single row (which might be too large), we group by the filterable dimensions + Date
    # Columns to group by: Date, Route, Cluster, Type
    grouped = df.groupby([
        df['Tarih'].dt.strftime('%Y-%m-%d'), 
        'Uzun Hat Adı', 
        'Kart Tipi Kümelenmiş', 
        'Ücretli/Ucretsiz kart'
    ]).agg({
        'Genel Toplam Biniş Adet': 'sum',
        'Genel Toplam Biniş Tutar': 'sum',
        'Ücretsiz Biniş Adet': 'sum',
        'TAM_16TL': 'sum',
        'ILKOKUL-LISE(10TL)': 'sum',
        'UNI_OGRKARTI_15TL': 'sum',
        'UNI_OGR_8TL': 'sum',
        'Abonman Biniş Adet': 'sum',
        'Aktarma Biniş Adet': 'sum',
        'KrediKartı_16TL': 'sum',
        'NFC-QR_20TL': 'sum'
    }).reset_index()
    
    grouped.columns = [
        'date', 'route', 'cluster', 'type', 
        'boardings', 'revenue', 'free', 
        'tam', 'lise', 'uni1', 'uni2', 'abonman', 'aktarma', 'kredi', 'nfc'
    ]

    # Combine Univ columns for cleaner frontend logic
    grouped['uni'] = grouped['uni1'] + grouped['uni2']
    grouped['kredi_nfc'] = grouped['kredi'] + grouped['nfc']
    
    # Drop unnecessary columns after combining
    grouped = grouped.drop(columns=['uni1', 'uni2', 'kredi', 'nfc'])

    # --- Construct Final JSON ---
    dashboard_data = {
        'filters': {
            'routes': routes,
            'clusters': clusters,
            'types': types
        },
        'records': grouped.to_dict(orient='records')
    }
    
    # Custom encoder to handle numpy types
    class NpEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, np.integer):
                return int(obj)
            if isinstance(obj, np.floating):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            return super(NpEncoder, self).default(obj)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(dashboard_data, f, ensure_ascii=False, indent=2, cls=NpEncoder)
        
    print(f"Data saved to {OUTPUT_FILE}")
    print(f"Total records exported: {len(grouped)}")

if __name__ == "__main__":
    process_data()
