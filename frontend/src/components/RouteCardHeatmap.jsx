import { useMemo } from 'react';
import { Layers, Info } from 'lucide-react';

export function RouteCardHeatmap({ data }) {
    const { routes = [], clusters = [], matrix = {} } = data || {};

    // Find min and max for color scaling
    const { min, max } = useMemo(() => {
        if (!routes.length || !clusters.length) {
            return { min: 0, max: 100 };
        }
        let minVal = Infinity;
        let maxVal = -Infinity;
        routes.forEach(r => {
            clusters.forEach(c => {
                const val = matrix[r]?.[c] || 0;
                if (val > 0) {
                    if (val < minVal) minVal = val;
                    if (val > maxVal) maxVal = val;
                }
            });
        });
        return {
            min: minVal === Infinity ? 0 : minVal,
            max: maxVal === -Infinity ? 100 : maxVal
        };
    }, [routes, clusters, matrix]);

    // data is expected to be: { routes: [...], clusters: [...], matrix: { route: { cluster: val } } }
    if (!data || !data.routes || data.routes.length === 0) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Isı haritası için veri bulunamadı.</p>
            </div>
        );
    }

    const getColor = (value) => {
        if (!value || value === 0) return 'var(--slate-100, #f8fafc)';
        
        // Normalize value between 0 and 1
        const normalized = (value - min) / (max - min || 1);
        
        // Hue: 215 (Blue), Saturation: 85%, Lightness: 95% (light) to 45% (dark blue)
        const lightness = 95 - (normalized * 50);
        return `hsl(215, 85%, ${lightness}%)`;
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow w-full col-span-full">
            <div className="p-6 pb-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5">
                    <h3 className="font-semibold text-lg leading-none tracking-tight font-lexend flex items-center gap-2">
                        <Layers size={18} className="text-blue-500" />
                        Hat × Kart Tipi Yoğunluk Haritası (Heatmap)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        En yüksek biniş yapılan 10 hatta en yaygın 6 kart tipinin dağılımı
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-border">
                    <Info size={14} className="text-blue-500" />
                    <span>Daha koyu renkler daha yüksek biniş yoğunluğunu gösterir.</span>
                </div>
            </div>
            
            <div className="p-6 pt-4 overflow-x-auto">
                <div className="min-w-[800px] flex flex-col">
                    {/* Header Row (Clusters / Card Types) */}
                    <div className="flex border-b border-border/60 pb-2 mb-2">
                        <div className="w-[220px] font-bold text-xs text-muted-foreground uppercase tracking-wider pl-2 shrink-0">
                            Hat Adı
                        </div>
                        <div className="flex flex-1 justify-between gap-1.5">
                            {clusters.map(cluster => (
                                <div key={cluster} className="flex-1 text-center font-bold text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate px-1" title={cluster}>
                                    {cluster}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data Rows (Routes) */}
                    <div className="flex flex-col gap-1.5">
                        {routes.map(routeName => (
                            <div key={routeName} className="flex items-stretch group hover:bg-muted/10 rounded-lg">
                                {/* Row Header (Route name) */}
                                <div className="w-[220px] pr-4 flex items-center text-xs font-semibold text-foreground/90 shrink-0 truncate py-2" title={routeName}>
                                    {routeName}
                                </div>
                                
                                {/* Cells */}
                                <div className="flex flex-1 justify-between gap-1.5">
                                    {clusters.map(clusterName => {
                                        const val = matrix[routeName]?.[clusterName] || 0;
                                        const color = getColor(val);
                                        const isDark = val > 0 && ((val - min) / (max - min || 1)) > 0.4;
                                        
                                        return (
                                            <div
                                                key={`${routeName}-${clusterName}`}
                                                className="flex-1 flex items-center justify-center rounded-md h-12 md:h-14 transition-all hover:ring-2 ring-blue-500/50 cursor-default relative group/cell"
                                                style={{ backgroundColor: color }}
                                            >
                                                <span className={`text-[10px] md:text-xs font-mono font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                    {val > 0 ? new Intl.NumberFormat('tr-TR').format(val) : '-'}
                                                </span>
                                                
                                                {/* Cell Tooltip */}
                                                {val > 0 && (
                                                    <div className="absolute opacity-0 pointer-events-none group-hover/cell:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 shadow-xl -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 space-y-0.5">
                                                        <p className="font-extrabold text-blue-400 font-lexend">{routeName}</p>
                                                        <p className="font-medium text-slate-300">{clusterName}: <span className="font-mono font-bold text-white">{new Intl.NumberFormat('tr-TR').format(val)}</span> biniş</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
