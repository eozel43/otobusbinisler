
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';

export function TrendChart({ data }) {
    const [viewMode, setViewMode] = useState('total'); // 'total' or 'split'

    // Data comes in daily format. We need to aggregate it by month for the chart.
    const { chartData, averageChange } = useMemo(() => {
        if (!data || data.length === 0) return { chartData: [], averageChange: 0 };

        const aggregated = {};

        data.forEach(item => {
            // item.date is YYYY-MM-DD. We want YYYY-MM
            const monthKey = item.date.substring(0, 7) + '-01'; // Normalize to first day of month

            if (!aggregated[monthKey]) {
                aggregated[monthKey] = { date: monthKey, boardings: 0, free: 0, paid: 0 };
            }
            aggregated[monthKey].boardings += item.boardings || 0;
            aggregated[monthKey].free += item.free || 0;
        });

        // Calculate paid and convert to array
        const sortedData = Object.values(aggregated).map(d => ({
            ...d,
            paid: d.boardings - d.free
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        let slope = 0;

        if (sortedData.length > 1) {
            const n = sortedData.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

            for (let i = 0; i < n; i++) {
                sumX += i;
                sumY += sortedData[i].boardings;
                sumXY += i * sortedData[i].boardings;
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
    }, [data]);

    const isPositive = averageChange >= 0;
    const absChange = Math.abs(averageChange);

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'total' ? 'split' : 'total');
    };

    const formatTooltip = (value, name) => {
        const formattedValue = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value);
        let formattedName = name;
        if (name === 'trend') formattedName = 'Trend';
        else if (name === 'boardings') formattedName = 'Toplam Biniş';
        else if (name === 'paid') formattedName = 'Ücretli Biniş';
        else if (name === 'free') formattedName = 'Ücretsiz Biniş';
        
        return [formattedValue, formattedName];
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col h-[450px]">
            <div className="p-6 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-4">
                <div className="space-y-1.5">
                    <h3 className="font-semibold leading-none tracking-tight font-lexend">Aylık Biniş Trendi</h3>
                    <p className="text-sm text-muted-foreground">Ay bazında biniş trendi ve değişim analizi</p>
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                    <button
                        onClick={toggleViewMode}
                        className="flex items-center gap-2 text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors border border-border"
                        title="Grafik görünümünü değiştir"
                    >
                        <Layers size={16} />
                        {viewMode === 'total' ? 'Detaylı Görünüm (Ücretli/Ücretsiz)' : 'Toplam Görünüm'}
                    </button>
                    {chartData.length > 1 && viewMode === 'total' && (
                        <div
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border cursor-help transition-opacity hover:opacity-80 ${isPositive ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'}`}
                            title="Aylık ortalama biniş değişimi"
                        >
                            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span className="text-sm font-semibold">
                                {isPositive ? '+' : '-'} {new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(absChange)} <span className="text-xs font-normal opacity-75">ort/ay</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-0 flex-1 min-h-0 pl-2 pr-4 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#f8fafc' }}
                            labelFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                            formatter={formatTooltip}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        
                        {viewMode === 'total' ? (
                            <>
                                <Line type="monotone" dataKey="boardings" name="Toplam Biniş" stroke="#3b82f6" strokeWidth={3} dot={true} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="trend" name="Trend" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </>
                        ) : (
                            <>
                                <Line type="monotone" dataKey="paid" name="Ücretli Biniş" stroke="#10b981" strokeWidth={2.5} dot={true} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="free" name="Ücretsiz Biniş" stroke="#8b5cf6" strokeWidth={2.5} dot={true} activeDot={{ r: 6 }} />
                            </>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
