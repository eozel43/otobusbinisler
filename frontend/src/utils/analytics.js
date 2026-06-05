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

    // --- Dynamic comparison period calculations for KPIs ---
    let targetYear, targetMonth;
    if (selectedFilters.year.length === 1 && selectedFilters.month.length === 1) {
        targetYear = selectedFilters.year[0];
        targetMonth = selectedFilters.month[0];
    } else {
        let latestDateStr = "";
        filteredRecords.forEach(r => {
            if (r.date > latestDateStr) {
                latestDateStr = r.date;
            }
        });
        if (latestDateStr) {
            targetYear = latestDateStr.substring(0, 4);
            targetMonth = parseInt(latestDateStr.substring(5, 7), 10);
        }
    }

    const getMonthName = (mNum) => {
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return months[mNum - 1] || '';
    };
    const targetPeriodLabel = targetYear && targetMonth ? `${getMonthName(targetMonth)} ${targetYear}` : '';

    const getKPIsForPeriod = (year, month) => {
        const periodRecords = rawData.records.filter(r => {
            const rYear = r.date.substring(0, 4);
            const rMonth = parseInt(r.date.substring(5, 7), 10);
            if (rYear !== year || rMonth !== month) return false;
            if (selectedFilters.route.length > 0 && !selectedFilters.route.includes(r.route)) return false;
            if (selectedFilters.cluster.length > 0 && !selectedFilters.cluster.includes(r.cluster)) return false;
            if (selectedFilters.type.length > 0 && !selectedFilters.type.includes(r.type)) return false;
            return true;
        });

        const totalB = periodRecords.reduce((sum, r) => sum + (useFreeColumn ? (r.free || 0) : (r.boardings || 0)), 0);
        const totalR = useFreeColumn ? 0 : periodRecords.reduce((sum, r) => sum + (r.revenue || 0), 0);
        const freeB = periodRecords.reduce((sum, r) => sum + (r.free || 0), 0);

        return { totalBoardings: totalB, totalRevenue: totalR, freeBoardings: freeB };
    };

    let kpiMomChange = {};
    let kpiYoyChange = {};

    if (targetYear && targetMonth) {
        const currentKPIs = getKPIsForPeriod(targetYear, targetMonth);
        
        const prevMonthVal = targetMonth === 1 ? 12 : targetMonth - 1;
        const prevMonthYear = targetMonth === 1 ? String(parseInt(targetYear, 10) - 1) : targetYear;
        const prevMonthKPIs = getKPIsForPeriod(prevMonthYear, prevMonthVal);

        const prevYearYear = String(parseInt(targetYear, 10) - 1);
        const prevYearKPIs = getKPIsForPeriod(prevYearYear, targetMonth);

        const calcChange = (curr, prev) => {
            if (!prev || prev === 0) return null;
            return ((curr - prev) / prev) * 100;
        };

        kpiMomChange = {
            totalBoardings: calcChange(currentKPIs.totalBoardings, prevMonthKPIs.totalBoardings),
            totalRevenue: calcChange(currentKPIs.totalRevenue, prevMonthKPIs.totalRevenue),
            freeBoardings: calcChange(currentKPIs.freeBoardings, prevMonthKPIs.freeBoardings)
        };

        kpiYoyChange = {
            totalBoardings: calcChange(currentKPIs.totalBoardings, prevYearKPIs.totalBoardings),
            totalRevenue: calcChange(currentKPIs.totalRevenue, prevYearKPIs.totalRevenue),
            freeBoardings: calcChange(currentKPIs.freeBoardings, prevYearKPIs.freeBoardings)
        };
    }

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

    // 7. Route x Card Type Heatmap Calculation
    const heatmapRoutes = topRoutes.slice(0, 10).map(r => r.name);
    const heatmapClusters = cardTypes.slice(0, 6).map(c => c.name);

    const routeClusterMatrix = {};
    heatmapRoutes.forEach(r => {
        routeClusterMatrix[r] = {};
        heatmapClusters.forEach(c => {
            routeClusterMatrix[r][c] = 0;
        });
    });

    filteredRecords.forEach(r => {
        if (heatmapRoutes.includes(r.route) && heatmapClusters.includes(r.cluster)) {
            const val = useFreeColumn ? (r.free || 0) : (r.boardings || 0);
            routeClusterMatrix[r.route][r.cluster] += val;
        }
    });

    const routeCardHeatmap = {
        routes: heatmapRoutes,
        clusters: heatmapClusters,
        matrix: routeClusterMatrix
    };

    // 8. Executive Exception Calculations
    let executiveExceptions = {
        decliningRoutes: [],
        highFreeRatioRoutes: []
    };

    if (targetYear && targetMonth) {
        const prevMonthVal = targetMonth === 1 ? 12 : targetMonth - 1;
        const prevMonthYear = targetMonth === 1 ? String(parseInt(targetYear, 10) - 1) : targetYear;

        const routeBoardingsCurrent = {};
        const routeBoardingsPrev = {};
        const routeActualTotalCurrent = {}; // Denominator: actual total boardings (unaffected by type/cluster filters)
        const routeFreeCount = {};

        // Query rawData.records to prevent the active month filter from wiping out the comparison month records
        const comparisonRecords = rawData.records.filter(r => {
            if (selectedFilters.route.length > 0 && !selectedFilters.route.includes(r.route)) return false;
            if (selectedFilters.cluster.length > 0 && !selectedFilters.cluster.includes(r.cluster)) return false;
            if (selectedFilters.type.length > 0 && !selectedFilters.type.includes(r.type)) return false;
            return true;
        });

        comparisonRecords.forEach(r => {
            const rYear = r.date.substring(0, 4);
            const rMonth = parseInt(r.date.substring(5, 7), 10);
            
            if (rYear === targetYear && rMonth === targetMonth) {
                if (!routeBoardingsCurrent[r.route]) {
                    routeBoardingsCurrent[r.route] = 0;
                    routeFreeCount[r.route] = 0;
                }
                routeBoardingsCurrent[r.route] += useFreeColumn ? (r.free || 0) : (r.boardings || 0);
                routeFreeCount[r.route] += (r.free || 0);
            }

            if (rYear === prevMonthYear && rMonth === prevMonthVal) {
                if (!routeBoardingsPrev[r.route]) {
                    routeBoardingsPrev[r.route] = 0;
                }
                routeBoardingsPrev[r.route] += useFreeColumn ? (r.free || 0) : (r.boardings || 0);
            }
        });

        // Compute true denominator for free ratio (ignores cluster and type filters to get actual route total)
        const denominatorRecords = rawData.records.filter(r => {
            const rYear = r.date.substring(0, 4);
            const rMonth = parseInt(r.date.substring(5, 7), 10);
            if (rYear !== targetYear || rMonth !== targetMonth) return false;
            if (selectedFilters.route.length > 0 && !selectedFilters.route.includes(r.route)) return false;
            return true;
        });

        denominatorRecords.forEach(r => {
            if (!routeActualTotalCurrent[r.route]) {
                routeActualTotalCurrent[r.route] = 0;
            }
            routeActualTotalCurrent[r.route] += (r.boardings || 0);
        });

        const declineList = [];
        Object.keys(routeBoardingsCurrent).forEach(rName => {
            const currentVal = routeBoardingsCurrent[rName];
            const prevVal = routeBoardingsPrev[rName] || 0;
            if (prevVal > 300) { // filter noise
                const diffVal = currentVal - prevVal;
                const pctChange = (diffVal / prevVal) * 100;
                if (diffVal < 0) {
                    declineList.push({
                        name: rName,
                        current: currentVal,
                        previous: prevVal,
                        difference: diffVal,
                        pctChange: parseFloat(pctChange.toFixed(1))
                    });
                }
            }
        });
        executiveExceptions.decliningRoutes = declineList.sort((a, b) => a.difference - b.difference).slice(0, 5);

        const freeRatioList = [];
        Object.keys(routeBoardingsCurrent).forEach(rName => {
            const actualTotalVal = routeActualTotalCurrent[rName] || 0;
            const freeVal = routeFreeCount[rName] || 0;
            if (actualTotalVal > 200) {
                const ratio = (freeVal / actualTotalVal) * 100;
                freeRatioList.push({
                    name: rName,
                    boardings: actualTotalVal,
                    freeBoardings: freeVal,
                    ratio: parseFloat(ratio.toFixed(1))
                });
            }
        });
        executiveExceptions.highFreeRatioRoutes = freeRatioList.sort((a, b) => b.ratio - a.ratio).slice(0, 5);
    }

    return {
        kpi: { 
            totalBoardings, 
            totalRevenue, 
            freeBoardings, 
            uniqueMonthsCount,
            momChange: kpiMomChange,
            yoyChange: kpiYoyChange,
            targetPeriodLabel
        },
        topRoutes,
        cardTypes,
        paidFreeTypes,
        krediPieData,
        aktarmaPieData,
        trends,
        summaryData,
        heatmapData,
        routeCardHeatmap,
        executiveExceptions,
        filters: augmentedFilters
    };
}
