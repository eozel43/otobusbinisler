import pandas as pd
from process_data import group_and_transform_data

def test_group_and_transform_data():
    # Sample Mock DataFrame
    data = {
        'Tarih': pd.to_datetime(['2023-10-01', '2023-10-01', '2023-10-02']),
        'Uzun Hat Adı': ['Hat 1', 'Hat 1', 'Hat 2'],
        'Kart Tipi Kümelenmiş': ['Tam', 'Öğrenci', 'Tam'],
        'Ücretli/Ucretsiz kart': ['Ücretli', 'Ücretli', 'Ücretsiz'],
        # Boardings & Revenues
        'Genel Toplam Biniş Adet': [100, 50, 20],
        'Genel Toplam Biniş Tutar': [1600, 400, 0],
        'Ücretsiz Biniş Adet': [0, 0, 20],
        # Types
        'TAM BİNİŞ': [100, 0, 0],
        'BASIN KARTLI BİNİŞ': [0, 0, 0],
        'İLKOKUL-LİSE BİNİŞ': [0, 0, 0],
        'KREDİ KARTI BİNİŞ': [0, 0, 0],
        'NFC-QR BİNİŞ': [0, 0, 0],
        'ÜNİVERSİTE ÖĞRENCİ KARTI': [0, 20, 0],
        'ÜNİVERSİTE ÖĞR. 16 NOLU HAT': [0, 30, 0],
        'ÜNİVERSİTE ÖĞR. İKAMET 16 NOLU HAT': [0, 0, 0],
        'ÜNİVERSİTE ÖĞR. İKAMET KART': [0, 0, 0],
        'Aktarma Biniş Adet': [0, 0, 0],
        'Abonman Biniş Adet': [0, 0, 0],
        'İade Biniş Adet': [0, 0, 0]
    }
    
    df = pd.DataFrame(data)
    
    # Run the function
    grouped = group_and_transform_data(df)
    
    # Assertions
    # 1. Check if unique rows are 3
    assert len(grouped) == 3
    
    # 2. Check if uni1 and uni2 are combined correctly to 'uni'
    student_row = grouped[(grouped['route'] == 'Hat 1') & (grouped['cluster'] == 'Öğrenci')].iloc[0]
    assert student_row['uni'] == 50  # 20 + 30
    
    # 3. Check if combined fields exist
    assert 'uni' in grouped.columns
    assert 'kredi_nfc' in grouped.columns
    assert 'uni_ikamet' in grouped.columns
    
    # 4. Check if date format is string 'YYYY-MM-DD'
    assert isinstance(grouped['date'].iloc[0], str)
    assert grouped['date'].iloc[0] == '2023-10-01'
