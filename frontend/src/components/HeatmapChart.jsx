import { useMemo } from 'react';

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export function HeatmapChart({ data, total, selectedMonths = [] }) {
    // data is expected to be an object: { '2022': { 1: 1573715, 2: 1418631, ... }, '2023': { ... } }

    const visibleMonths = useMemo(() => MONTHS
        .map((label, index) => ({ label, number: index + 1 }))
        .filter(month => selectedMonths.length === 0 || selectedMonths.includes(month.number)), [selectedMonths]);
    
    // Sort years descending
    const years = useMemo(() => Object.keys(data).sort((a, b) => b - a), [data]);

    // Find min and max for color scaling
    const { min, max } = useMemo(() => {
        let minVal = Infinity;
        let maxVal = -Infinity;
        Object.values(data).forEach(yearData => {
            Object.values(yearData).forEach(val => {
                if (val > 0) { // ignore 0 for scale
                    if (val < minVal) minVal = val;
                    if (val > maxVal) maxVal = val;
                }
            });
        });
        return { 
            min: minVal === Infinity ? 0 : minVal, 
            max: maxVal === -Infinity ? 10 : maxVal 
        };
    }, [data]);

    // Color generation based on scale (Yellow to Dark Red)
    // using HSL: Hue goes from ~60 (Yellow) to ~0 (Red), Saturation 100%, Lightness 85% to 35%
    const getColor = (value) => {
        if (!value || value === 0) return '#f8fafc'; // empty state slate-50
        
        // Normalize value between 0 and 1
        const normalized = (value - min) / (max - min || 1);
        
        // Adjust these to match the reference image closely
        const hue = 60 - (normalized * 60); // 60 to 0
        const lightness = 85 - (normalized * 50); // 85% to 35%
        
        return `hsl(${hue}, 90%, ${lightness}%)`;
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow w-full col-span-full">
            <div className="p-6 pb-2">
                <h3 className="font-semibold text-lg leading-none tracking-tight font-lexend text-center uppercase">
                    Yıllık-Aylık Biniş Haritası (Heatmap)
                </h3>
                {total !== undefined && (
                    <p className="text-sm font-medium text-muted-foreground text-center mt-2 bg-slate-100 dark:bg-slate-800/50 py-1 px-4 rounded-full inline-block mx-auto w-max flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Gösterilen Toplam Biniş: <span className="text-foreground font-bold">{new Intl.NumberFormat('tr-TR').format(total)}</span>
                    </p>
                )}
            </div>
            <div className="p-6 pt-4 flex flex-col md:flex-row gap-4 items-center">
                
                {/* Heatmap Grid */}
                <div className="flex-1 min-w-0 overflow-x-auto pr-2 pb-4 md:pb-0">
                    <div className="min-w-[700px] flex flex-col gap-1">
                        {years.map(year => (
                            <div key={year} className="flex gap-1 h-14 md:h-20 items-stretch">
                                {/* Row Label (Year) */}
                                <div className="w-12 md:w-16 flex items-center justify-end pr-2 md:pr-3 text-xs md:text-sm font-medium text-muted-foreground rotate-180 shrink-0" style={{ writingMode: 'vertical-rl' }}>
                                    {year}
                                </div>
                                
                                {/* Cells */}
                                {visibleMonths.map(month => {
                                    const monthNum = month.number;
                                    const val = data[year]?.[monthNum] || 0;
                                    const color = getColor(val);
                                    // Use white text if the cell is dark (normalized > 0.5)
                                    const isDark = val > 0 && ((val - min) / (max - min || 1)) > 0.4;
                                    
                                    return (
                                        <div 
                                            key={`${year}-${monthNum}`}
                                            className="flex-1 flex items-center justify-center rounded-sm transition-all hover:ring-2 ring-primary/50 relative group cursor-default"
                                            style={{ backgroundColor: color }}
                                        >
                                            <span className={`text-[10px] md:text-xs font-mono font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {val > 0 ? new Intl.NumberFormat('tr-TR').format(val) : '-'}
                                            </span>
                                            
                                            {/* Tooltip */}
                                            {val > 0 && (
                                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs rounded py-1 px-2 -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-10 shadow-lg">
                                                    {month.label} {year}: {new Intl.NumberFormat('tr-TR').format(val)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        
                        {/* X-Axis Labels (Months) */}
                        <div className="flex gap-1 mt-1">
                            <div className="w-12 md:w-16 shrink-0"></div> {/* Spacer for Y-axis */}
                            {visibleMonths.map(month => (
                                <div key={month.number} className="flex-1 text-center text-[10px] md:text-xs font-medium text-muted-foreground pt-1">
                                    {month.label}
                                </div>
                            ))}
                        </div>
                        {/* X-Axis Title */}
                        <div className="text-center text-xs md:text-sm font-medium text-muted-foreground mt-1 pl-12 md:pl-16">
                            Ay
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="h-40 md:h-[calc(100%-40px)] flex gap-1 md:gap-2 items-center self-end md:self-stretch ml-2 md:ml-4 shrink-0 pl-2 md:pl-4 border-l border-border/50">
                    <div className="flex flex-col items-center justify-between h-full py-2">
                        <span className="text-[10px] md:text-xs font-mono text-muted-foreground">{new Intl.NumberFormat('tr-TR', { notation: "compact", maximumFractionDigits: 1 }).format(max)}</span>
                        <div className="w-3 md:w-4 flex-1 rounded-full my-1 shadow-inner border border-black/5" style={{ background: 'linear-gradient(to bottom, hsl(0, 90%, 35%), hsl(60, 90%, 85%))', minHeight: '60px' }}></div>
                        <span className="text-[10px] md:text-xs font-mono text-muted-foreground">{new Intl.NumberFormat('tr-TR', { notation: "compact", maximumFractionDigits: 1 }).format(min)}</span>
                    </div>
                    <div className="text-[10px] md:text-xs font-medium text-muted-foreground rotate-180 tracking-widest whitespace-nowrap px-1" style={{ writingMode: 'vertical-rl' }}>
                        Biniş Adedi
                    </div>
                </div>

            </div>
        </div>
    );
}
