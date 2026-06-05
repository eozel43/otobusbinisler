import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { HelpCircle } from 'lucide-react';

export function RouteEfficiencyChart({ data }) {
    // 1. Filter out routes with 0 boardings for a cleaner chart
    const activeData = useMemo(() => {
        if (!data) return [];
        return data.filter(r => r.boardings > 0);
    }, [data]);

    // 2. Calculate average boardings and revenue for quadrant lines
    const { avgBoardings, avgRevenue } = useMemo(() => {
        if (activeData.length === 0) return { avgBoardings: 0, avgRevenue: 0 };
        const totalB = activeData.reduce((sum, r) => sum + r.boardings, 0);
        const totalR = activeData.reduce((sum, r) => sum + r.revenue, 0);
        return {
            avgBoardings: Math.round(totalB / activeData.length),
            avgRevenue: Math.round(totalR / activeData.length)
        };
    }, [activeData]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
    };

    const formatNumber = (val) => {
        return new Intl.NumberFormat('tr-TR').format(val);
    };

    // Custom Tooltip component
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const info = payload[0].payload;
            const avgFare = info.boardings > 0 ? info.revenue / info.boardings : 0;
            return (
                <div className="bg-slate-900 border border-slate-700 text-slate-100 p-4 rounded-xl shadow-xl max-w-sm space-y-2 backdrop-blur-md bg-opacity-95">
                    <p className="font-extrabold text-sm border-b border-slate-700 pb-1.5 text-blue-400 font-lexend">{info.name}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-medium">
                        <span className="text-slate-400">Toplam Biniş:</span>
                        <span className="text-right font-mono text-slate-200">{formatNumber(info.boardings)}</span>
                        
                        <span className="text-slate-400">Toplam Hasılat:</span>
                        <span className="text-right font-mono text-emerald-400">{formatCurrency(info.revenue)}</span>
                        
                        <span className="text-slate-400">Ücretsiz Biniş:</span>
                        <span className="text-right font-mono text-red-400">%{info.freeRatio}</span>

                        <span className="text-slate-400">Biniş Başı Gelir:</span>
                        <span className="text-right font-mono text-yellow-400">{formatCurrency(avgFare)}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (activeData.length === 0) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 h-[500px] flex items-center justify-center">
                <p className="text-muted-foreground">Grafiği görüntülemek için veri bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col h-[520px]">
            {/* Header */}
            <div className="p-6 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-4">
                <div className="space-y-1.5">
                    <h3 className="font-semibold leading-none tracking-tight font-lexend flex items-center gap-2">
                        Hat Verimlilik Matrisi (4 Kadran Analizi)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Yatay Eksen (X): Yolcu Sayısı | Dikey Eksen (Y): Toplam Hasılat. Balon boyutu ücretsiz biniş oranını (%) temsil eder.
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-border">
                    <HelpCircle size={14} className="text-blue-500" />
                    <span>Kesikli çizgiler ortalama değerleri gösterir.</span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="p-0 flex-1 min-h-0 pl-2 pr-6 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 45, left: 65 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        
                        <XAxis 
                            type="number" 
                            dataKey="boardings" 
                            name="Biniş Sayısı" 
                            stroke="#888888"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        >
                            <Label value="Yolcu Sayısı (Toplam Biniş)" offset={-30} position="insideBottom" fill="#94a3b8" style={{ textAnchor: 'middle', fontSize: '11px', fontWeight: 'bold', fill: '#94a3b8' }} />
                        </XAxis>
                        
                        <YAxis 
                            type="number" 
                            dataKey="revenue" 
                            name="Hasılat" 
                            stroke="#888888"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        >
                            <Label value="Toplam Hasılat (TRY)" angle={-90} position="insideLeft" offset={-45} style={{ textAnchor: 'middle', fontSize: '11px', fontWeight: 'bold', fill: '#94a3b8' }} fill="#94a3b8" />
                        </YAxis>
                        
                        {/* Z-Axis determines bubble size */}
                        <ZAxis 
                            type="number" 
                            dataKey="freeRatio" 
                            range={[60, 450]} 
                        />
                        
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#64748b', strokeWidth: 1 }} />
                        
                        {/* Reference lines to divide into 4 quadrants */}
                        <ReferenceLine 
                            x={avgBoardings} 
                            stroke="#64748b" 
                            strokeDasharray="5 5" 
                            strokeWidth={1.5}
                            label={{ value: `Ort. Yolcu: ${formatNumber(avgBoardings)}`, position: 'top', fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
                        />
                        <ReferenceLine 
                            y={avgRevenue} 
                            stroke="#64748b" 
                            strokeDasharray="5 5" 
                            strokeWidth={1.5}
                            label={{ value: `Ort. Hasılat: ${formatCurrency(avgRevenue)}`, position: 'right', fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
                        />
                        
                        {/* Scatter plot points */}
                        <Scatter 
                            name="Hatlar" 
                            data={activeData} 
                            fill="url(#bubbleGradient)"
                        />
                        
                        {/* Definition for smooth bubble gradient */}
                        <defs>
                            <radialGradient id="bubbleGradient" cx="30%" cy="30%" r="70%">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.9} />
                            </radialGradient>
                        </defs>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* Quadrant Legend Footer */}
            <div className="px-6 py-4 border-t border-border/50 bg-secondary/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                    <p className="font-bold text-blue-600 dark:text-blue-400">Kadran I (Sağ Üst)</p>
                    <p className="text-muted-foreground text-[10px] leading-tight">Yüksek Yolcu - Yüksek Hasılat (Ana Omurga Hatları)</p>
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">Kadran II (Sol Üst)</p>
                    <p className="text-muted-foreground text-[10px] leading-tight">Düşük Yolcu - Yüksek Hasılat (Ekspres / Verimli Hatlar)</p>
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-amber-600 dark:text-amber-400">Kadran III (Sol Alt)</p>
                    <p className="text-muted-foreground text-[10px] leading-tight">Düşük Yolcu - Düşük Hasılat (Optimizasyon Gereken Hatlar)</p>
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-rose-600 dark:text-rose-400">Kadran IV (Sağ Alt)</p>
                    <p className="text-muted-foreground text-[10px] leading-tight">Yüksek Yolcu - Düşük Hasılat (Sosyal / Ücretsiz Yoğun Hatlar)</p>
                </div>
            </div>
        </div>
    );
}
