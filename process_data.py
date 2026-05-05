
import pandas as pd
import json
import os
import numpy as np

# Input/Output paths
INPUT_FILE = "binişler_tum.xlsx"
OUTPUT_DIR = "frontend/public/data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "dashboard_data.json")

def group_and_transform_data(df):
    """
    Groups the raw dataframe by selected dimensions and applies aggregation logic.
    Made separate for testability.
    """
    df = df.copy()
    df['Kart Tipi Kümelenmiş'] = df['Kart Tipi Kümelenmiş'].fillna('Tanımsız')
    df['Ücretli/Ucretsiz kart'] = df['Ücretli/Ucretsiz kart'].fillna('Tanımsız')
    df['Uzun Hat Adı'] = df['Uzun Hat Adı'].fillna('Tanımsız')
    
    grouped = df.groupby([
        df['Tarih'].dt.strftime('%Y-%m-%d'), 
        'Uzun Hat Adı', 
        'Kart Tipi Kümelenmiş', 
        'Ücretli/Ucretsiz kart'
    ]).agg({
        'Genel Toplam Biniş Adet': 'sum',
        'Genel Toplam Biniş Tutar': 'sum',
        'Ücretsiz Biniş Adet': 'sum',
        'TAM BİNİŞ': 'sum',
        'BASIN KARTLI BİNİŞ': 'sum',
        'İLKOKUL-LİSE BİNİŞ': 'sum',
        'KREDİ KARTI BİNİŞ': 'sum',
        'NFC-QR BİNİŞ': 'sum',
        'ÜNİVERSİTE ÖĞRENCİ KARTI': 'sum',
        'ÜNİVERSİTE ÖĞR. 16 NOLU HAT': 'sum',
        'ÜNİVERSİTE ÖĞR. İKAMET 16 NOLU HAT': 'sum',
        'ÜNİVERSİTE ÖĞR. İKAMET KART': 'sum',
        'Aktarma Biniş Adet': 'sum',
        'Abonman Biniş Adet': 'sum',
        'İade Biniş Adet': 'sum'
    }).reset_index()
    
    grouped.columns = [
        'date', 'route', 'cluster', 'type', 
        'boardings', 'revenue', 'free', 
        'tam', 'basin', 'lise', 'kredi', 'nfc', 'uni_ogrenci', 'uni_16no', 'uni_ikamet_16no', 'uni_ikamet_kart', 'aktarma', 'abonman', 'iade'
    ]

    # Combine columns for existing frontend charts/KPIs
    grouped['uni'] = grouped['uni_ogrenci'] + grouped['uni_16no'] + grouped['uni_ikamet_16no'] + grouped['uni_ikamet_kart']
    grouped['kredi_nfc'] = grouped['kredi'] + grouped['nfc']
    grouped['uni_ikamet'] = grouped['uni_ikamet_16no'] + grouped['uni_ikamet_kart']
    
    return grouped
    
    return grouped

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
    df['Kart Tipi Kümelenmiş'] = df['Kart Tipi Kümelenmiş'].fillna('Tanımsız')
    df['Ücretli/Ucretsiz kart'] = df['Ücretli/Ucretsiz kart'].fillna('Tanımsız')
    df['Uzun Hat Adı'] = df['Uzun Hat Adı'].fillna('Tanımsız')
    
    # --- Filter Options ---
    # Extract unique values for filter dropdowns
    routes = sorted([str(x) for x in df['Uzun Hat Adı'].unique()])
    clusters = sorted([str(x) for x in df['Kart Tipi Kümelenmiş'].unique()])
    types = sorted([str(x) for x in df['Ücretli/Ucretsiz kart'].unique()])

    # --- Grouped Data for Frontend Filtering ---
    grouped = group_and_transform_data(df)

    import datetime
    mtime = os.path.getmtime(INPUT_FILE)
    last_updated = datetime.datetime.fromtimestamp(mtime).strftime('%d.%m.%Y')

    # --- Construct Final JSON ---
    dashboard_data = {
        'lastUpdated': last_updated,
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
