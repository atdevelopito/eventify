import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek, eachDayOfInterval as eachDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Circle, Clock } from 'lucide-react';
import api from '@/lib/api';
import { useRole } from '@/components/RoleContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Event {
    id: string;
    _id?: string;
    title: string;
    date: string;
    status: string;
    time?: string;
    start_time?: string;
}

export const SidebarCalendar: React.FC = () => {
    const { user } = useRole();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id) fetchEvents();
    }, [user?.id]);

    const fetchEvents = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // Fetch events created by this organizer
            const { data } = await api.get(`/events?created_by=${user.id}&limit=100`);
            setEvents(data.events || []);
        } catch (error) {
            console.error("Failed to fetch sidebar events:", error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Get days for the grid (simple month view)
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart); // Start grid from Sunday/Monday
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDay({
        start: startDate,
        end: endDate
    });

    const getEventsForDay = (date: Date) => {
        return events.filter(e => {
            if (!e.date) return false;
            // Handle ISO strings or YYYY-MM-DD
            const eventDate = new Date(e.date);
            return isSameDay(eventDate, date);
        });
    };

    const selectedEvents = getEventsForDay(selectedDate);
    const hasEvents = (date: Date) => getEventsForDay(date).length > 0;

    return (
        <div className="px-4 pb-6 mt-6 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                    {format(currentDate, 'MMMM yyyy')}
                </h3>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-[10px] font-bold text-gray-400">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-6">
                {calendarDays.map((day, i) => {
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const dayHasEvents = hasEvents(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                                "aspect-square rounded-lg flex items-center justify-center text-xs font-medium relative transition-all",
                                !isCurrentMonth && "text-gray-300",
                                isCurrentMonth && !isSelected && "text-gray-600 hover:bg-gray-50",
                                isSelected && "bg-black text-white shadow-sm",
                                isTodayDate && !isSelected && "border border-black text-black font-bold",
                                dayHasEvents && !isSelected && "font-bold text-black"
                            )}
                        >
                            {format(day, 'd')}
                            {dayHasEvents && !isSelected && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-black"></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Date Summary */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {isToday(selectedDate) ? "Today" : format(selectedDate, 'MMM do')}
                </p>

                {selectedEvents.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {selectedEvents.map(event => (
                            <div
                                key={event.id || event._id}
                                onClick={() => navigate(`/events/${event.id || event._id}`)}
                                className="group p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-black hover:shadow-sm transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-black line-clamp-1">{event.title}</h4>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                                        event.status === 'published' ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                                    )}>
                                        {event.status === 'published' ? 'Live' : 'Draft'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {event.time || event.start_time || "All Day"}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-[10px] text-gray-400">No events found</p>
                        <button
                            onClick={() => navigate('/create-event', { state: { initialDate: selectedDate } })}
                            className="mt-2 text-[10px] font-bold text-black hover:underline"
                        >
                            + Create Event
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
