import { describe, it, expect } from 'vitest';
import { processDashboardData } from '../utils/analytics';

describe('processDashboardData utility', () => {
    const mockRawData = {
        filters: {
            routes: ['Line A', 'Line B'],
            clusters: ['TAM', 'ÖĞRENCİ', 'ÜCRETSİZ'],
            types: ['Ücretli Kart', 'Ücretsiz Kart']
        },
        lastUpdated: '01.06.2026',
        records: [
            // Current Period: 2026-05 (May 2026)
            { date: '2026-05-01', route: 'Line A', cluster: 'TAM', type: 'Ücretli Kart', boardings: 1000, revenue: 15000, free: 100, kredi_nfc: 500, aktarma: 200, tam: 800, basin: 0, lise: 100, kredi: 400, nfc: 100, uni_ogrenci: 0, uni_16no: 0, uni_ikamet_16no: 0, uni_ikamet_kart: 0, abonman: 0, iade: 0 },
            { date: '2026-05-02', route: 'Line B', cluster: 'ÜCRETSİZ', type: 'Ücretsiz Kart', boardings: 500, revenue: 0, free: 450, kredi_nfc: 0, aktarma: 50, tam: 0, basin: 50, lise: 0, kredi: 0, nfc: 0, uni_ogrenci: 0, uni_16no: 0, uni_ikamet_16no: 0, uni_ikamet_kart: 0, abonman: 0, iade: 0 },
            
            // Previous Month: 2026-04 (April 2026)
            { date: '2026-04-01', route: 'Line A', cluster: 'TAM', type: 'Ücretli Kart', boardings: 800, revenue: 12000, free: 80, kredi_nfc: 400, aktarma: 160, tam: 640, basin: 0, lise: 80, kredi: 320, nfc: 80, uni_ogrenci: 0, uni_16no: 0, uni_ikamet_16no: 0, uni_ikamet_kart: 0, abonman: 0, iade: 0 },
            { date: '2026-04-02', route: 'Line B', cluster: 'ÜCRETSİZ', type: 'Ücretsiz Kart', boardings: 600, revenue: 0, free: 540, kredi_nfc: 0, aktarma: 60, tam: 0, basin: 60, lise: 0, kredi: 0, nfc: 0, uni_ogrenci: 0, uni_16no: 0, uni_ikamet_16no: 0, uni_ikamet_kart: 0, abonman: 0, iade: 0 },

            // Same Month Last Year: 2025-05 (May 2025)
            { date: '2025-05-01', route: 'Line A', cluster: 'TAM', type: 'Ücretli Kart', boardings: 900, revenue: 13500, free: 90, kredi_nfc: 450, aktarma: 180, tam: 720, basin: 0, lise: 90, kredi: 360, nfc: 90, uni_ogrenci: 0, uni_16no: 0, uni_ikamet_16no: 0, uni_ikamet_kart: 0, abonman: 0, iade: 0 },
            { date: '2025-05-02', route: 'Line B', cluster: 'ÜCRETSİZ', type: 'Ücretsiz Kart', boardings: 400, revenue: 0, free: 360, kredi_nfc: 0, aktarma: 40, tam: 0, basin: 40, lise: 0, kredi: 0, nfc: 0, uni_ogrenci: 0, uni_16no: 0, uni_ikamet_16no: 0, uni_ikamet_kart: 0, abonman: 0, iade: 0 }
        ]
    };

    const defaultFilters = {
        year: [],
        month: [],
        route: [],
        cluster: [],
        type: [],
        onlyFree: false
    };

    it('should correctly calculate basic KPI values', () => {
        const result = processDashboardData(mockRawData, defaultFilters);
        expect(result.kpi.totalBoardings).toBe(4200); // sum of all boardings
        expect(result.kpi.totalRevenue).toBe(40500); // 15000 + 12000 + 13500
        expect(result.kpi.freeBoardings).toBe(1620); // 100 + 450 + 80 + 540 + 90 + 360
    });

    it('should show credit card and NFC/QR as separate pie slices', () => {
        const result = processDashboardData(mockRawData, defaultFilters);

        expect(result.krediPieData).toEqual([
            { name: 'Kredi Kartı', value: 1080 },
            { name: 'NFC/QR', value: 270 },
            { name: 'Diğer', value: 2850 }
        ]);
    });

    it('should calculate MoM and YoY comparison metrics', () => {
        const result = processDashboardData(mockRawData, defaultFilters);
        
        // Target period determined as latest in data: May 2026 (1500 total boardings, 15000 revenue, 550 free)
        // Previous Month: April 2026 (1400 boardings, 12000 revenue, 620 free)
        // Same Month Last Year: May 2025 (1300 boardings, 13500 revenue, 450 free)
        
        // Boardings: ((1500 - 1400) / 1400) * 100 = 7.14%
        expect(result.kpi.momChange.totalBoardings).toBeCloseTo(7.14, 1);
        // Revenue: ((15000 - 12000) / 12000) * 100 = 25%
        expect(result.kpi.momChange.totalRevenue).toBe(25);
        // Free Boardings: ((550 - 620) / 620) * 100 = -11.29%
        expect(result.kpi.momChange.freeBoardings).toBeCloseTo(-11.29, 1);

        // YoY (May 2026 vs May 2025):
        // Boardings: ((1500 - 1300) / 1300) * 100 = 15.38%
        expect(result.kpi.yoyChange.totalBoardings).toBeCloseTo(15.38, 1);
        // Revenue: ((15000 - 13500) / 13500) * 100 = 11.11%
        expect(result.kpi.yoyChange.totalRevenue).toBeCloseTo(11.11, 1);
    });

    it('should build route x card type heatmap matrix correctly', () => {
        const result = processDashboardData(mockRawData, defaultFilters);
        expect(result.routeCardHeatmap.routes).toContain('Line A');
        expect(result.routeCardHeatmap.clusters).toContain('TAM');
        expect(result.routeCardHeatmap.matrix['Line A']['TAM']).toBe(2700); // 1000 + 800 + 900
    });

    it('should identify declining routes and high free ratio routes for exceptions', () => {
        const result = processDashboardData(mockRawData, defaultFilters);
        
        // Line B boardings: Apr (600) -> May (500) = decrease of 100 boardings (-16.7%)
        expect(result.executiveExceptions.decliningRoutes.length).toBeGreaterThan(0);
        expect(result.executiveExceptions.decliningRoutes[0].name).toBe('Line B');
        expect(result.executiveExceptions.decliningRoutes[0].difference).toBe(-100);

        // Line B has 450 free out of 500 boardings in May 2026 = 90%
        expect(result.executiveExceptions.highFreeRatioRoutes.length).toBeGreaterThan(0);
        expect(result.executiveExceptions.highFreeRatioRoutes[0].name).toBe('Line B');
        expect(result.executiveExceptions.highFreeRatioRoutes[0].ratio).toBe(90.0);
    });

    it('should calculate executive exceptions correctly when a single month filter is active (month filter bug regression test)', () => {
        const monthFilter = {
            ...defaultFilters,
            year: ['2026'],
            month: [5] // only May 2026 is filtered
        };
        const result = processDashboardData(mockRawData, monthFilter);
        
        // Month filter is active, but exceptions must still calculate MoM changes (needs April 2026 records)
        expect(result.executiveExceptions.decliningRoutes.length).toBeGreaterThan(0);
        expect(result.executiveExceptions.decliningRoutes[0].name).toBe('Line B');
    });

    it('should only include filtered years in summary and heatmap data', () => {
        const singleYearFilter = {
            ...defaultFilters,
            year: ['2026'],
            month: [5]
        };
        const result = processDashboardData(mockRawData, singleYearFilter);

        expect(Object.keys(result.summaryData)).toEqual(['2026']);
        expect(Object.keys(result.heatmapData)).toEqual(['2026']);
        expect(result.heatmapData['2026'][5]).toBe(1500);
    });

    it('should limit month filter options to months available in the selected year', () => {
        const result = processDashboardData(mockRawData, {
            ...defaultFilters,
            year: ['2025']
        });

        expect(result.filters.months).toEqual([5]);
    });

    it('should calculate free boarding ratio correctly in onlyFree mode and type filter (onlyFree ratio bug regression test)', () => {
        const onlyFreeFilter = {
            ...defaultFilters,
            type: ['Ücretsiz Kart'],
            onlyFree: true
        };
        const result = processDashboardData(mockRawData, onlyFreeFilter);

        // The high free ratio list should have ratios calculated against the TRUE total boardings, not peg to 100%
        // Line B has 450 free and 500 total boardings in May 2026. The ratio should be (450 / 500) * 100 = 90%
        const lineBException = result.executiveExceptions.highFreeRatioRoutes.find(r => r.name === 'Line B');
        expect(lineBException).toBeDefined();
        expect(lineBException.ratio).toBe(90.0);
    });
});
