export function processDashboardData(rawData, selectedFilters) {
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
        if (selectedFilters.month.length > 0 && !selectedFilters.month.includes(rMonth)) return false;
        if (selectedFilters.route.length > 0 && !selectedFilters.route.includes(record.route)) return false;
        if (selectedFilters.cluster.length > 0 && !selectedFilters.cluster.includes(record.cluster)) return false;
        if (selectedFilters.type.length > 0 && !selectedFilters.type.includes(record.type)) return false;
        return true;
    });

    // 2. Calculate Totals
    const includesFreeCard = selectedFilters.type.includes('Ücretsiz Kart');
    const useFreeColumn = includesFreeCard && selectedFilters.onlyFree;

    const totalBoardings = filteredRecords.reduce((sum, r) => sum + (useFreeColumn ? (r.free || 0) : (r.boardings || 0)), 0);
    const totalRevenue = useFreeColumn ? 0 : filteredRecords.reduce((sum, r) => sum + (r.revenue || 0), 0);
    const freeBoardings = filteredRecords.reduce((sum, r) => sum + (r.free || 0), 0);
    const totalKrediNfc = filteredRecords.reduce((sum, r) => sum + (useFreeColumn ? 0 : (r.kredi_nfc || 0)), 0);
    const totalAktarma = filteredRecords.reduce((sum, r) => sum + (useFreeColumn ? 0 : (r.aktarma || 0)), 0);
    
    const uniqueMonths = new Set(filteredRecords.map(r => r.date.substring(0, 7)));
    const uniqueMonthsCount = uniqueMonths.size || 1;

    // 3. Prepare Top Routes
    const routeMap = {};
    filteredRecords.forEach(r => {
        if (!routeMap[r.route]) routeMap[r.route] = { name: r.route, boardings: 0, revenue: 0, free: 0 };
        routeMap[r.route].boardings += useFreeColumn ? (r.free || 0) : (r.boardings || 0);
        routeMap[r.route].revenue += useFreeColumn ? 0 : (r.revenue || 0);
        routeMap[r.route].free += (r.free || 0);
    });
    const topRoutes = Object.values(routeMap).map(r => {
        const freeRatio = r.boardings > 0 ? (r.free / r.boardings) * 100 : 0;
        return {
            ...r,
            freeRatio: parseFloat(freeRatio.toFixed(1))
        };
    }).sort((a, b) => b.boardings - a.boardings);

    // 4. Prepare Card Types
    const clusterMap = {};
    const typeMap = {};

    filteredRecords.forEach(r => {
        const boardingCount = useFreeColumn ? (r.free || 0) : (r.boardings || 0);

        if (!clusterMap[r.cluster]) clusterMap[r.cluster] = 0;
        clusterMap[r.cluster] += boardingCount;

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

    // 5. Pass filtered records to Chart
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

    // 6. Aggregate Summary Data by Year
    const summaryData = {};
    const heatmapData = {};
    
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

        if (!heatmapData[year]) heatmapData[year] = {};
        if (!heatmapData[year][month]) heatmapData[year][month] = 0;
        heatmapData[year][month] += boardingsCount;

        if (!summaryData[year]) {
            summaryData[year] = {
                tam: 0, basin: 0, lise: 0, kredi: 0, nfc: 0, 
                uni_ogrenci: 0, uni_16no_all: 0, uni_ikamet: 0, aktarma: 0,
                abonman: 0, iade: 0
            };
        }
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
}
