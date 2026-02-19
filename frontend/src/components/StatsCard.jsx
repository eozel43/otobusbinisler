
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function StatsCard({ title, value, icon: Icon, description, className }) {
    return (
        <div className={cn("relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 group", className)}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
                {Icon && <div className="p-2 bg-primary/10 rounded-lg"><Icon className="h-4 w-4 text-primary" /></div>}
            </div>
            <div className="p-6 pt-0 relative z-10">
                <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
        </div>
    );
}
