
import React from 'react';

export function RouteTable({ data }) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 flex flex-col h-[500px]">
            <div className="p-6 pb-4 flex flex-col space-y-1.5 shrink-0">
                <h3 className="font-semibold leading-none tracking-tight">En Yoğun 10 Hat</h3>
                <p className="text-sm text-muted-foreground">Biniş sayısına göre sıralı</p>
            </div>
            <div className="p-0 flex-1 overflow-hidden">
                <div className="h-full w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b sticky top-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 z-10 shadow-sm">
                            <tr className="border-b border-border transition-colors">
                                <th className="h-10 px-6 align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider">Hat Adı</th>
                                <th className="h-10 px-6 align-middle font-medium text-muted-foreground text-right text-xs uppercase tracking-wider">Biniş Adedi</th>
                                <th className="h-10 px-6 align-middle font-medium text-muted-foreground text-right text-xs uppercase tracking-wider">Hasılat</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {data.map((route, index) => (
                                <tr key={index} className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group">
                                    <td className="p-4 px-6 align-middle font-medium text-foreground transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground ring-1 ring-border">
                                                {index + 1}
                                            </span>
                                            {route.name}
                                        </div>
                                    </td>
                                    <td className="p-4 px-6 align-middle text-right font-mono text-foreground/80 transition-colors">
                                        {new Intl.NumberFormat('tr-TR').format(route.boardings)}
                                    </td>
                                    <td className="p-4 px-6 align-middle text-right font-mono text-primary group-hover:text-primary/80 transition-colors">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(route.revenue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
