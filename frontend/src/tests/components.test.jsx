import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouteCardHeatmap } from '../components/RouteCardHeatmap';
import { ExecutiveExceptionTable } from '../components/ExecutiveExceptionTable';

// Mock recharts because SVG layouts are hard to test in jsdom
vi.mock('recharts', () => {
    return {
        ResponsiveContainer: ({ children }) => <div>{children}</div>,
        BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
        Bar: ({ children }) => <div data-testid="bar">{children}</div>,
        Cell: () => <div data-testid="cell" />,
        XAxis: () => <div />,
        YAxis: () => <div />,
        CartesianGrid: () => <div />,
        Tooltip: () => <div />
    };
});

describe('New Dashboard Components', () => {
    describe('RouteCardHeatmap', () => {
        const mockHeatmapData = {
            routes: ['Line 1', 'Line 2'],
            clusters: ['TAM', 'ÖĞRENCİ'],
            matrix: {
                'Line 1': { 'TAM': 100, 'ÖĞRENCİ': 200 },
                'Line 2': { 'TAM': 300, 'ÖĞRENCİ': 400 }
            }
        };

        it('renders heatmap title and route labels', () => {
            render(<RouteCardHeatmap data={mockHeatmapData} />);
            expect(screen.getByText(/Yoğunluk Haritası/i)).toBeInTheDocument();
            expect(screen.getAllByText('Line 1')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Line 2')[0]).toBeInTheDocument();
            expect(screen.getAllByText('100')[0]).toBeInTheDocument();
            expect(screen.getAllByText('400')[0]).toBeInTheDocument();
        });

        it('shows fallback when data is missing', () => {
            render(<RouteCardHeatmap data={{}} />);
            expect(screen.getByText(/Isı haritası için veri bulunamadı/i)).toBeInTheDocument();
        });
    });


    describe('ExecutiveExceptionTable', () => {
        const mockExceptionData = {
            decliningRoutes: [
                { name: 'Route A', current: 800, previous: 1000, difference: -200, pctChange: -20 }
            ],
            highFreeRatioRoutes: [
                { name: 'Route B', boardings: 500, freeBoardings: 400, ratio: 80 }
            ]
        };

        it('renders declining routes and high free ratio tables', () => {
            render(<ExecutiveExceptionTable data={mockExceptionData} />);
            expect(screen.getByText(/En Çok Düşüş Gösteren Hatlar/i)).toBeInTheDocument();
            expect(screen.getByText(/Ücretsiz Biniş Oranı En Yüksek Hatlar/i)).toBeInTheDocument();
            expect(screen.getByText('Route A')).toBeInTheDocument();
            expect(screen.getByText('Route B')).toBeInTheDocument();
            expect(screen.getByText('%80')).toBeInTheDocument();
            expect(screen.getByText('-200 (-20%)')).toBeInTheDocument();
        });
    });
});
