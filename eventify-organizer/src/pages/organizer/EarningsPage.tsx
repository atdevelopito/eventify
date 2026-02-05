import { useState, useEffect } from "react";
import { PageHeader, DataTable, Column, StatusBadge, EmptyState, Card, StatsCard } from "@/components/organizer/shared";
import { format } from "date-fns";
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext";

export function EarningsPage() {
    const { user, loading: authLoading } = useRole();
    const [stats, setStats] = useState({
        totalEarnings: 0,
        availableBalance: 0,
        pendingPayouts: 0,
        totalPaidOut: 0,
        breakdown: [] // Event breakdown
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!user) return;
            try {
                const res = await api.get('/organizer/earnings');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch earnings", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchEarnings();
        }
    }, [user, authLoading]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(value);
    };

    // Columns for Event Revenue Breakdown
    const revenueColumns: Column<any>[] = [
        {
            key: "title",
            header: "Event",
            cell: (item) => <span className="font-medium text-gray-900">{item.title}</span>,
        },
        {
            key: "revenue",
            header: "Revenue",
            cell: (item) => <span className="font-bold text-gray-900">{formatCurrency(item.revenue)}</span>,
        },
        {
            key: "status",
            header: "Status",
            cell: () => <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">Available</span>,
        }
    ];

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E85A6B]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 min-h-screen bg-white text-black p-1">
            <PageHeader
                title="Earnings & Payouts"
                description="Track your revenue and manage payout settings"
                action={{
                    label: "Request Payout",
                    onClick: () => alert("Payout requests coming soon!"),
                    icon: "plus",
                }}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                        <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
                        <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                        <h3 className="text-gray-500 text-sm font-medium">Available Balance</h3>
                        <TrendingUp className="w-4 h-4 text-[#E85A6B]" />
                    </div>
                    <p className="text-2xl font-bold text-[#E85A6B]">{formatCurrency(stats.availableBalance)}</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                        <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
                        <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingPayouts)}</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                        <h3 className="text-gray-500 text-sm font-medium">Paid Out</h3>
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPaidOut)}</p>
                </div>
            </div>

            {/* Revenue Breakdown */}
            <Card title="Event Revenue Breakdown">
                <DataTable
                    data={stats.breakdown}
                    columns={revenueColumns}
                    emptyState={
                        <EmptyState
                            icon="dollar"
                            title="No revenue yet"
                            description="Revenue from events will appear here once tickets are sold."
                        />
                    }
                />
            </Card>

            {/* Payout Settings Placeholder */}
            <Card title="Payout Settings">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Bank Account</p>
                                <p className="text-sm text-gray-500">Configure your payout method</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">
                            Configure
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
