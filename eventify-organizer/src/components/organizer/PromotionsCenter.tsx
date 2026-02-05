import React from 'react';
import { Megaphone, Mail, Share2, Copy, Plus } from 'lucide-react';

export const PromotionsCenter = () => {
    const campaigns = [
        { id: 1, name: 'Early Bird Blast', status: 'Sent', sent: 1250, openRate: '45%', date: 'Jan 10, 2026' },
        { id: 2, name: 'VIP Access', status: 'Draft', sent: 0, openRate: '-', date: 'Jan 15, 2026' },
    ];

    const promoCodes = [
        { code: 'RAVE2026', discount: '20%', uses: 45, max: 100, status: 'Active' },
        { code: 'EARLYBIRD', discount: '15%', uses: 120, max: 200, status: 'Expired' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Promotions Center</h2>
                    <p className="text-muted-foreground">Manage your marketing campaigns and discounts</p>
                </div>
                <button className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-black/20 hover:bg-black/90 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Email Campaigns */}
                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <Mail className="w-5 h-5 text-black" /> Email Campaigns
                        </h3>
                        <button className="text-xs font-medium text-muted-foreground hover:text-foreground">View All</button>
                    </div>

                    <div className="space-y-4">
                        {campaigns.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-4 bg-white-base dark:bg-zinc-900 rounded-xl">
                                <div>
                                    <div className="font-bold">{c.name}</div>
                                    <div className="text-xs text-muted-foreground">{c.date} • {c.sent} Recipients</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-bold px-2 py-1 rounded capitalize mb-1 ${c.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {c.status}
                                    </div>
                                    {c.status === 'Sent' && <div className="text-xs font-medium">{c.openRate} Open Rate</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Promo Codes */}
                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-black" /> Promo Codes
                        </h3>
                        <button className="text-xs font-medium text-black hover:underline">+ Create Code</button>
                    </div>

                    <div className="space-y-4">
                        {promoCodes.map((code, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white-base dark:bg-zinc-900 rounded-xl border border-dashed border-border">
                                <div className="flex items-center gap-3">
                                    <div className="bg-black/10 p-2 rounded-lg">
                                        <span className="font-mono font-bold text-black tracking-wider">{code.code}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{code.discount} Off</div>
                                        <div className="text-xs text-muted-foreground">{code.uses}/{code.max} Used</div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <Copy className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Social Share Banner */}
            <div className="bg-gradient-to-r from-black to-orange-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Boost Your Reach</h3>
                        <p className="text-white/90">Share your event page automatically to Facebook, Twitter, and Instagram.</p>
                    </div>
                    <button className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                        <Share2 className="w-5 h-5" /> Connect Accounts
                    </button>
                </div>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10" />
            </div>
        </div>
    );
};
