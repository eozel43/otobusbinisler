import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function StatsCard({ title, value, icon: Icon, description, momChange, yoyChange, periodLabel, className, index = 0 }) {
    const renderChangeBadge = (changeVal) => {
        if (changeVal === undefined || changeVal === null || isNaN(changeVal)) return null;
        const isPositive = changeVal >= 0;
        const text = isPositive ? `+${changeVal.toFixed(1)}%` : `${changeVal.toFixed(1)}%`;
        
        return (
            <span className={clsx(
                "font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm border",
                isPositive 
                    ? "text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/20" 
                    : "text-rose-700 bg-rose-500/10 border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/20"
            )}>
                {text}
            </span>
        );
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.01 }}
            className={cn(
                "relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-xl transition-all duration-300 group", 
                className
            )}
        >
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)] pointer-events-none" />
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <h3 className="tracking-tight text-xs font-semibold text-muted-foreground uppercase font-lexend">{title}</h3>
                {Icon && (
                    <motion.div 
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner"
                    >
                        <Icon className="h-4 w-4" />
                    </motion.div>
                )}
            </div>
            <div className="p-6 pt-0 relative z-10 flex flex-col h-[calc(100%-54px)] justify-between">
                <div>
                    <div className="text-3xl font-bold tracking-tight text-foreground font-lexend">{value}</div>
                    {description && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <div className="h-1 w-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                            <p className="text-[10px] font-medium text-muted-foreground/80 leading-none">{description}</p>
                        </div>
                    )}
                </div>

                {/* MoM & YoY Comparison section */}
                {(momChange !== undefined || yoyChange !== undefined) && (
                    <div className="flex flex-col gap-1.5 mt-4 pt-3 border-t border-border/60 text-[10px] font-medium text-muted-foreground w-full">
                        {periodLabel && (
                            <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1 border-b border-border/40 pb-0.5">
                                Referans Dönem: {periodLabel}
                            </div>
                        )}
                        {momChange !== undefined && momChange !== null && !isNaN(momChange) && (
                            <div className="flex items-center justify-between">
                                <span>Önceki aya göre:</span>
                                {renderChangeBadge(momChange)}
                            </div>
                        )}
                        {yoyChange !== undefined && yoyChange !== null && !isNaN(yoyChange) && (
                            <div className="flex items-center justify-between">
                                <span>Geçen yılın aynı ayına göre:</span>
                                {renderChangeBadge(yoyChange)}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Bottom Glow Line */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500" />
        </motion.div>
    );
}
