import { ArrowDownRight, TrendingDown, Percent, ShieldAlert } from 'lucide-react';

export function ExecutiveExceptionTable({ data }) {
    // data is expected to be: { decliningRoutes: [...], highFreeRatioRoutes: [...] }
    if (!data || (!data.decliningRoutes?.length && !data.highFreeRatioRoutes?.length)) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 h-[250px] flex items-center justify-center">
                <p className="text-muted-foreground">İstisna verisi bulunamadı veya karşılaştırma dönemi eksik.</p>
            </div>
        );
    }

    const { decliningRoutes, highFreeRatioRoutes } = data;
    const formatNumber = (val) => new Intl.NumberFormat('tr-TR').format(Math.abs(val));

    return (
        <div className="grid gap-6 md:grid-cols-2 w-full col-span-full">
            {/* Table 1: Top Declining Routes */}
            <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col h-[400px]">
                <div className="p-6 pb-4 flex items-center justify-between border-b border-border/50 shrink-0">
                    <div className="space-y-1">
                        <h3 className="font-semibold leading-none tracking-tight font-lexend flex items-center gap-2">
                            <TrendingDown size={18} className="text-red-500" />
                            En Çok Düşüş Gösteren Hatlar
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Önceki aya kıyasla biniş adedi en fazla düşen 5 hat
                        </p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                        <ArrowDownRight size={12} />
                        MoM Düşüş
                    </span>
                </div>
                
                <div className="flex-1 overflow-auto p-0">
                    {decliningRoutes.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                            Düşüş gösteren hat bulunamadı.
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/30 sticky top-0 z-10 border-b border-border/50">
                                <tr className="text-xs font-semibold text-muted-foreground">
                                    <th className="p-3 pl-6">Hat Adı</th>
                                    <th className="p-3 text-right">Önceki Ay</th>
                                    <th className="p-3 text-right">Bu Ay</th>
                                    <th className="p-3 text-right text-red-500">Değişim</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 font-mono text-xs">
                                {decliningRoutes.map((route, idx) => (
                                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                        <td className="p-3 pl-6 font-sans font-medium text-foreground max-w-[180px] truncate" title={route.name}>
                                            {route.name}
                                        </td>
                                        <td className="p-3 text-right text-muted-foreground">
                                            {formatNumber(route.previous)}
                                        </td>
                                        <td className="p-3 text-right text-foreground">
                                            {formatNumber(route.current)}
                                        </td>
                                        <td className="p-3 text-right font-bold text-red-600 dark:text-red-400">
                                            -{formatNumber(route.difference)} (-{Math.abs(route.pctChange)}%)
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Table 2: High Free Ratio Routes */}
            <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col h-[400px]">
                <div className="p-6 pb-4 flex items-center justify-between border-b border-border/50 shrink-0">
                    <div className="space-y-1">
                        <h3 className="font-semibold leading-none tracking-tight font-lexend flex items-center gap-2">
                            <ShieldAlert size={18} className="text-amber-500" />
                            Ücretsiz Biniş Oranı En Yüksek Hatlar
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Toplam biniş içinde ücretsiz kart biniş oranı en yüksek 5 hat
                        </p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                        <Percent size={12} />
                        Sosyal Hatlar
                    </span>
                </div>
                
                <div className="flex-1 overflow-auto p-0">
                    {highFreeRatioRoutes.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                            Veri bulunamadı.
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/30 sticky top-0 z-10 border-b border-border/50">
                                <tr className="text-xs font-semibold text-muted-foreground">
                                    <th className="p-3 pl-6">Hat Adı</th>
                                    <th className="p-3 text-right">Toplam Biniş</th>
                                    <th className="p-3 text-right">Ücretsiz</th>
                                    <th className="p-3 text-right text-amber-500">Ücretsiz Oranı</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 font-mono text-xs">
                                {highFreeRatioRoutes.map((route, idx) => (
                                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                        <td className="p-3 pl-6 font-sans font-medium text-foreground max-w-[180px] truncate" title={route.name}>
                                            {route.name}
                                        </td>
                                        <td className="p-3 text-right text-muted-foreground">
                                            {formatNumber(route.boardings)}
                                        </td>
                                        <td className="p-3 text-right text-foreground">
                                            {formatNumber(route.freeBoardings)}
                                        </td>
                                        <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5">
                                            %{route.ratio}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
