import React, { useEffect, useState, useMemo } from 'react';
import { Users, CreditCard, Wallet, LogOut, Bus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatsCard } from './components/StatsCard';
import { TrendChart } from './components/TrendChart';
import { RouteTable } from './components/RouteTable';
import { CardTypePie } from './components/CardTypePie';
import { FilterBar } from './components/FilterBar';
import { ThemeToggle } from './components/ThemeToggle';
import { Login } from './components/Login';
import { SummaryTable } from './components/SummaryTable';
import { HeatmapChart } from './components/HeatmapChart';
import { RouteEfficiencyChart } from './components/RouteEfficiencyChart';
import { processDashboardData } from './utils/analytics';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [rawData, setRawData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [selectedFilters, setSelectedFilters] = useState({
        year: [],
        month: [],
        route: [],
        cluster: [],
        type: [],
        onlyFree: false
    });

    useEffect(() => {
        fetch(`/data/dashboard_data.json`)
            .then(res => res.json())
            .then(data => {
                setRawData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading data:", err);
                setFetchError("Veriler yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip sayfayı yenileyin.");
                setLoading(false);
            });
    }, []);

    const handleFilterChange = (key, value) => {
        if (key === 'reset') {
            setSelectedFilters({ year: [], month: [], route: [], cluster: [], type: [], onlyFree: false });
        } else {
            setSelectedFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    // --- Dynamic Aggregation Logic ---
    const lastUpdatedDate = useMemo(() => {
        if (rawData && rawData.lastUpdated) {
            return rawData.lastUpdated;
        }
        return new Date().toLocaleDateString('tr-TR');
    }, [rawData]);

    const dashboardData = useMemo(() => {
        return processDashboardData(rawData, selectedFilters);
    }, [rawData, selectedFilters]);

    if (!isAuthenticated) {
        return <Login onLogin={() => setIsAuthenticated(true)} />;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white gap-4">
                <div className="text-red-500 bg-red-500/10 p-4 rounded-full">
                    <LogOut className="h-12 w-12" />
                </div>
                <h2 className="text-xl font-bold">Bağlantı Hatası</h2>
                <p className="text-slate-400">{fetchError}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    if (!rawData) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground font-sans transition-colors duration-500 selection:bg-blue-500/30">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col"
            >
                {/* Sticky Header and Filter Section */}
                <div className="sticky top-0 z-50 w-full bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-border/50 pt-6 md:pt-8 pb-2 px-4 md:px-8 shadow-sm">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header with Logotype */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                {/* Branded Logotype */}
                                <motion.div 
                                    whileHover={{ rotate: -5, scale: 1.05 }}
                                    className="h-12 w-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20"
                                >
                                    <Bus className="h-7 w-7 text-white" />
                                </motion.div>
                                <div className="space-y-0.5">
                                    <h1 className="text-xl md:text-2xl font-black tracking-tighter flex flex-wrap items-center gap-x-1.5 font-lexend uppercase leading-none">
                                        <span className="text-blue-600 dark:text-blue-400">ULAŞIM HİZMETLERİ</span>
                                        <span className="text-slate-400 dark:text-slate-600 font-light text-lg md:text-xl">MÜDÜRLÜĞÜ</span>
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Operasyonel Analiz Sistemi</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 self-start md:self-auto">
                                <div className="flex items-center space-x-2 bg-card text-card-foreground p-2 rounded-lg border border-border shadow-sm">
                                    <span className="text-sm font-medium text-muted-foreground px-2">Son Güncelleme:</span>
                                    <span className="text-sm font-bold text-foreground">{lastUpdatedDate}</span>
                                </div>
                                <ThemeToggle />
                                <button
                                    onClick={() => setIsAuthenticated(false)}
                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                                    title="Çıkış Yap"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <FilterBar
                            filters={dashboardData.filters}
                            selected={selectedFilters}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 space-y-8">

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatsCard
                        title="Toplam Biniş"
                        value={new Intl.NumberFormat('tr-TR').format(dashboardData.kpi.totalBoardings)}
                        icon={Users}
                        description={`Aylık Ortalama: ${new Intl.NumberFormat('tr-TR').format(Math.round(dashboardData.kpi.totalBoardings / dashboardData.kpi.uniqueMonthsCount))}`}
                    />
                    <StatsCard
                        title="Toplam Hasılat"
                        value={new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(dashboardData.kpi.totalRevenue)}
                        icon={Wallet}
                        description={`Aylık Ortalama: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(dashboardData.kpi.totalRevenue / dashboardData.kpi.uniqueMonthsCount)}`}
                    />
                    <StatsCard
                        title="Ücretsiz Binişler"
                        value={new Intl.NumberFormat('tr-TR').format(dashboardData.kpi.freeBoardings)}
                        icon={CreditCard}
                        description={`Aylık Ortalama: ${new Intl.NumberFormat('tr-TR').format(Math.round(dashboardData.kpi.freeBoardings / dashboardData.kpi.uniqueMonthsCount))}`}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-1">
                    <TrendChart data={dashboardData.trends} key={selectedFilters.onlyFree ? 'free' : 'normal'} />
                    <div className="grid gap-4 md:grid-cols-2">
                        <CardTypePie data={dashboardData.cardTypes} />
                        <CardTypePie
                            data={dashboardData.paidFreeTypes}
                            title="Ücretli / Ücretsiz"
                            description="Ücretli ve ücretsiz biniş oranları"
                            largeLegend={true}
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <CardTypePie
                            data={dashboardData.krediPieData}
                            title="Kredi Kartı Biniş Oranı"
                            description="Kredi Kartlı Biniş / Toplam Biniş"
                            largeLegend={true}
                        />
                        <CardTypePie
                            data={dashboardData.aktarmaPieData}
                            title="Aktarma Biniş Oranı"
                            description="Aktarma / Toplam Biniş"
                            largeLegend={true}
                        />
                    </div>
                    <RouteEfficiencyChart data={dashboardData.topRoutes} />
                    {/* Heatmap Section */}
                    <AnimatePresence mode="wait">
                        <motion.div 
                            className="mt-4 flex flex-col items-center"
                            key={JSON.stringify(selectedFilters)}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4 }}
                        >
                            <HeatmapChart data={dashboardData.heatmapData} total={
                                dashboardData.heatmapData ? Object.values(dashboardData.heatmapData).reduce((sum, yearData) => sum + Object.values(yearData).reduce((s, v) => s + v, 0), 0) : 0
                            } />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Tables Section */}
                <div className="grid gap-4 md:grid-cols-1">
                    <SummaryTable data={dashboardData.summaryData} />
                    <RouteTable data={dashboardData.topRoutes} />
                </div>

                {/* Footer Section */}
                <footer className="mt-12 pb-8 text-center space-y-4 border-t border-border/50 pt-8">
                    <p className="text-[11px] text-muted-foreground/60 max-w-4xl mx-auto px-4 leading-relaxed">
                        Bu platformda yer alan içerikler, veri güvenliği ve kurumsal kullanım esasları çerçevesinde yalnızca yetkili kullanıcıların erişimine sunulmuştur. İçeriklerin amacı dışında kullanılması, izinsiz paylaşılması, çoğaltılması, üçüncü kişilere aktarılması veya herhangi bir surette kötüye kullanılması yasaktır. Belediyemiz, ilgili mevzuat ve veri güvenliği hükümleri kapsamında tüm hukuki haklarını saklı tutar.
                    </p>
                    <p className="text-muted-foreground italic text-sm font-lexend font-medium">
                        Hazırlayan: Endüstri Yük. Mühendisi Emre ÖZEL
                    </p>
                </footer>
                </div>
            </motion.div>
        </div>
    );
}

export default App;
