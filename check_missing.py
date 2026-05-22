import pandas as pd

df = pd.read_excel('binişler_tum.xlsx')
df['Tarih'] = pd.to_datetime(df['Tarih'])
df_apr = df[(df['Tarih'].dt.year == 2026) & (df['Tarih'].dt.month == 4) & (df['Uzun Hat Adı'] == '14-TOKİ-VAZO')]

missing = df_apr[df_apr[['Kart Tipi Kümelenmiş', 'Ücretli/Ucretsiz kart']].isnull().any(axis=1)]
print(missing[['Tarih', 'Genel Toplam Biniş Adet', 'Kart Tipi Kümelenmiş', 'Ücretli/Ucretsiz kart']])
