import { useState, useEffect } from "react";
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
            return "bg-[#E85A6B]/10 text-[#E85A6B] border border-[#E85A6B]/20 animate-pulse";
        } else if (isFuture) {
            return "bg-black/5 text-black border border-black/10 hover:bg-black/10";
        } else {
            return "bg-gray-100 text-gray-500 border border-gray-200 line-through decoration-gray-400";
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
        <div className="space-y-6 min-h-screen bg-white">
            <PageHeader
                title="Calendar"
                description="Manage your event schedule"
                action={{
                    label: "Create Event",
                    onClick: () => navigate("/organizer/events/create"),
                    icon: "plus",
                }}
            />

            <Card padding="none" className="border-black/5 shadow-sm overflow-hidden">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-6">
                        <h2 className="text-2xl font-semibold text-black tracking-tight">
                            {format(currentMonth, "MMMM yyyy")}
                        </h2>
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="h-8 w-8 hover:bg-white hover:shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentMonth(new Date())}
                                className="h-8 text-xs font-medium hover:bg-white hover:shadow-sm px-3"
                            >
                                Today
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="h-8 w-8 hover:bg-white hover:shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                    {/* Week Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden shadow-inner">
                        {/* Empty cells for padding */}
                        {Array.from({ length: startPadding }).map((_, i) => (
                            <div key={`pad-${i}`} className="min-h-32 bg-gray-50/50" />
                        ))}

                        {days.map((day) => {
                            const dayEvents = getEventsForDay(day);
                            const isToday = isSameDay(day, today);
                            const isCurrentMonth = isSameMonth(day, currentMonth);

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "min-h-32 p-3 bg-white transition-colors relative group",
                                        !isCurrentMonth && "bg-gray-50/30 text-gray-400",
                                        isToday && "bg-[#E85A6B]/5"
                                    )}
                                >
                                    <div className={cn(
                                        "text-sm mb-2 w-7 h-7 flex items-center justify-center rounded-full font-medium transition-colors",
                                        isToday
                                            ? "bg-[#E85A6B] text-white shadow-md shadow-[#E85A6B]/20"
                                            : "text-gray-700 group-hover:bg-gray-100"
                                    )}>
                                        {format(day, "d")}
                                    </div>
                                    <div className="space-y-1.5">
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <div
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/organizer/events/${event.id}`);
                                                }}
                                                className={cn(
                                                    "text-[10px] px-2 py-1 rounded-md cursor-pointer truncate font-medium transition-all shadow-sm",
                                                    getEventStyle(event)
                                                )}
                                                title={event.title}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="text-[10px] text-gray-400 px-1 font-medium hover:text-[#E85A6B] cursor-pointer">
                                                +{dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {/* Upcoming Events List */}
            <Card title="Upcoming This Month" className="border-black/5 shadow-sm">
                <div className="space-y-2">
                    {events
                        .filter(e => isSameMonth(e.date, currentMonth) && isAfter(e.date, today))
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .slice(0, 5)
                        .map((event) => (
                            <div
                                key={event.id}
                                onClick={() => navigate(`/organizer/events/${event.id}`)}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-gray-100 group"
                            >
                                <div className="w-14 h-14 rounded-xl bg-black/5 flex flex-col items-center justify-center group-hover:bg-[#E85A6B] group-hover:text-white transition-colors">
                                    <span className="text-xs font-bold uppercase opacity-60">
                                        {format(event.date, "MMM")}
                                    </span>
                                    <span className="text-xl font-bold">
                                        {format(event.date, "d")}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate group-hover:text-[#E85A6B] transition-colors">{event.title}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {format(event.date, "h:mm a")}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {event.location}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs font-semibold px-3 py-1 bg-black/5 rounded-full text-black">
                                    {event.registrations} <span className="font-normal text-gray-500">sold</span>
                                </div>
                            </div>
                        ))}
                    {events.filter(e => isSameMonth(e.date, currentMonth) && isAfter(e.date, today)).length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
                            <p className="text-gray-400 font-medium text-sm">No upcoming events scheduled for {format(currentMonth, 'MMMM')}</p>
                            <Button variant="link" onClick={() => navigate("/organizer/events/create")} className="text-[#E85A6B] text-xs font-bold mt-1">
                                Schedule Event
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
