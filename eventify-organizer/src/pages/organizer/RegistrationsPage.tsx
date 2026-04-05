import { useState, useEffect } from "react";
import { PageHeader, DataTable, Column, EmptyState, FilterSelect, Card } from "@/components/organizer/shared";
import { format } from "date-fns";
import { MoreHorizontal, FileText, Mail, Ban, CheckCircle, Download, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useRole } from "@/components/RoleContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
                const regRes = await api.get('/organizer/attendees'); 
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
                <div className="flex items-center gap-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-black" />
                    </div>
                    <div>
                        <p className="font-semibold text-black leading-tight tracking-tight">{reg.display_name}</p>
                        <p className="text-xs text-gray-500 font-medium">{reg.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "eventTitle",
            header: "Event",
            cell: (reg) => (
                <span className="text-sm font-medium text-black px-2 py-1 bg-gray-50 rounded-md border border-gray-100 whitespace-nowrap">
                    {reg.eventTitle}
                </span>
            ),
        },
        {
            key: "ticket_type",
            header: "Ticket",
            cell: (reg) => (
                <span className="text-sm font-semibold tracking-wide text-gray-600">
                    {reg.ticket_type}
                </span>
            ),
        },
        {
            key: "registered_at",
            header: "Date",
            cell: (reg) => {
                try {
                    return <span className="text-sm font-medium text-gray-500">{format(new Date(reg.registered_at), "MMM d, yyyy")}</span>;
                } catch (e) {
                    return <span className="text-sm text-gray-500">-</span>;
                }
            },
        },
        {
            key: "actions",
            header: "",
            cell: (reg) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-lg">
                            <MoreHorizontal className="w-4 h-4 text-black" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-gray-100">
                        {reg.form_response && Object.keys(reg.form_response).length > 0 && (
                            <DropdownMenuItem onClick={() => handleViewResponse(reg.form_response)} className="font-medium cursor-pointer">
                                <FileText className="w-4 h-4 mr-2" />
                                View Form Response
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="font-medium cursor-pointer">
                            <Mail className="w-4 h-4 mr-2" />
                            Email Attendee
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        <DropdownMenuItem className="text-red-600 font-medium cursor-pointer focus:text-red-700">
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
                        Registrations
                    </h1>
                    <p className="text-gray-500 font-medium">Manage and export all guest information</p>
                </div>
                
                <Button 
                    className="bg-black text-white hover:bg-gray-900 rounded-xl px-6 h-12 font-bold transition-all flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Bento Filter & Total Stats Panel */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <div className="md:col-span-3 flex flex-col sm:flex-row gap-4 items-center bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
                    <div className="w-full sm:w-80">
                        <FilterSelect
                            placeholder="Filter by Event"
                            options={[{ value: "all", label: "All Events" }, ...events]}
                            value={selectedEvent}
                            onChange={setSelectedEvent}
                            className="w-full bg-white border-none shadow-sm rounded-xl"
                        />
                    </div>
                </div>

                <div className="md:col-span-1 bg-black text-white p-6 rounded-2xl flex flex-col justify-center items-start shadow-xl shadow-black/10">
                    <span className="text-sm font-semibold tracking-wide text-gray-400 uppercase mb-1">
                        Total Guests
                    </span>
                    <span className="text-4xl font-black">
                        {filteredRegistrations.length}
                    </span>
                </div>
            </motion.div>

            <motion.div 
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <DataTable
                    data={filteredRegistrations}
                    columns={columns}
                    searchable
                    searchPlaceholder="Search attendees..."
                    searchKey="display_name"
                    emptyState={
                        <div className="py-24 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-1">No registrations found</h3>
                            <p className="text-gray-500 font-medium">Adjust your filters or wait for new sales.</p>
                        </div>
                    }
                />
            </motion.div>

            {/* View Response Dialog */}
            <Dialog open={isResponseOpen} onOpenChange={setIsResponseOpen}>
                <DialogContent className="rounded-2xl sm:max-w-md border-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Form Response</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        {selectedResponse ? (
                            Object.entries(selectedResponse).map(([question, answer]: [string, any]) => (
                                <div key={question} className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{question}</p>
                                    <p className="text-sm font-medium text-black leading-relaxed">{String(answer)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8 font-medium">No data available.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button 
                            onClick={() => setIsResponseOpen(false)}
                            className="w-full bg-black text-white hover:bg-gray-900 rounded-xl h-12 font-bold"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
