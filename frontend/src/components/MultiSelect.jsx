import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export function MultiSelect({ options, selected, onChange, label, placeholder = 'Seçiniz...' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    // Prepare options: Ensure they are objects { value, label }
    // Define this BEFORE handlers so it's available in closure without TDZ issues
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'object' && opt !== null) {
            return opt;
        }
        return { value: opt, label: opt };
    });

    const filteredOptions = normalizedOptions.filter(opt =>
        String(opt.label).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAllSelected = filteredOptions.length > 0 && filteredOptions.every(opt => selected.includes(opt.value));

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value) => {
        let newSelected;
        if (selected.includes(value)) {
            newSelected = selected.filter(item => item !== value);
        } else {
            newSelected = [...selected, value];
        }
        onChange(newSelected);
    };

    const handleSelectAll = () => {
        if (selected.length >= filteredOptions.length && filteredOptions.length > 0 && isAllSelected) {
            // Deselect all visible
            const visibleValues = filteredOptions.map(o => o.value);
            const newSelected = selected.filter(v => !visibleValues.includes(v));
            onChange(newSelected);
        } else {
            // Select all visible
            const visibleValues = filteredOptions.map(o => o.value);
            const newSelected = [...new Set([...selected, ...visibleValues])];
            onChange(newSelected);
        }
    };

    // Display text
    let displayText = placeholder;
    if (selected.length > 0) {
        if (selected.length === options.length) {
            displayText = "Tümü Seçili";
        } else {
            displayText = `${selected.length} Seçili`;
        }
    }

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="w-full bg-background border border-input rounded-lg py-2.5 px-3 text-sm text-foreground flex items-center justify-between cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors focus:ring-2 focus:ring-ring/50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex gap-1 overflow-hidden">
                    <span className="truncate">{displayText}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-md max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">

                    {/* Search and Select All */}
                    <div className="p-2 border-b border-border space-y-2 bg-popover sticky top-0 z-10">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Ara..."
                                className="w-full pl-8 pr-2 py-1.5 text-xs bg-muted/50 border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div
                            className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer text-xs font-medium select-none"
                            onClick={handleSelectAll}
                        >
                            <div className={`h-3.5 w-3.5 rounded border border-primary flex items-center justify-center ${isAllSelected ? 'bg-primary text-primary-foreground' : 'bg-transparent border-muted-foreground'}`}>
                                {isAllSelected && <Check className="h-2.5 w-2.5" />}
                            </div>
                            <span>Tümünü Seç</span>
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="overflow-auto flex-1 p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="p-2 text-center text-xs text-muted-foreground">Sonuç bulunamadı</div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = selected.includes(opt.value);
                                return (
                                    <div
                                        key={opt.value}
                                        className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer text-sm select-none"
                                        onClick={() => toggleOption(opt.value)}
                                    >
                                        <div className={`h-4 w-4 rounded border border-primary flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-transparent border-muted-foreground'}`}>
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </div>
                                        <span className="truncate">{opt.label}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
