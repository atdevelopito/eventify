import { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/organizer/shared";
import { format } from "date-fns";
import { MoreHorizontal, Mail, Ban, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext";
import { motion } from "framer-motion";

export function AttendeesPage() {
    const { user, loading: authLoading } = useRole();
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendees = async () => {
            if (!user) return;
            try {
                const response = await api.get('/organizer/attendees');
                setAttendees(response.data);
            } catch (error) {
                console.error("Failed to fetch attendees", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchAttendees();
        }
    }, [user, authLoading]);

    const getInitials = (name: string) => {
        if (!name) return "??";
        return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    };

    // Unique events count
    const uniqueEvents = new Set(attendees.map(a => a.eventTitle)).size;

    const columns: Column<any>[] = [
        {
            key: "name",
            header: "Attendee",
            cell: (attendee) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {getInitials(attendee.display_name)}
                    </div>
                    <div>
                        <p className="font-bold text-black leading-tight tracking-tight">{attendee.display_name}</p>
                        <p className="text-xs text-gray-500 font-medium">{attendee.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "event",
            header: "Event",
            cell: (attendee) => (
                <span className="text-sm font-medium text-black px-2.5 py-1 bg-[#F8F9FA] rounded-md border border-gray-100 whitespace-nowrap">
                    {attendee.eventTitle}
                </span>
            ),
        },
        {
            key: "ticket",
            header: "Ticket Type",
            cell: (attendee) => (
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {attendee.ticket_type}
                </span>
            ),
        },
        {
            key: "date",
            header: "Registered",
            cell: (attendee) => {
                let dateStr = "-";
                if (attendee.registered_at) {
                    try {
                        const date = new Date(attendee.registered_at);
                        if (!isNaN(date.getTime())) {
                            dateStr = format(date, "MMM d, yyyy");
                        }
                    } catch (e) { }
                }
                return <span className="text-sm font-medium text-gray-500">{dateStr}</span>;
            },
        },
        {
            key: "actions",
            header: "",
            cell: (attendee) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-lg">
                            <MoreHorizontal className="w-4 h-4 text-black" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-gray-100">
                        <DropdownMenuItem className="font-medium cursor-pointer">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        <DropdownMenuItem className="text-red-600 font-medium cursor-pointer focus:text-red-700">
                            <Ban className="w-4 h-4 mr-2" />
                            Block Attendee
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            className: "w-12",
        },
    ];

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-8 min-h-screen bg-white text-black p-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-2">
                        Attendees
                    </h1>
                    <p className="text-gray-500 font-medium">View and manage all attendees across your events</p>
                </div>

                <Button
                    className="bg-black text-white hover:bg-gray-900 rounded-xl px-6 h-12 font-bold transition-all flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Bento Stats Strip */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <div className="bg-black text-white p-6 rounded-2xl flex flex-col justify-center shadow-xl shadow-black/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-bold tracking-wide text-gray-400 uppercase">Total Attendees</p>
                    </div>
                    <p className="text-4xl font-black">{attendees.length}</p>
                </div>

                <div className="bg-[#F8F9FA] p-6 rounded-2xl flex flex-col justify-center border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-bold tracking-wide text-gray-500 uppercase">Unique Events</p>
                    </div>
                    <p className="text-3xl font-black text-black">{uniqueEvents}</p>
                </div>

                <div className="bg-[#F8F9FA] p-6 rounded-2xl flex flex-col justify-center border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-bold tracking-wide text-gray-500 uppercase">Avg / Event</p>
                    </div>
                    <p className="text-3xl font-black text-black">
                        {uniqueEvents > 0 ? Math.round(attendees.length / uniqueEvents) : 0}
                    </p>
                </div>
            </motion.div>

            <motion.div
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <DataTable
                    data={attendees}
                    columns={columns}
                    searchable
                    searchPlaceholder="Search by name or email..."
                    searchKey="display_name"
                    emptyState={
                        <div className="py-24 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-1">No attendees found</h3>
                            <p className="text-gray-500 font-medium">Attendees will appear here once they register for your events.</p>
                        </div>
                    }
                />
            </motion.div>
        </motion.div>
    );
}
