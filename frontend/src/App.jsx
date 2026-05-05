import React, { useEffect, useState, useMemo } from 'react';
import { LayoutDashboard, Users, CreditCard, Wallet, TrendingUp, LogOut, Bus } from 'lucide-react';
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

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [rawData, setRawData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [selectedFilters, setSelectedFilters] = useState({
        year: [],
        month: [],
        route: [],
        cluster: [],
        type: [],
        onlyFree: false
    });

    useEffect(() => {
        console.log("App Version: v1.4 (Ortalama KPI & Yeni Donut Chartlar Eklendi)"); // Verification Log
        fetch(`/data/dashboard_data.json?t=${new Date().getTime()}`)
            .then(res => res.json())
            .then(data => {
                setRawData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading data:", err);
                setLoading(false);
            });

        // Print Screen prevention
        const handleKeyUp = (e) => {
            if (e.key === 'PrintScreen') {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText('');
                }
                alert('Ekran görüntüsü alınmasına izin verilmiyor.');
            }
        };

        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keyup', handleKeyUp);
        };
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
        if (!rawData) return null;

        // Extract available Years and Months for filters
        const availableYears = [...new Set(rawData.records.map(r => r.date.substring(0, 4)))].sort().reverse();
        const availableMonths = [...new Set(rawData.records.map(r => parseInt(r.date.substring(5, 7), 10)))].sort((a, b) => a - b);

        const augmentedFilters = {
            ...rawData.filters,
            years: availableYears,
            months: availableMonths
        };

        // 1. Filter Records
        const filteredRecords = rawData.records.filter(record => {
            const rYear = record.date.substring(0, 4);
            const rMonth = parseInt(record.date.substring(5, 7), 10);

            if (selectedFilters.year.length > 0 && !selectedFilters.year.includes(rYear)) return false;
            // Ensure types match (selectedFilters.month has numbers)
            if (selectedFilters.month.length > 0 && !selectedFilters.month.includes(rMonth)) return false;

            if (selectedFilters.route.length > 0 && !selectedFilters.route.includes(record.route)) return false;
            if (selectedFilters.cluster.length > 0 && !selectedFilters.cluster.includes(record.cluster)) return false;
            if (selectedFilters.type.length > 0 && !selectedFilters.type.includes(record.type)) return false;
            return true;
        });

        // 2. Calculate Totals
        // If onlyFree is selected (and we are allowing free toggling), use 'free' column.
        // Logic: specific toggle for analyzing free rides more deeply.
        // We only enable this mode if "Ücretsiz Kart" is included in selection (or if type selected is empty, effectively all)
        // But strict from previous requirement: "selected.type === 'Free Card'"
        // Let's adjust: If 'Ücretsiz Kart' is selected AND 'onlyFree' is checked.
        const includesFreeCard = selectedFilters.type.includes('Ücretsiz Kart');
        const useFreeColumn = includesFreeCard && selectedFilters.onlyFree;

        const totalBoardings = filteredRecords.reduce((sum, r) => sum + (useFreeColumn ? (r.free || 0) : (r.boardings || 0)), 0);
        // Revenue should be 0 if we are only looking at free rides
        const totalRevenue = useFreeColumn ? 0 : filteredRecords.reduce((sum, r) => sum + (r.revenue || 0), 0);
        const freeBoardings = filteredRecords.reduce((sum, r) => sum + (r.free || 0), 0);
        const totalKrediNfc = filteredRecords.reduce((sum, r) => sum + (useFreeColumn ? 0 : (r.kredi_nfc || 0)), 0);
        const totalAktarma = filteredRecords.reduce((sum, r) => sum + (useFreeColumn ? 0 : (r.aktarma || 0)), 0);
        
        const uniqueMonths = new Set(filteredRecords.map(r => r.date.substring(0, 7)));
        const uniqueMonthsCount = uniqueMonths.size || 1;

        // 3. Prepare Top Routes (for table)
        // Group by route name and sum boardings
        const routeMap = {};
        filteredRecords.forEach(r => {
            if (!routeMap[r.route]) routeMap[r.route] = { name: r.route, boardings: 0, revenue: 0 };
            routeMap[r.route].boardings += useFreeColumn ? (r.free || 0) : (r.boardings || 0);
            routeMap[r.route].revenue += useFreeColumn ? 0 : (r.revenue || 0);
        });
        const topRoutes = Object.values(routeMap).sort((a, b) => b.boardings - a.boardings);

        // 4. Prepare Card Types (for pie chart) based on cluster
        const clusterMap = {};
        const typeMap = {};

        filteredRecords.forEach(r => {
            const boardingCount = useFreeColumn ? (r.free || 0) : (r.boardings || 0);

            // Map clusters
            if (!clusterMap[r.cluster]) clusterMap[r.cluster] = 0;
            clusterMap[r.cluster] += boardingCount;

            // Map types (Paid vs Free)
            if (!typeMap[r.type]) typeMap[r.type] = 0;
            typeMap[r.type] += boardingCount;
        });

        const cardTypes = Object.keys(clusterMap).map(name => ({
            name: name || 'Tanımsız',
            value: clusterMap[name]
        })).filter(i => i.value > 0).sort((a, b) => b.value - a.value);

        const paidFreeTypes = Object.keys(typeMap).map(name => ({
            name: name || 'Tanımsız',
            value: typeMap[name]
        })).filter(i => i.value > 0).sort((a, b) => b.value - a.value);

        // 5. Pass filtered records to Chart (chart handles its own date aggregation)
        // We map 'boardings' in trends to the correct metric so the chart updates automatically
        const trends = filteredRecords.map(r => ({
            ...r,
            boardings: useFreeColumn ? (r.free || 0) : (r.boardings || 0)
        }));

        const krediPieData = [
            { name: 'Kredi Kartı', value: totalKrediNfc },
            { name: 'Diğer', value: Math.max(0, totalBoardings - totalKrediNfc) }
        ].filter(i => i.value > 0);

        const aktarmaPieData = [
            { name: 'Aktarma', value: totalAktarma },
            { name: 'Normal Biniş', value: Math.max(0, totalBoardings - totalAktarma) }
        ].filter(i => i.value > 0);

        // 6. Aggregate Summary Data by Year for the new table
        const summaryData = {};
        const heatmapData = {}; // Format: { year: { month1: val, month2: val, ... } }
        
        // Initialize maps with all years to ensure layout (grid/table) doesn't collapse on year filter
        availableYears.forEach(y => { 
            heatmapData[y] = {}; 
            summaryData[y] = {
                tam: 0, basin: 0, lise: 0, kredi: 0, nfc: 0, 
                uni_ogrenci: 0, uni_16no_all: 0, uni_ikamet: 0, aktarma: 0,
                abonman: 0, iade: 0
            };
        });

        filteredRecords.forEach(r => {
            const year = r.date.substring(0, 4);
            const month = parseInt(r.date.substring(5, 7), 10);
            const boardingsCount = useFreeColumn ? (r.free || 0) : (r.boardings || 0);

            // Populate Heatmap Data
            if (!heatmapData[year]) heatmapData[year] = {};
            if (!heatmapData[year][month]) heatmapData[year][month] = 0;
            heatmapData[year][month] += boardingsCount;

            // Populate Summary Table Data
            if (!summaryData[year]) {
                summaryData[year] = {
                    tam: 0, basin: 0, lise: 0, kredi: 0, nfc: 0, 
                    uni_ogrenci: 0, uni_16no_all: 0, uni_ikamet: 0, aktarma: 0,
                    abonman: 0, iade: 0
                };
            }
            // ... the rest of the summaryData assignments remain unchanged
            summaryData[year].tam += r.tam || 0;
            summaryData[year].basin += r.basin || 0;
            summaryData[year].lise += r.lise || 0;
            summaryData[year].kredi += r.kredi || 0;
            summaryData[year].nfc += r.nfc || 0;
            summaryData[year].uni_ogrenci += r.uni_ogrenci || 0;
            summaryData[year].uni_16no_all += (r.uni_16no || 0) + (r.uni_ikamet_16no || 0);
            summaryData[year].uni_ikamet += r.uni_ikamet_kart || 0;
            summaryData[year].aktarma += r.aktarma || 0;
            summaryData[year].abonman += r.abonman || 0;
            summaryData[year].iade += r.iade || 0;
        });

        return {
            kpi: { totalBoardings, totalRevenue, freeBoardings, uniqueMonthsCount },
            topRoutes,
            cardTypes,
            paidFreeTypes,
            krediPieData,
            aktarmaPieData,
            trends,
            summaryData,
            heatmapData,
            filters: augmentedFilters
        };
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
