import { MultiSelect } from './MultiSelect';

export function FilterBar({ filters, selected, onChange }) {

    // Helper helper to format months
    const monthOptions = (filters?.months || []).map(month => ({
        value: month,
        label: new Date(2000, month - 1, 1).toLocaleString('tr-TR', { month: 'long' })
    }));

    return (
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-6 mb-8 shadow-xl relative z-20">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            <div className="flex flex-col md:flex-row gap-5 items-end justify-between relative z-10">

                {/* Year Filter */}
                <div className="w-full md:w-1/6">
                    <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest font-lexend">
                        Yıl ({filters?.years?.length || 0})
                    </label>
                    <MultiSelect
                        options={filters?.years || []}
                        selected={selected.year}
                        onChange={(val) => onChange('year', val)}
                        placeholder="Yıl Seç"
                    />
                </div>

                {/* Month Filter */}
                <div className="w-full md:w-1/6">
                    <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest font-lexend">
                        Ay ({filters?.months?.length || 0})
                    </label>
                    <MultiSelect
                        options={monthOptions}
                        selected={selected.month}
                        onChange={(val) => onChange('month', val)}
                        placeholder="Ay Seç"
                    />
                </div>

                {/* Route Filter */}
                <div className="w-full md:w-1/3">
                    <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest font-lexend">Hat Seçimi</label>
                    <MultiSelect
                        options={filters?.routes || []}
                        selected={selected.route}
                        onChange={(val) => onChange('route', val)}
                        placeholder="Hatları Ara..."
                    />
                </div>

                {/* Cluster Filter */}
                <div className="w-full md:w-1/4">
                    <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest font-lexend">Kart Grubu</label>
                    <MultiSelect
                        options={filters?.clusters || []}
                        selected={selected.cluster}
                        onChange={(val) => onChange('cluster', val)}
                        placeholder="Grubu Seç"
                    />
                </div>

                {/* Type Filter */}
                <div className="w-full md:w-1/4">
                    <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest font-lexend">Biniş Türü</label>
                    <div className="flex flex-col gap-2">
                        <MultiSelect
                            options={filters?.types || []}
                            selected={selected.type}
                            onChange={(val) => onChange('type', val)}
                            placeholder="Tür Seç"
                        />

                        {selected.type && selected.type.includes('Ücretsiz Kart') && (
                            <div className="flex items-center gap-2 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                <input
                                    type="checkbox"
                                    id="freeCheck"
                                    checked={selected.onlyFree || false}
                                    onChange={(e) => onChange('onlyFree', e.target.checked)}
                                    className="peer h-4 w-4 rounded border-input bg-background text-primary focus:ring-ring/50"
                                />
                                <label htmlFor="freeCheck" className="text-xs font-medium text-muted-foreground peer-checked:text-primary cursor-pointer select-none">
                                    Sadece Ücretsiz Binişler
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reset Button */}
                <div className="w-full md:w-auto pb-0.5">
                    <button
                        onClick={() => onChange('reset')}
                        className="h-[42px] px-6 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95 w-full md:w-auto"
                    >
                        Sıfırla
                    </button>
                </div>

            </div>
        </div>
    );
}
