import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Download, Calendar } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export const EarningsPayouts = () => {
    // Mock Data
    const earningsData = [
        { month: 'Jan', amount: 1250 },
        { month: 'Feb', amount: 2100 },
        { month: 'Mar', amount: 1800 },
        { month: 'Apr', amount: 2800 },
        { month: 'May', amount: 2400 },
        { month: 'Jun', amount: 3500 },
    ];

    const payouts = [
        { id: 1, date: 'Jun 15, 2026', amount: 2850.00, status: 'Completed', method: 'Bank Transfer •••• 4242' },
        { id: 2, date: 'May 15, 2026', amount: 1950.00, status: 'Completed', method: 'Bank Transfer •••• 4242' },
        { id: 3, date: 'Apr 15, 2026', amount: 2200.00, status: 'Completed', method: 'Bank Transfer •••• 4242' }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Earnings & Payouts</h2>
                    <p className="text-muted-foreground">Track your revenue and manage automatic payouts</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted">
                        <Calendar className="w-4 h-4" /> This Year
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground uppercase">Total Revenue</span>
                    </div>
                    <div className="text-3xl font-black text-foreground">$14,850.00</div>
                    <div className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" /> +12.5% vs last month
                    </div>
                </div>

                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground uppercase">Pending Payout</span>
                    </div>
                    <div className="text-3xl font-black text-foreground">$1,250.00</div>
                    <div className="text-sm text-muted-foreground mt-1">
                        Scheduled for Jul 15, 2026
                    </div>
                </div>

                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground uppercase">Avg. Ticket Price</span>
                    </div>
                    <div className="text-3xl font-black text-foreground">$45.00</div>
                    <div className="text-sm text-muted-foreground mt-1">
                        Across 12 events
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold mb-6">Revenue Over Time</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={earningsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs font-medium fill-muted-foreground" />
                                <YAxis axisLine={false} tickLine={false} className="text-xs font-medium fill-muted-foreground" prefix="$" />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" fill="#000000" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Payouts */}
                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold">Recent Payouts</h3>
                        <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {payouts.map(payout => (
                            <div key={payout.id} className="p-4 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-lg">${payout.amount.toFixed(2)}</div>
                                        <div className="text-xs text-muted-foreground">{payout.date}</div>
                                    </div>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">
                                        {payout.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CreditCard className="w-3 h-3" />
                                    {payout.method}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors">
                        Manage Payout Methods
                    </button>
                </div>
            </div>
        </div>
    );
};
