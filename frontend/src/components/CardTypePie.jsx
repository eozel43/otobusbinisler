
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export function CardTypePie({ data }) {
    const total = React.useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-3 flex flex-col h-[400px]">
            <div className="p-6 pb-4 flex flex-col space-y-1.5 shrink-0">
                <h3 className="font-semibold leading-none tracking-tight">Kart Tipi Dağılımı</h3>
                <p className="text-sm text-muted-foreground">Kullanılan kart türlerine göre oranlar</p>
            </div>
            <div className="p-0 flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                borderColor: 'hsl(var(--border))',
                                color: 'hsl(var(--popover-foreground))',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: 'hsl(var(--popover-foreground))', fontSize: '13px' }}
                            formatter={(value, name) => [
                                `%${(total > 0 ? (value / total) * 100 : 0).toFixed(1)} (${new Intl.NumberFormat('tr-TR').format(value)} Biniş)`,
                                name
                            ]}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
