
import React, { useEffect, useState, useMemo } from 'react';
import { LayoutDashboard, Users, CreditCard, Wallet, TrendingUp, LogOut } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { TrendChart } from './components/TrendChart';
import { RouteTable } from './components/RouteTable';
import { CardTypePie } from './components/CardTypePie';
import { FilterBar } from './components/FilterBar';
import { ThemeToggle } from './components/ThemeToggle';
import { Login } from './components/Login';

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
        console.log("App Version: v1.1 (Login Enabled)"); // Verification Log
        fetch('/data/dashboard_data.json')
            .then(res => res.json())
            .then(data => {
                setRawData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading data:", err);
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

        // 3. Prepare Top Routes (for table)
        // Group by route name and sum boardings
        const routeMap = {};
        filteredRecords.forEach(r => {
            if (!routeMap[r.route]) routeMap[r.route] = { name: r.route, boardings: 0, revenue: 0 };
            routeMap[r.route].boardings += useFreeColumn ? (r.free || 0) : (r.boardings || 0);
            routeMap[r.route].revenue += useFreeColumn ? 0 : (r.revenue || 0);
        });
        const topRoutes = Object.values(routeMap).sort((a, b) => b.boardings - a.boardings).slice(0, 10);

        // 4. Prepare Card Types (for pie chart)
        // Sum specific columns across filtered records
        const totals = filteredRecords.reduce((acc, r) => {
            acc.tam += r.tam || 0;
            acc.lise += r.lise || 0;
            acc.uni += r.uni || 0;
            acc.free += r.free || 0;
            acc.abonman += r.abonman || 0;
            acc.aktarma += r.aktarma || 0;
            acc.kredi_nfc += r.kredi_nfc || 0;
            return acc;
        }, { tam: 0, lise: 0, uni: 0, free: 0, abonman: 0, aktarma: 0, kredi_nfc: 0 });

        let cardTypes = [
            { name: 'Tam', value: totals.tam },
            { name: 'Lise', value: totals.lise },
            { name: 'Üniversite', value: totals.uni },
            { name: 'Ücretsiz', value: totals.free },
            { name: 'Abonman', value: totals.abonman },
            { name: 'Aktarma', value: totals.aktarma },
            { name: 'Kredi/NFC', value: totals.kredi_nfc },
        ].filter(i => i.value > 0);

        // If useFreeColumn is active, we might want to show only 'Ücretsiz' logic or distribution of free cards?
        // Original logic: if useFreeColumn true, restrict to 'Ücretsiz'.
        if (useFreeColumn) {
            cardTypes = cardTypes.filter(c => c.name === 'Ücretsiz');
        }

        // 5. Pass filtered records to Chart (chart handles its own date aggregation)
        // We map 'boardings' in trends to the correct metric so the chart updates automatically
        const trends = filteredRecords.map(r => ({
            ...r,
            boardings: useFreeColumn ? (r.free || 0) : (r.boardings || 0)
        }));

        return {
            kpi: { totalBoardings, totalRevenue, freeBoardings },
            topRoutes,
            cardTypes,
            trends,
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
        <div className="min-h-screen bg-background text-foreground p-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Ulaşım Analiz Paneli</h1>
                        <p className="text-muted-foreground mt-1">Gerçek zamanlı biniş ve hasılat verileri</p>
                    </div>
                    <div className="flex items-center gap-4 self-start md:self-auto">
                        <div className="flex items-center space-x-2 bg-card text-card-foreground p-2 rounded-lg border border-border shadow-sm">
                            <span className="text-sm font-medium text-muted-foreground px-2">Son Güncelleme:</span>
                            <span className="text-sm font-bold text-foreground">{new Date().toLocaleDateString('tr-TR')}</span>
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

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatsCard
                        title="Toplam Biniş"
                        value={new Intl.NumberFormat('tr-TR').format(dashboardData.kpi.totalBoardings)}
                        icon={Users}
                        description="Seçilen kriterlere göre toplam"
                    />
                    <StatsCard
                        title="Toplam Hasılat"
                        value={new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(dashboardData.kpi.totalRevenue)}
                        icon={Wallet}
                        description="Seçilen kriterlere göre hasılat"
                    />
                    <StatsCard
                        title="Ücretsiz Binişler"
                        value={new Intl.NumberFormat('tr-TR').format(dashboardData.kpi.freeBoardings)}
                        icon={CreditCard}
                        description="Toplam ücretsiz geçiş"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <TrendChart data={dashboardData.trends} key={selectedFilters.onlyFree ? 'free' : 'normal'} />
                    <CardTypePie data={dashboardData.cardTypes} />
                </div>

                {/* Tables Section */}
                <div className="grid gap-4 md:grid-cols-1">
                    <RouteTable data={dashboardData.topRoutes} />
                </div>
            </div>
        </div>
    );
}

export default App;
