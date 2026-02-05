import { useState, useEffect } from "react";
import { PageHeader, DataTable, Column, StatusBadge, EmptyState, FilterSelect, Card } from "@/components/organizer/shared";
import { format } from "date-fns";
import { MoreHorizontal, FileText, Mail, Ban, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext"; // Assuming existing context

export function RegistrationsPage() {
    const { user, loading: authLoading } = useRole();
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState("all");

    // View Response State
    const [selectedResponse, setSelectedResponse] = useState<any>(null);
    const [isResponseOpen, setIsResponseOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Fetch Attendees (Registrations)
                const regRes = await api.get('/organizer/attendees'); // This endpoint returns aggregated attendees
                setRegistrations(regRes.data);
                setFilteredRegistrations(regRes.data);

                // Extract unique events for filter
                const uniqueEvents = Array.from(new Set(regRes.data.map((r: any) => r.eventTitle)))
                    .map(title => ({ value: title, label: title }));
                setEvents(uniqueEvents);

            } catch (error) {
                console.error("Failed to fetch registrations", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchData();
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (selectedEvent === "all") {
            setFilteredRegistrations(registrations);
        } else {
            setFilteredRegistrations(registrations.filter(r => r.eventTitle === selectedEvent));
        }
    }, [selectedEvent, registrations]);

    const handleViewResponse = (response: any) => {
        setSelectedResponse(response);
        setIsResponseOpen(true);
    };

    const columns: Column<any>[] = [
        {
            key: "display_name",
            header: "Attendee",
            cell: (reg) => (
                <div>
                    <p className="font-medium text-foreground">{reg.display_name}</p>
                    <p className="text-xs text-muted-foreground">{reg.email}</p>
                </div>
            ),
        },
        {
            key: "eventTitle",
            header: "Event",
            cell: (reg) => (
                <span className="text-sm text-foreground">{reg.eventTitle}</span>
            ),
        },
        {
            key: "ticket_type",
            header: "Ticket",
            cell: (reg) => <span className="text-sm font-medium">{reg.ticket_type}</span>,
        },
        {
            key: "registered_at",
            header: "Date",
            cell: (reg) => {
                try {
                    return <span className="text-sm text-muted-foreground">{format(new Date(reg.registered_at), "MMM d, yyyy")}</span>;
                } catch (e) {
                    return <span className="text-sm text-muted-foreground">-</span>;
                }
            },
        },
        {
            key: "actions",
            header: "",
            cell: (reg) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {/* Only show if form response exists */}
                        {reg.form_response && Object.keys(reg.form_response).length > 0 && (
                            <DropdownMenuItem onClick={() => handleViewResponse(reg.form_response)}>
                                <FileText className="w-4 h-4 mr-2" />
                                View Form Response
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Email Attendee
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            <Ban className="w-4 h-4 mr-2" />
                            Revoke Ticket
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E85A6B]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Registrations"
                description="View and manage all event registrations"
                action={{
                    label: "Export CSV",
                    onClick: () => { },
                    icon: "download", // Changed from 'plus' to 'download' if available or just remove icon prop if type issue
                }}
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-border">
                <div className="w-full sm:w-64">
                    <FilterSelect
                        placeholder="Filter by Event"
                        options={[{ value: "all", label: "All Events" }, ...events]}
                        value={selectedEvent}
                        onChange={setSelectedEvent}
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    Total Registrations: <span className="font-medium text-foreground">{filteredRegistrations.length}</span>
                </div>
            </div>

            <Card padding="none">
                <div className="p-4">
                    <DataTable
                        data={filteredRegistrations}
                        columns={columns}
                        searchable
                        searchPlaceholder="Search attendees..."
                        searchKey="display_name"
                        emptyState={
                            <EmptyState
                                icon="users"
                                title="No registrations found"
                                description="Adjust your filters or wait for new sales"
                            />
                        }
                    />
                </div>
            </Card>

            {/* View Response Dialog */}
            <Dialog open={isResponseOpen} onOpenChange={setIsResponseOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Form Response</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        {selectedResponse ? (
                            Object.entries(selectedResponse).map(([question, answer]: [string, any]) => (
                                <div key={question} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{question}</p>
                                    <p className="text-sm text-gray-900">{String(answer)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No data available.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsResponseOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
