import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, Card } from "@/components/organizer/shared";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, isBefore, isAfter, isWithinInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext";

interface Event {
    id: string;
    title: string;
    date: Date;
    end_date?: Date;
    location: string;
    status: string;
    registrations: number;
}

export function CalendarsPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useRole();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [view, setView] = useState<"month" | "week">("month");
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad the beginning with empty days to align with weekday
    const startPadding = getDay(monthStart);
    const today = new Date();
    const BRAND_PINK = '#E85A6B';

    useEffect(() => {
        const fetchEvents = async () => {
            if (!user) return;
            try {
                const response = await api.get('/organizer/events');
                const mappedEvents = response.data.map((e: any) => {
                    const startDate = new Date(e.date || e.start_date || Date.now());
                    const endDate = e.end_date ? new Date(e.end_date) : undefined;
                    return {
                        id: e.id || e._id,
                        title: e.title,
                        date: startDate,
                        end_date: endDate,
                        location: e.venue || e.address || 'Online',
                        status: e.status,
                        registrations: e.ticketsSold || e.registrations || 0
                    };
                });
                setEvents(mappedEvents);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchEvents();
        }
    }, [user, authLoading]);

    const getEventsForDay = (day: Date) => {
        return events.filter(event => {
            // Check if day matches start date
            if (isSameDay(event.date, day)) return true;
            // Check if day is within range (if end_date exists)
            if (event.end_date && isWithinInterval(day, { start: event.date, end: event.end_date })) return true;
            return false;
        });
    };

    const getEventStyle = (event: Event) => {
        const isPast = isBefore(event.end_date || event.date, today);
        const isOngoing = event.end_date && isWithinInterval(today, { start: event.date, end: event.end_date });
        const isFuture = isAfter(event.date, today);

        if (isOngoing) {
            return "bg-[#E85A6B] text-white ring-1 ring-[#E85A6B]/50 animate-pulse font-bold";
        } else if (isFuture) {
            return "bg-black text-white hover:bg-gray-800 transition-colors font-bold";
        } else {
            return "bg-gray-50 text-gray-400 border border-gray-100 line-through decoration-gray-300 font-medium";
        }
    };

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E85A6B]"></div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 min-h-screen bg-[#F8F9FA] pb-12"
        >
            <div className="px-4 md:px-8 pt-8">
                <PageHeader
                    title="Calendar"
                    description="Manage your event schedule across the month"
                    action={{
                        label: "Create Event",
                        onClick: () => navigate("/organizer/events/create"),
                        icon: "plus",
                    }}
                />
            </div>

            <div className="px-4 md:px-8 max-w-[1600px] mx-auto space-y-8">
                {/* Minimalist Calendar Block */}
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    {/* Calendar Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-6">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                {format(currentMonth, "MMMM yyyy")}
                            </h2>
                            <div className="flex items-center gap-1 bg-[#F8F9FA] rounded-xl p-1 border border-gray-100">
                                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-10 w-10 hover:bg-white rounded-lg transition-colors">
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())} className="h-10 text-sm font-bold text-gray-700 hover:bg-white hover:text-black rounded-lg px-4 transition-colors">
                                    Today
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-10 w-10 hover:bg-white rounded-lg transition-colors">
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-8 bg-white">
                        {/* Week Day Headers */}
                        <div className="grid grid-cols-7 mb-6">
                            {weekDays.map((day) => (
                                <div key={day} className="text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-[1px] bg-gray-100 border border-gray-100 rounded-3xl overflow-hidden ring-1 ring-gray-100">
                            {/* Empty cells for padding */}
                            {Array.from({ length: startPadding }).map((_, i) => (
                                <div key={`pad-${i}`} className="min-h-[160px] bg-[#F8F9FA]/50" />
                            ))}

                            {days.map((day) => {
                                const dayEvents = getEventsForDay(day);
                                const isToday = isSameDay(day, today);
                                const isCurrentMonth = isSameMonth(day, currentMonth);

                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={cn(
                                            "min-h-[160px] p-2 bg-white hover:bg-gray-50/50 transition-colors relative group",
                                            !isCurrentMonth && "bg-[#F8F9FA]/50 text-gray-400 opacity-50",
                                            isToday && "bg-[#E85A6B]/[0.02]"
                                        )}
                                    >
                                        <div className={cn(
                                            "text-xs mb-3 w-8 h-8 flex items-center justify-center rounded-full font-bold transition-all ml-1 mt-1",
                                            isToday
                                                ? "bg-[#E85A6B] text-white scale-110"
                                                : "text-gray-900 group-hover:bg-gray-100"
                                        )}>
                                            {format(day, "d")}
                                        </div>
                                        <div className="space-y-1.5 px-1 pb-2">
                                            {dayEvents.slice(0, 3).map((event) => (
                                                <div
                                                    key={event.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/organizer/events/${event.id}`);
                                                    }}
                                                    className={cn(
                                                        "text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer truncate font-medium transition-all group/event",
                                                        getEventStyle(event)
                                                    )}
                                                    title={event.title}
                                                >
                                                    <span className="group-hover/event:opacity-100">{event.title}</span>
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-[10px] text-gray-500 px-2 font-bold hover:text-[#E85A6B] cursor-pointer mt-1">
                                                    +{dayEvents.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Upcoming Events List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Upcoming This Month</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {events
                            .filter(e => isSameMonth(e.date, currentMonth) && isAfter(e.date, today))
                            .sort((a, b) => a.date.getTime() - b.date.getTime())
                            .slice(0, 6)
                            .map((event) => (
                                <div
                                    key={event.id}
                                    onClick={() => navigate(`/organizer/events/${event.id}`)}
                                    className="flex items-start gap-4 p-5 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all border border-gray-100 hover:border-gray-300 group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-black flex flex-col items-center justify-center text-white shrink-0 shadow-sm group-hover:-translate-y-1 transition-transform">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#E85A6B]">
                                            {format(event.date, "MMM")}
                                        </span>
                                        <span className="text-2xl font-black leading-none mt-0.5">
                                            {format(event.date, "d")}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <h4 className="font-bold text-gray-900 truncate text-base group-hover:text-[#E85A6B] transition-colors">{event.title}</h4>
                                        <div className="flex flex-col gap-1.5 mt-2 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                {format(event.date, "h:mm a")}
                                            </span>
                                            <span className="flex items-center gap-2 truncate">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="truncate">{event.location}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        {events.filter(e => isSameMonth(e.date, currentMonth) && isAfter(e.date, today)).length === 0 && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl bg-[#F8F9FA]">
                                <p className="text-gray-500 font-bold mb-2">Your calendar is clear</p>
                                <p className="text-gray-400 text-sm mb-6">There are no upcoming events scheduled for this month.</p>
                                <Button onClick={() => navigate("/organizer/events/create")} className="bg-black hover:bg-[#E85A6B] text-white font-bold h-12 px-8 rounded-xl transition-all">
                                    Schedule New Event
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
