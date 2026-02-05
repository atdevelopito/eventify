import { useState, useEffect } from "react";
import { PageHeader, StatusBadge, EmptyState, FilterSelect, EventCard } from "@/components/organizer/shared";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Edit, Copy, Trash2, MapPin, Users } from "lucide-react";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext";
import { toast } from "sonner"; // Assuming sonner or similar toast lib is used, or fallback

export function EventsPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useRole();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Safe date helper
    const safeDate = (dateInfo: any) => {
        if (!dateInfo) return new Date();
        const d = new Date(dateInfo);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    // Helper to get full image URL
    const getImageUrl = (path: string | null | undefined) => {
        if (!path || typeof path !== 'string') return null;
        if (path.startsWith('http')) return path; // Already full URL
        return `http://127.0.0.1:5000${path}`; // Prepend backend URL
    };

    const fetchEvents = async () => {
        if (!user) return;
        try {
            const response = await api.get('/organizer/events');
            const mappedEvents = response.data.map((e: any) => ({
                ...e,
                date: safeDate(e.date || e.start_date),
                endDate: e.end_date ? safeDate(e.end_date) : undefined,
                // Map cover_image to image field for EventCard component
                image: getImageUrl(e.cover_image),
                location: e.venue || e.city || e.address || 'Online',
                capacity: e.capacity || 100
            }));
            setEvents(mappedEvents);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchEvents();
        }
    }, [user, authLoading]);

    const handleDelete = async (eventId: string) => {
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
        try {
            await api.delete(`/events/${eventId}`);
            toast.success("Event deleted successfully");
            setEvents(events.filter(e => e.id !== eventId));
        } catch (error) {
            console.error("Failed to delete event", error);
            toast.error("Failed to delete event");
        }
    };

    const filteredEvents = events.filter(event => {
        if (statusFilter !== "all" && event.status !== statusFilter) return false;
        if (categoryFilter !== "all" && event.category !== categoryFilter) return false;
        if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const statusOptions = [
        { label: "All Statuses", value: "all" },
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Completed", value: "completed" },
    ];

    const categoryOptions = [
        { label: "All Categories", value: "all" },
        { label: "Conference", value: "Conference" },
        { label: "Workshop", value: "Workshop" },
        { label: "Networking", value: "Networking" },
        { label: "Webinar", value: "Webinar" },
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
                title="Events"
                description={`Manage and track your ${filteredEvents.length} events`}
                action={{
                    label: "Create Event",
                    onClick: () => navigate("/organizer/events/create"),
                    icon: "plus",
                }}
            />

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white border-gray-200 focus:ring-[#E85A6B] focus:border-[#E85A6B] rounded-lg"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <FilterSelect
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={statusOptions}
                        className="w-40 bg-white border-gray-200"
                    />
                    <FilterSelect
                        value={categoryFilter}
                        onChange={setCategoryFilter}
                        options={categoryOptions}
                        className="w-40 bg-white border-gray-200"
                    />
                </div>
            </div>

            {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            variant="detailed"
                            onClick={() => navigate(`/organizer/events/${event.id}`)}
                            onView={() => navigate(`/organizer/events/${event.id}`)}
                            onEdit={() => navigate(`/organizer/events/${event.id}/edit`)}
                            onDelete={() => handleDelete(event.id)}
                            onDuplicate={() => { }} // Implement duplicate later if needed
                            className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#E85A6B]/30 transition-all rounded-xl overflow-hidden"
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="calendar"
                    title="No events found"
                    description="Get started by creating your first event."
                    action={{
                        label: "Create Event",
                        onClick: () => navigate("/organizer/events/create"),
                    }}
                />
            )}
        </div>
    );
}
