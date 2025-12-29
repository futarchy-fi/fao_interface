'use client';

export default function TokenDistribution() {
    // Distribution mocks
    const totalBuyer = 550000;
    const totalTreasury = 250000;
    const totalIncentive = 100000;
    const totalInsider = 100000;
    const totalGenerated = totalBuyer + totalTreasury + totalIncentive + totalInsider;

    const items = [
        { label: 'Public Liquidity', amount: totalBuyer, color: 'bg-white', icon: '👤' },
        { label: 'FAO Treasury', amount: totalTreasury, color: 'bg-white/60', icon: '🏦' },
        { label: 'Incentive Buffer', amount: totalIncentive, color: 'bg-white/40', icon: '🎁' },
        { label: 'Guardian Vesting', amount: totalInsider, color: 'bg-white/20', icon: '🔐' },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto my-6 bg-black p-4 border border-white/10">
            <h3 className="font-pixel text-[10px] mb-8 uppercase tracking-[0.3em] text-white/40">/TOKEN_EMISSION_DISTRIBUTION_MAP</h3>

            <div className="flex flex-col gap-10">
                <div className="h-16 w-full flex border border-white overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className={`${item.color} h-full transition-all duration-1000 ease-out border-r border-black/10`}
                            style={{ width: `${(item.amount / totalGenerated) * 100}%` }}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 border border-white/10 bg-white/2 group hover:bg-white hover:text-black transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <span className="text-xl filter grayscale group-hover:invert transition-all">{item.icon}</span>
                                <div className="flex flex-col">
                                    <span className="font-pixel text-[7px] opacity-40 uppercase tracking-widest">{item.label}</span>
                                    <span className="font-mono text-lg font-black tracking-tighter">
                                        {Number(item.amount).toLocaleString()} <span className="text-[10px] opacity-40">FAO</span>
                                    </span>
                                </div>
                            </div>
                            <div className="text-right font-pixel text-xs font-bold bg-white/5 px-2 py-1 group-hover:bg-black/10">
                                {((item.amount / totalGenerated) * 100).toFixed(1)}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12 p-6 border-t border-white/10 text-white/40 font-mono text-[9px] leading-relaxed italic uppercase tracking-widest">
                PROTOCOL_AUDIT_LOG: DEBT_EQUITY_NEUTRAL // EMISSION_CONTROL: ENABLED // TOTAL_SUPPLY: {Number(totalGenerated.toFixed(0)).toLocaleString()} UNITS
            </div>
        </div>
    );
}
