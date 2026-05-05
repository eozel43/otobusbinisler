
import React, { useMemo } from 'react';

const categories = [
    { key: 'tam', label: 'TAM BİNİŞLER' },
    { key: 'basin', label: 'BASIN KARTLI BİNİŞLER' },
    { key: 'lise', label: 'İLKOKUL-LİSE BİNİŞLER' },
    { key: 'kredi', label: 'KREDİ KARTI BİNİŞLER' },
    { key: 'nfc', label: 'NFC-QR BİNİŞLER' },
    { key: 'uni_ogrenci', label: 'ÜNİVERSİTE ÖĞRENCİ KARTI BİNİŞ' },
    { key: 'uni_ikamet', label: 'ÜNİVERSİTE ÖĞR. İKAMET KART BİNİŞ' },
    { key: 'uni_16no_all', label: '16NUMARA OGRENCİ' },
    { key: 'aktarma', label: 'AKTARMA BİNİŞ' }
];

export function SummaryTable({ data }) {
    if (!data || Object.keys(data).length === 0) return null;

    const years = Object.keys(data).sort();

    const { categoryTotals, grandTotal } = useMemo(() => {
        const totals = {};
        let grand = 0;
        categories.forEach(cat => {
            let catTotal = 0;
            years.forEach(year => {
                catTotal += (data[year][cat.key] || 0);
            });
            totals[cat.key] = catTotal;
            grand += catTotal;
        });
        return { categoryTotals: totals, grandTotal: grand };
    }, [data, years]);

    return (
        <div className="w-full rounded-xl border bg-card text-card-foreground shadow flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 pb-4 flex flex-col space-y-1.5 shrink-0">
                <h3 className="font-semibold leading-none tracking-tight font-lexend">BİNİŞ ÖZETİ (ÖDEME TÜRÜ)</h3>
                <p className="text-sm text-muted-foreground">Yıllara göre ödeme türü bazında biniş sayıları (ücretsiz binişler hariç)</p>
            </div>
            <div className="p-0 flex-1 overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    <table className="min-w-full caption-bottom text-sm text-left whitespace-nowrap">
                        <thead className="[&_tr]:border-b bg-muted/50">
                            <tr className="border-b border-border transition-colors">
                                <th className="h-10 px-4 sm:px-6 align-middle font-bold text-foreground text-xs uppercase tracking-wider sticky left-0 bg-muted/50 z-10 shadow-[1px_0_0_0_theme(colors.border)]">Biniş Türleri</th>
                                {years.map(year => (
                                    <th key={year} className="h-10 px-4 sm:px-6 align-middle font-bold text-foreground text-right text-xs uppercase tracking-wider">
                                        {year}
                                    </th>
                                ))}
                                <th className="h-10 px-4 sm:px-6 align-middle font-bold text-blue-600 dark:text-blue-400 text-right text-xs uppercase tracking-wider">
                                    TOPLAM
                                </th>
                                <th className="h-10 px-4 sm:px-6 align-middle font-bold text-emerald-600 dark:text-emerald-400 text-right text-xs uppercase tracking-wider">
                                    % PAY
                                </th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0 font-mono">
                            {categories.map((cat, idx) => {
                                const catTotal = categoryTotals[cat.key] || 0;
                                const percent = grandTotal > 0 ? ((catTotal / grandTotal) * 100).toFixed(1) : "0.0";
                                return (
                                    <tr key={cat.key} className="border-b border-border transition-colors hover:bg-muted/30 group">
                                        <td className="p-3 sm:p-4 px-4 sm:px-6 align-middle font-medium text-foreground sticky left-0 bg-card z-10 transition-colors group-hover:bg-muted/30 shadow-[1px_0_0_0_theme(colors.border)]">
                                            {cat.label}
                                        </td>
                                        {years.map(year => (
                                            <td key={`${cat.key}-${year}`} className="p-3 sm:p-4 px-4 sm:px-6 align-middle text-right text-foreground/80">
                                                {new Intl.NumberFormat('tr-TR').format(data[year][cat.key] || 0)}
                                            </td>
                                        ))}
                                        <td className="p-3 sm:p-4 px-4 sm:px-6 align-middle text-right font-bold text-foreground bg-blue-50/50 dark:bg-blue-900/10">
                                            {new Intl.NumberFormat('tr-TR').format(catTotal)}
                                        </td>
                                        <td className="p-3 sm:p-4 px-4 sm:px-6 align-middle text-right font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10">
                                            % {percent.replace('.', ',')}
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr className="border-t-2 border-border/80 bg-muted/20 font-bold group">
                                <td className="p-3 sm:p-4 px-4 sm:px-6 align-middle text-foreground sticky left-0 bg-muted z-10 shadow-[1px_0_0_0_theme(colors.border)]">
                                    GENEL TOPLAM
                                </td>
                                {years.map(year => {
                                    let yearTotal = 0;
                                    categories.forEach(cat => {
                                        yearTotal += (data[year]?.[cat.key] || 0);
                                    });
                                    return (
                                        <td key={`total-${year}`} className="p-3 sm:p-4 px-4 sm:px-6 align-middle text-right text-foreground">
                                            {new Intl.NumberFormat('tr-TR').format(yearTotal)}
                                        </td>
                                    );
                                })}
                                <td className="p-3 sm:p-4 px-4 sm:px-6 align-middle text-right text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/20">
                                    {new Intl.NumberFormat('tr-TR').format(grandTotal)}
                                </td>
                                <td className="p-3 sm:p-4 px-4 sm:px-6 align-middle text-right text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/20">
                                    % 100,0
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
