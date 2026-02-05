import { useState, useEffect } from "react";
// import { DashboardLayout } from "@/components/organizer/layout/DashboardLayout";
import { MetricCard, Card, QuickAction, EventCard, ActivityItem, ProgressRing } from "@/components/organizer/shared";
import CommandDeck from "@/components/ui/command-deck";
import {
    CalendarDays,
    Users,
    DollarSign,
    Ticket,
    TrendingUp,
    ArrowRight,
    Plus,
    Clock,
    Megaphone,
    Eye,
    BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext";

export function DashboardHome() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useRole();
    const now = new Date();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                setError(null);
                const response = await api.get('/organizer/dashboard');
                setData(response.data);
            } catch (error: any) {
                console.error("Failed to fetch dashboard data", error);
                setError(error.response?.data?.message || "Failed to load dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchDashboardData();
        }
    }, [user, authLoading]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatCompact = (value: number) => {
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k`;
        }
        return value.toString();
    };

    // Brand Colors: Black, White, #E85A6B (Pink)
    const BRAND_PINK = '#E85A6B';
    const pieColors = [BRAND_PINK, '#1A1A1A', '#525252', '#A3A3A3'];

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <div className="text-red-500 font-medium">{error}</div>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Retry
                </Button>
            </div>
        );
    }

    const { stats, chartData, upcomingEvents, recentActivity } = data || {
        stats: { totalRevenue: 0, ticketsSold: 0, activeEvents: 0, totalAttendees: 0, upcomingEventsCount: 0, pastEventsCount: 0 },
        chartData: [],
        upcomingEvents: [],
        recentActivity: []
    };

    // Safe date helper
    const safeDate = (dateInfo: any) => {
        if (!dateInfo) return new Date();
        const d = new Date(dateInfo);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    // Prepare events for rendering (convert dates)
    const upcomingEventsFormatted = upcomingEvents.map((e: any) => ({
        ...e,
        date: safeDate(e.date || e.start_date)
    }));

    // Mock revenue by category for visualization (Backend enhancement possible)
    const revenueByCategory = [
        { name: "Tickets", value: stats.totalRevenue * 0.8 },
        { name: "Merch", value: stats.totalRevenue * 0.15 },
        { name: "Other", value: stats.totalRevenue * 0.05 },
    ];

    const actionItems = [
        {
            icon: <Plus className="w-4 h-4 text-white" />,
            title: "Create Event",
            description: "Launch a new experience",
            onClick: () => navigate('/organizer/events/create'),
            bgColor: "bg-black",
            textColor: "text-white"
        },
        {
            icon: <Megaphone className="w-4 h-4 text-black" />,
            title: "Promote",
            description: "Boost your reach",
            onClick: () => navigate('/organizer/promotions'),
            bgColor: "bg-gray-100",
            textColor: "text-black"
        },
    ];

    return (
        <div className="space-y-8 min-h-screen bg-white text-black p-1">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-normal tracking-[-0.03em] text-black">Overview</h1>
                    <p className="text-gray-500 mt-2 font-light">
                        Welcome back, <span className="text-black font-medium">{user?.name}</span>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate('/organizer/events')} className="h-10 border-black text-black hover:bg-gray-50 rounded-full px-5">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Calendar
                    </Button>
                    <Button className="bg-[#E85A6B] hover:bg-[#d64556] text-white h-10 px-6 rounded-full shadow-md transition-all hover:scale-105" onClick={() => navigate('/organizer/events/create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    icon={<DollarSign className="w-5 h-5" />}
                    trend={{ value: 12, label: "this month", isPositive: true }}
                    variant="default"
                    className="border-black/5 shadow-sm"
                    iconClassName="text-[#E85A6B] bg-[#E85A6B]/10"
                />
                <MetricCard
                    title="Tickets Sold"
                    value={formatCompact(stats.ticketsSold)}
                    icon={<Ticket className="w-5 h-5" />}
                    trend={{ value: 8, label: "this month", isPositive: true }}
                    iconClassName="text-black bg-black/5"
                />
                {/* Combined Event Stats */}
                <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Events</p>
                            <h3 className="text-2xl font-bold mt-1 tracking-tight">{stats.activeEvents} <span className="text-sm font-normal text-gray-400">Total</span></h3>
                        </div>
                        <div className="p-2 bg-black/5 rounded-lg">
                            <CalendarDays className="w-5 h-5 text-black" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="px-2 py-1 bg-[#E85A6B]/10 text-[#E85A6B] rounded-md">{stats.upcomingEventsCount || 0} Upcoming</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md">{stats.pastEventsCount || 0} Past</span>
                    </div>
                </div>

                <MetricCard
                    title="Total Attendees"
                    value={formatCompact(stats.totalAttendees)}
                    icon={<Users className="w-5 h-5" />}
                    trend={{ value: 5, label: "new", isPositive: true }}
                    iconClassName="text-black bg-black/5"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Registration & Revenue Chart */}
                    <Card
                        title="Revenue Trends"
                        className="shadow-sm overflow-hidden border-black/5"
                    >
                        <div className="h-80 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={BRAND_PINK} stopOpacity={0.1} />
                                            <stop offset="95%" stopColor={BRAND_PINK} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#9ca3af"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#ffffff",
                                            border: "1px solid #f3f4f6",
                                            borderRadius: "8px",
                                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                            padding: "12px"
                                        }}
                                        cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={BRAND_PINK}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Upcoming Events */}
                    <Card
                        title="Upcoming Events"
                        subtitle="Your schedule"
                        action={
                            <Button variant="link" className="text-black font-medium hover:text-[#E85A6B] transition-colors" onClick={() => navigate('/organizer/events')}>
                                View All
                            </Button>
                        }
                    >
                        <div className="space-y-4 pt-2">
                            {upcomingEventsFormatted.length > 0 ? (
                                upcomingEventsFormatted.slice(0, 4).map((event: any) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        variant="compact"
                                        onClick={() => navigate(`/organizer/events/${event.id}`)}
                                        className="hover:border-[#E85A6B]/30 transition-all cursor-pointer bg-gray-50/50"
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No upcoming events</p>
                                    <p className="text-sm text-gray-400 mb-4">Create your first event today</p>
                                    <Button className="bg-black text-white hover:bg-[#E85A6B] transition-colors" size="sm" onClick={() => navigate('/organizer/events/create')}>
                                        Create Event
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <Card title="Quick Actions">
                        <div className="grid grid-cols-1 gap-3">
                            {actionItems.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    className="flex items-center gap-4 p-4 rounded-2xl border border-transparent bg-gray-50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-300 text-left group"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${action.bgColor}`}>
                                        {action.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 group-hover:text-[#E85A6B] transition-colors">{action.title}</p>
                                        <p className="text-xs text-gray-500">{action.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Command Deck (Context Menu Demo) */}
                    <Card title="Command Deck">
                        <div className="flex justify-center py-2">
                            <CommandDeck />
                        </div>
                    </Card>

                    {/* Revenue by Category */}
                    <Card title="Revenue Distribution">
                        <div className="flex items-center justify-center py-4">
                            <div className="w-48 h-48 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={revenueByCategory}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                            cornerRadius={4}
                                            stroke="none"
                                        >
                                            {revenueByCategory.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Total</p>
                                        <p className="text-xl font-bold text-black">{formatCompact(stats.totalRevenue)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 mt-4">
                            {revenueByCategory.map((cat, index) => (
                                <div key={cat.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: pieColors[index % pieColors.length] }}
                                        />
                                        <span className="text-gray-600 font-medium">{cat.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{formatCompact(cat.value)}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card
                        title="Recent Activity"
                        action={
                            <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-black">
                                View All
                            </Button>
                        }
                    >
                        <div className="space-y-1">
                            {recentActivity.length > 0 ? (
                                recentActivity.slice(0, 5).map((activity: any) => (
                                    <div key={activity.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 p-2 rounded-lg transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-[#E85A6B]/10 flex items-center justify-center shrink-0">
                                            <Ticket className="w-4 h-4 text-[#E85A6B]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {(() => {
                                                    const d = new Date(activity.time);
                                                    return isNaN(d.getTime())
                                                        ? "Recent"
                                                        : format(d, 'MMM d, h:mm a');
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-400">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
