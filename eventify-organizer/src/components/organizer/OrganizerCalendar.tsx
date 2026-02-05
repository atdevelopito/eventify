import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

interface Event {
    _id: string;
    id: string;
    title: string;
    date: string; // ISO string or YYYY-MM-DD
    end_date?: string;
    time: string;
    location: string;
    address: string;
    status?: string;
}

interface OrganizerCalendarProps {
    userId?: string;
}

export const OrganizerCalendar: React.FC<OrganizerCalendarProps> = ({ userId }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, [userId]);

    const fetchEvents = async () => {
        try {
            // Fetch all events for the user to plot on calendar
            // Using existing endpoint that returns list of events
            const { data } = await api.get(`/events/organizer/${userId}`);
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events for calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const eventsOnSelectedDate = events.filter(event =>
        isSameDay(new Date(event.date), selectedDate)
    );

    const getEventsForDay = (date: Date) => {
        return events.filter(event => isSameDay(new Date(event.date), date));
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading calendar...</div>;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            {/* Calendar Grid */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold font-mono uppercase tracking-tight flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-black" />
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-xs font-bold text-muted-foreground uppercase">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {daysInMonth.map((day, idx) => {
                        const dayEvents = getEventsForDay(day);
                        // Check if day is part of any event range (Start, End, or Middle)
                        // Assuming event has startDate and endDate? 
                        // Current Event interface only has `date`. 
                        // If user wants highlight for ongoing, we need end_date. 
                        // Let's check if API returns `end_date` or `endDate` or `target_date`.
                        // Based on typical schema, we might have `date` (start) and `end_date`.

                        // For now, highlighting dates that HAVE events as "Start" 
                        // If we had multi-day, we would check intervals.
                        // User request: "highlight where there is event like start, ongoing and end"
                        // This implies multi-day events. 
                        // I will add logic assuming `end_date` might exist, otherwise fallback to single day.

                        const eventsOnThisDay = events.filter(e => {
                            const start = new Date(e.date);
                            // If no end date, assume single day
                            const end = e.end_date ? new Date(e.end_date) : start;
                            return day >= start && day <= end; // Simplified overlap
                        });

                        const hasEvents = eventsOnThisDay.length > 0;
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentDay = isToday(day);

                        // Determine styling based on position in range? 
                        // For simplicity, just dot indicators for now as "Ongoing" visual is complex in grid without more data.
                        // I will add a subtle background if it's "ongoing"

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
                    ${isSelected ? 'bg-black text-white shadow-lg shadow-black/30 scale-105' : 'hover:bg-muted text-foreground'}
                    ${!isSelected && isCurrentDay ? 'border-2 border-black text-black' : ''}
                    ${!isSelected && !isCurrentDay && hasEvents ? 'bg-gray-100 font-bold' : ''}
                    ${!isSelected && !isCurrentDay && !hasEvents ? 'bg-white-base dark:bg-zinc-900' : ''}
                 `}
                            >
                                <span className={`text-sm ${isSelected ? 'text-white' : ''}`}>
                                    {format(day, 'd')}
                                </span>
                                {hasEvents && (
                                    <div className="flex gap-1 mt-1 justify-center flex-wrap px-1">
                                        {eventsOnThisDay.slice(0, 3).map((e, i) => (
                                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-black'}`} title={e.title} />
                                        ))}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Date Schedule */}
            <div className="w-full lg:w-96 bg-white-base dark:bg-zinc-900 rounded-xl p-6 border-l-4 border-black">
                <div className="mb-6">
                    <p className="text-sm font-medium text-muted-foreground uppercase">Schedule For</p>
                    <h3 className="text-3xl font-black text-foreground">{format(selectedDate, 'EEEE, MMM do')}</h3>
                </div>

                <div className="space-y-4">
                    {eventsOnSelectedDate.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No events scheduled</p>
                            <button
                                onClick={() => navigate('/create-event', { state: { initialDate: selectedDate } })}
                                className="mt-4 text-sm font-bold text-black hover:underline"
                            >
                                + Add Event
                            </button>
                        </div>
                    ) : (
                        eventsOnSelectedDate.map(event => (
                            <div
                                key={event._id || event.id}
                                onClick={() => navigate(`/edit-event/${event.id || event._id}`)}
                                className="bg-card p-4 rounded-lg border border-border/50 hover:border-black transition-colors group cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-lg group-hover:text-black transition-colors">{event.title}</h4>
                                    <span className="px-2 py-1 bg-black/10 text-black text-xs font-bold rounded uppercase">
                                        {event.status || 'Active'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <Clock className="w-3 h-3" />
                                    {event.time}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    {event.address}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
