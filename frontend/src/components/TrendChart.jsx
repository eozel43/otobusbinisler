import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Layers, Users, Wallet, Coins, CreditCard } from 'lucide-react';

export function TrendChart({ data }) {
    const [activeMetric, setActiveMetric] = useState('boardings'); // 'boardings', 'sanal', 'revenue', 'yield'
    const [viewMode, setViewMode] = useState('total'); // 'total' or 'split'

    // Data comes in daily format. We need to aggregate it by month for the chart.
    const { chartData, averageChange } = useMemo(() => {
        if (!data || data.length === 0) return { chartData: [], averageChange: 0 };

        const aggregated = {};

        data.forEach(item => {
            // item.date is YYYY-MM-DD. We want YYYY-MM
            const monthKey = item.date.substring(0, 7) + '-01'; // Normalize to first day of month

            if (!aggregated[monthKey]) {
                aggregated[monthKey] = { date: monthKey, boardings: 0, free: 0, paid: 0, revenue: 0, sanal: 0 };
            }
            aggregated[monthKey].boardings += item.boardings || 0;
            aggregated[monthKey].free += item.free || 0;
            aggregated[monthKey].revenue += item.revenue || 0;
            aggregated[monthKey].sanal += item.sanal || 0;
        });

        // Calculate paid, yield and convert to array
        const sortedData = Object.values(aggregated).map(d => {
            const yieldVal = d.boardings > 0 ? d.revenue / d.boardings : 0;
            return {
                ...d,
                paid: Math.max(0, d.boardings - d.free),
                yield: parseFloat(yieldVal.toFixed(2))
            };
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        let slope = 0;
        const dataKey = activeMetric;

        if (sortedData.length > 1) {
            const n = sortedData.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

            for (let i = 0; i < n; i++) {
                sumX += i;
                const yVal = sortedData[i][dataKey] || 0;
                sumY += yVal;
                sumXY += i * yVal;
                sumXX += i * i;
            }

            slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            const finalData = sortedData.map((d, i) => ({
                ...d,
                trend: slope * i + intercept
            }));

            return { chartData: finalData, averageChange: slope };
        }

        return { chartData: sortedData, averageChange: 0 };
    }, [data, activeMetric]);

    const isPositive = averageChange >= 0;

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'total' ? 'split' : 'total');
    };

    const formatAverageChange = (val) => {
        const absVal = Math.abs(val);
        const prefix = val >= 0 ? '+' : '-';
        if (activeMetric === 'boardings') {
            return `${prefix}${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(absVal)} yolcu`;
        } else if (activeMetric === 'sanal') {
            return `${prefix}${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(absVal)} biniş`;
        } else if (activeMetric === 'revenue') {
            return `${prefix}${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(absVal)}`;
        } else {
            return `${prefix}${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(absVal)}`;
        }
    };

    const formatYAxis = (value) => {
        if (activeMetric === 'boardings' || activeMetric === 'sanal') {
            return `${(value / 1000).toFixed(0)}k`;
        } else if (activeMetric === 'revenue') {
            if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M ₺`;
            }
            return `${(value / 1000).toFixed(0)}k ₺`;
        } else {
            return `${value.toFixed(1)} ₺`;
        }
    };

    const formatTooltip = (value, name) => {
        let formattedValue;
        if (name === 'Toplam Yolcu' || name === 'Ücretli Biniş' || name === 'Ücretsiz Biniş') {
            formattedValue = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value) + " Yolcu";
        } else if (name === 'Sanal Kart Biniş') {
            formattedValue = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value) + " Biniş";
        } else if (name === 'Toplam Hasılat') {
            formattedValue = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
        } else if (name === 'Biniş Başı Net Gelir') {
            formattedValue = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
        } else if (name === 'Eğilim (Trend)') {
            if (activeMetric === 'boardings' || activeMetric === 'sanal') {
                formattedValue = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value) + " Yolcu";
            } else if (activeMetric === 'revenue') {
                formattedValue = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
            } else {
                formattedValue = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
            }
        } else {
            formattedValue = value;
        }
        
        return [formattedValue, name];
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col h-[480px]">
            {/* Header section with responsive flex-wrap controls */}
            <div className="p-6 pb-4 flex flex-col xl:flex-row justify-between items-start xl:items-center shrink-0 gap-4">
                <div className="space-y-1.5">
                    <h3 className="font-semibold leading-none tracking-tight font-lexend">Aylık Operasyonel Trend</h3>
                    <p className="text-sm text-muted-foreground font-medium">Ay bazında yolcu, Sanal Kart, hasılat ve verim trend analizi</p>
                </div>
                
                {/* Controls toolbar */}
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Metric Select Tab Group */}
                    <div className="flex bg-secondary/50 p-1 rounded-xl border border-border shadow-inner">
                        <button
                            onClick={() => {
                                setActiveMetric('boardings');
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeMetric === 'boardings' ? 'bg-background text-blue-600 dark:text-blue-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Users size={13} />
                            <span>Yolcu Sayısı</span>
                        </button>
                        <button
                            onClick={() => {
                                setActiveMetric('sanal');
                                setViewMode('total');
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeMetric === 'sanal' ? 'bg-background text-violet-600 dark:text-violet-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <CreditCard size={13} />
                            <span>Sanal Kart</span>
                        </button>
                        <button
                            onClick={() => {
                                setActiveMetric('revenue');
                                setViewMode('total'); // Split is only for boardings
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeMetric === 'revenue' ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Wallet size={13} />
                            <span>Toplam Hasılat</span>
                        </button>
                        <button
                            onClick={() => {
                                setActiveMetric('yield');
                                setViewMode('total'); // Split is only for boardings
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeMetric === 'yield' ? 'bg-background text-amber-600 dark:text-amber-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Coins size={13} />
                            <span>Biniş Başı Gelir</span>
                        </button>
                    </div>

                    {/* Paid/Free view mode toggle for boardings */}
                    {activeMetric === 'boardings' && (
                        <button
                            onClick={toggleViewMode}
                            className="flex items-center gap-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-xl transition-all border border-border"
                            title="Grafik görünümünü değiştir"
                        >
                            <Layers size={13} />
                            <span>{viewMode === 'total' ? 'Detay (Ücretli/Ücretsiz)' : 'Toplam Görünüm'}</span>
                        </button>
                    )}

                    {/* Dynamic Trend Badge */}
                    {chartData.length > 1 && (
                        <div
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border cursor-help transition-opacity hover:opacity-80 ${isPositive ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'}`}
                            title={`Aylık trend ${activeMetric === 'boardings' ? 'yolcu' : activeMetric === 'sanal' ? 'sanal kart binişi' : activeMetric === 'revenue' ? 'hasılat' : 'biniş başı gelir'} artış/azalış eğimi`}
                        >
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span className="text-xs font-bold font-mono">
                                {formatAverageChange(averageChange)} <span className="text-[10px] font-normal opacity-75">Trend Eğimi</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Area */}
            <div className="p-0 flex-1 min-h-0 pl-2 pr-4 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatYAxis}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', fontSize: '12px' }}
                            itemStyle={{ color: '#f8fafc' }}
                            labelFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                            formatter={formatTooltip}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 500 }} />
                        
                        {/* Dynamic Render based on Active Metric and View Mode */}
                        {activeMetric === 'boardings' ? (
                            viewMode === 'total' ? (
                                <>
                                    <Line type="monotone" dataKey="boardings" name="Toplam Yolcu" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="trend" name="Eğilim (Trend)" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </>
                            ) : (
                                <>
                                    <Line type="monotone" dataKey="paid" name="Ücretli Biniş" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="free" name="Ücretsiz Biniş" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                </>
                            )
                        ) : activeMetric === 'sanal' ? (
                            <>
                                <Line type="monotone" dataKey="sanal" name="Sanal Kart Biniş" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="trend" name="Eğilim (Trend)" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </>
                        ) : activeMetric === 'revenue' ? (
                            <>
                                <Line type="monotone" dataKey="revenue" name="Toplam Hasılat" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="trend" name="Eğilim (Trend)" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </>
                        ) : (
                            <>
                                <Line type="monotone" dataKey="yield" name="Biniş Başı Net Gelir" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="trend" name="Eğilim (Trend)" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
