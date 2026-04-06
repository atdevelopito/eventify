import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
            
            // Set up polling interval for "Smooth" updates
            const interval = setInterval(fetchDashboardData, 10000); // 10 seconds
            
            // Refresh on window focus
            window.addEventListener('focus', fetchDashboardData);
            
            return () => {
                clearInterval(interval);
                window.removeEventListener('focus', fetchDashboardData);
            };
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
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 min-h-screen bg-[#F8F9FA] text-black pb-12"
        >
            {/* Minimal Premium Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-8 py-10 bg-white border-b border-gray-100 )] -mt-4 -mx-4 md:-mt-8 md:-mx-8">
                <div className="space-y-1">
                    <p className="text-sm font-bold tracking-widest text-[#E85A6B] uppercase mb-2">Organizer Portal</p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">
                        Overview
                    </h1>
                    <p className="text-gray-500 font-medium pt-2">
                        Welcome back, <span className="text-black font-bold">{user?.name || "Organizer"}</span>. Here's what's happening.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate('/organizer/events')} className="h-12 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-6 font-semibold transition-all hover:border-gray-300">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Calendar
                    </Button>
                    <Button className="bg-black hover:bg-gray-800 text-white h-12 px-8 rounded-xl transition-all hover:-translate-y-0.5 font-bold" onClick={() => navigate('/organizer/events/create')}>
                        <Plus className="w-5 h-5 mr-2" />
                        Create Event
                    </Button>
                </div>
            </header>

            <div className="px-2 md:px-4 max-w-[1600px] mx-auto space-y-8 mt-8">
                {/* Bento Grid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 hover: transition-">
                            <div className="w-12 h-12 rounded-2xl bg-[#E85A6B]/10 flex items-center justify-center mb-4">
                                <DollarSign className="w-6 h-6 text-[#E85A6B]" />
                            </div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Total Revenue</p>
                            <h3 className="text-3xl font-black tracking-tight text-gray-900">{formatCurrency(stats.totalRevenue)}</h3>
                            <div className="mt-4 flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                                <TrendingUp className="w-3 h-3 mr-1 font-bold" /> +12% this month
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 hover: transition-">
                            <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center mb-4">
                                <Ticket className="w-6 h-6 text-black" />
                            </div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Tickets Sold</p>
                            <h3 className="text-3xl font-black tracking-tight text-gray-900">{formatCompact(stats.ticketsSold)}</h3>
                            <div className="mt-4 flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                                <TrendingUp className="w-3 h-3 mr-1 font-bold" /> +8% this month
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div className="p-6 bg-black rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                                <CalendarDays className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-gray-400 mb-1">Active Events</p>
                            <h3 className="text-3xl font-black tracking-tight text-white mb-4">{stats.activeEvents}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                                <span className="px-3 py-1.5 bg-[#E85A6B] text-white rounded-lg">{stats.upcomingEventsCount || 0} Upcoming</span>
                                <span className="px-3 py-1.5 bg-white/10 text-white rounded-lg backdrop-blur-sm">{stats.pastEventsCount || 0} Past</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 hover: transition-">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Total Attendees</p>
                            <h3 className="text-3xl font-black tracking-tight text-gray-900">{formatCompact(stats.totalAttendees)}</h3>
                            <div className="mt-4 flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                                <TrendingUp className="w-3 h-3 mr-1 font-bold" /> +5% new
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Main Content Dashboard */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-2">
                    {/* Main Chart Section */}
                    <div className="xl:col-span-2 space-y-8">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                            <div className="p-8 bg-white rounded-3xl border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#E85A6B]/30 to-transparent"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Revenue Performance</h3>
                                        <p className="text-sm font-medium text-gray-400">Monthly breakdown of ticket sales</p>
                                    </div>
                                    <Button variant="outline" className="rounded-full font-semibold">This Year</Button>
                                </div>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={BRAND_PINK} stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor={BRAND_PINK} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} fontWeight={600} />
                                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} fontWeight={600} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", padding: "16px", fontWeight: "bold" }}
                                                cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke={BRAND_PINK} strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>

                        {/* Event List inline */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                            <div className="p-8 bg-white rounded-3xl border border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Upcoming Events</h3>
                                        <p className="text-sm font-medium text-gray-400">Your scheduled events horizon</p>
                                    </div>
                                    <Button variant="ghost" className="text-[#E85A6B] hover:bg-[#E85A6B]/10 font-bold rounded-full transition-colors" onClick={() => navigate('/organizer/events')}>
                                        View All Calendar <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {upcomingEventsFormatted.length > 0 ? (
                                        upcomingEventsFormatted.slice(0, 4).map((event: any) => (
                                            <EventCard
                                                key={event.id}
                                                event={event}
                                                variant="compact"
                                                onClick={() => navigate(`/organizer/events/${event.id}`)}
                                                className="hover:border-[#E85A6B]/30 hover: transition-all cursor-pointer bg-gray-50/50 rounded-2xl"
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-1 md:col-span-2 text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                                <CalendarDays className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-bold text-lg mb-1">No upcoming events found</p>
                                            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">It looks like your schedule is empty. Create your first event today and start selling tickets.</p>
                                            <Button className="bg-black text-white hover:bg-[#E85A6B] transition-all rounded-xl px-8 h-12 font-bold" onClick={() => navigate('/organizer/events/create')}>
                                                Create First Event
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Side Column */}
                    <div className="space-y-8">
                        {/* Featured Action Card */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                            <div className="bg-[#E85A6B] rounded-3xl p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                                <h3 className="text-2xl font-black mb-2 tracking-tight">AI Event Builder</h3>
                                <p className="text-white/90 text-sm font-medium mb-8 leading-relaxed">Instantly magically generate your full event form, description, and ticketing tiers using just a single text prompt.</p>
                                <Button className="w-full bg-white text-[#E85A6B] hover:bg-gray-50 rounded-xl h-12 font-black transition-all hover:scale-[1.02]" onClick={() => navigate('/organizer/events/create')}>
                                    Launch AI Assistant
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                            <div className="p-8 bg-white rounded-3xl border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-8">Revenue Distribution</h3>
                                <div className="flex items-center justify-center py-2">
                                    <div className="w-52 h-52 relative group">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-transparent rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                                            <PieChart>
                                                <Pie data={revenueByCategory} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" cornerRadius={6} stroke="none">
                                                    {revenueByCategory.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                            <div className="text-center">
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Total</p>
                                                <p className="text-2xl font-black text-gray-900">{formatCompact(stats.totalRevenue)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-8">
                                    {revenueByCategory.map((cat, index) => (
                                        <div key={cat.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                                                <span className="text-gray-600 font-bold">{cat.name}</span>
                                            </div>
                                            <span className="font-black text-gray-900 text-lg">{formatCompact(cat.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
                            <div className="p-8 bg-white rounded-3xl border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                                </div>
                                <div className="space-y-2">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.slice(0, 5).map((activity: any) => (
                                            <div key={activity.id} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 cursor-default">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                                                    <Ticket className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{activity.message || "New activity detected"}</p>
                                                    <p className="text-xs font-semibold text-gray-400 mt-1">
                                                        {(() => {
                                                            const d = new Date(activity.time);
                                                            return isNaN(d.getTime()) ? "Just now" : format(d, 'MMM d, h:mm a');
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-sm font-bold text-gray-400">Your activity feed is empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
