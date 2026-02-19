
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function TrendChart({ data }) {
    // Data comes in daily format. We need to aggregate it by month for the chart.
    const monthlyData = React.useMemo(() => {
        if (!data) return [];

        const aggregated = {};

        data.forEach(item => {
            // item.date is YYYY-MM-DD. We want YYYY-MM
            const monthKey = item.date.substring(0, 7) + '-01'; // Normalize to first day of month

            if (!aggregated[monthKey]) {
                aggregated[monthKey] = { date: monthKey, boardings: 0 };
            }
            aggregated[monthKey].boardings += item.boardings || 0;
        });

        // Convert back to array and sort
        const sortedData = Object.values(aggregated).sort((a, b) => new Date(a.date) - new Date(b.date));

        if (sortedData.length > 1) {
            const n = sortedData.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

            for (let i = 0; i < n; i++) {
                sumX += i;
                sumY += sortedData[i].boardings;
                sumXY += i * sortedData[i].boardings;
                sumXX += i * i;
            }

            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            return sortedData.map((d, i) => ({
                ...d,
                trend: slope * i + intercept
            }));
        }
        return sortedData;
    }, [data]);

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 flex flex-col h-[400px]">
            <div className="p-6 pb-4 flex flex-col space-y-1.5 shrink-0">
                <h3 className="font-semibold leading-none tracking-tight">Aylık Biniş Trendi</h3>
                <p className="text-sm text-muted-foreground">Ay bazında toplam biniş ve trend analizi</p>
            </div>
            <div className="p-0 flex-1 min-h-0 pl-2 pr-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
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
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            itemStyle={{ color: '#f8fafc' }}
                            labelFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                            formatter={(value, name) => [new Intl.NumberFormat('tr-TR').format(value), name === 'trend' ? 'Trend' : 'Biniş']}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="boardings" name="Biniş" stroke="#3b82f6" strokeWidth={2} dot={true} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="trend" name="Trend" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
