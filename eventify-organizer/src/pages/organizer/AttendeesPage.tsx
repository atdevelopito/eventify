import { useState, useEffect } from "react";
import { PageHeader, DataTable, Column, StatusBadge, EmptyState, StatsCard } from "@/components/organizer/shared";
import { format } from "date-fns";
import { MoreHorizontal, Mail, Star, Ban, Users, Edit, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext";

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

    const columns: Column<any>[] = [
        {
            key: "name",
            header: "Attendee",
            cell: (attendee) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-gray-100">
                        <AvatarFallback className="bg-gray-50 text-gray-600 text-xs font-semibold">
                            {getInitials(attendee.display_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{attendee.display_name}</span>
                        <span className="text-xs text-gray-500">{attendee.email}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "event",
            header: "Event",
            cell: (attendee) => (
                <span className="text-sm text-gray-700 font-medium">{attendee.eventTitle}</span>
            ),
        },
        {
            key: "ticket",
            header: "Ticket Type",
            cell: (attendee) => (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#E85A6B]/5 text-[#E85A6B]">
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
                return <span className="text-sm text-gray-500">{dateStr}</span>;
            },
        },
        {
            key: "actions",
            header: "",
            cell: (attendee) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <Ban className="w-4 h-4 mr-2" />
                            Block Attendee
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            className: "w-10",
        },
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
                title="Attendees"
                description="View and manage all attendees across your events"
                action={{
                    label: "Export CSV",
                    onClick: () => { }, // TODO: Implement Export
                    icon: "download",
                    variant: "outline"
                }}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#E85A6B]/10 flex items-center justify-center text-[#E85A6B]">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Attendees</p>
                        <p className="text-2xl font-bold text-gray-900">{attendees.length}</p>
                    </div>
                </div>
            </div>

            <DataTable
                data={attendees}
                columns={columns}
                searchable
                searchPlaceholder="Search by name or email..."
                searchKey="display_name"
                emptyState={
                    <EmptyState
                        icon="users"
                        title="No attendees found"
                        description="Attendees will appear here once they register for your events."
                    />
                }
            />
        </div>
    );
}
