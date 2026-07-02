import pandas as pd
import json

df = pd.read_excel('binişler_tum.xlsx')
df['Tarih'] = pd.to_datetime(df['Tarih'])
df_apr = df[(df['Tarih'].dt.year == 2026) & (df['Tarih'].dt.month == 4) & (df['Uzun Hat Adı'] == '14-TOKİ-VAZO')]
print("RAW DATA Nisan 2026 14-TOKİ-VAZO:")
print("Genel Toplam Biniş Adet:", df_apr['Genel Toplam Biniş Adet'].sum())
print("Null count in biniş:", df_apr['Genel Toplam Biniş Adet'].isnull().sum())
print("Row count:", len(df_apr))

with open('frontend/public/data/dashboard_data.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

json_boardings = 0
for r in data['records']:
    if r['date'].startswith('2026-04') and r['route'] == '14-TOKİ-VAZO':
        json_boardings += r['boardings']

print("\nJSON DATA Nisan 2026 14-TOKİ-VAZO:")
print("Total Boardings:", json_boardings)
