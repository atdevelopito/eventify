import { useState, useEffect } from "react";
import { PageHeader, DataTable, Column, EmptyState, Card } from "@/components/organizer/shared";
import { MoreHorizontal, Edit, Trash2, Ticket as TicketIcon, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext";
import { toast } from "sonner";

export function TicketsPage() {
    const { user, loading: authLoading } = useRole();
    const [tickets, setTickets] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [forms, setForms] = useState<any[]>([]); // New: Forms state
    const [loading, setLoading] = useState(true);

    // Create Ticket State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newTicket, setNewTicket] = useState({
        eventId: "",
        name: "",
        description: "",
        price: "",
        quantity: "",
        formId: "none" // New: Form selection
    });

    const fetchData = async () => {
        if (!user) return;
        try {
            const [ticketsRes, eventsRes, formsRes] = await Promise.all([
                api.get('/organizer/tickets'),
                api.get('/organizer/events'),
                api.get('/forms/organizer') // Fetch forms too
            ]);

            setTickets(ticketsRes.data);
            setEvents(eventsRes.data);
            setForms(formsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [user, authLoading]);

    const handleCreateTicket = async () => {
        if (!newTicket.eventId || !newTicket.name || !newTicket.price || !newTicket.quantity) {
            toast.error("Please fill in all required fields");
            return;
        }

        setCreating(true);
        try {
            const event = events.find(e => e.id === newTicket.eventId);
            if (!event) throw new Error("Event not found");

            const ticketObj = {
                name: newTicket.name,
                description: newTicket.description,
                price: parseFloat(newTicket.price),
                quantity: parseInt(newTicket.quantity),
                form_id: newTicket.formId === "none" ? null : newTicket.formId, // Save formId
                sold: 0
            };

            // Existing tickets + new ticket
            const currentTickets = event.tickets || [];
            const updatedTickets = [...currentTickets, ticketObj];

            await api.put(`/events/${newTicket.eventId}`, {
                tickets: updatedTickets
            });

            toast.success("Ticket created successfully");
            setIsCreateOpen(false);
            setNewTicket({ eventId: "", name: "", description: "", price: "", quantity: "", formId: "none" });
            fetchData();

        } catch (error) {
            console.error("Failed to create ticket", error);
            toast.error("Failed to create ticket");
        } finally {
            setCreating(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const columns: Column<any>[] = [
        {
            key: "name",
            header: "Ticket",
            cell: (ticket) => (
                <div>
                    <p className="font-medium text-gray-900">{ticket.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{ticket.event?.title}</p>
                </div>
            ),
        },
        {
            key: "form",
            header: "Form",
            cell: (ticket) => {
                // Find form title if exists (need backend to return form title or we look it up if we loaded all forms)
                // For now, if we have form_id, show icon
                // We might need to enrich ticket data from backend to show form title, 
                // but checking if we can find it in our 'forms' list if we have it.
                // Note: The ticket object here comes from /organizer/tickets which might not have the form_id directly 
                // unless we updated the route. However, let's assume if it does:
                if (!ticket.form_id) return <span className="text-xs text-gray-400">None</span>;
                const form = forms.find(f => f.id === ticket.form_id);
                return (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 w-fit">
                        <FileText className="w-3 h-3 text-[#E85A6B]" />
                        <span className="truncate max-w-[100px]">{form ? form.title : "Custom Form"}</span>
                    </div>
                )
            }
        },
        {
            key: "price",
            header: "Price",
            cell: (ticket) => (
                <span className="text-sm font-medium text-gray-900">
                    {ticket.price > 0 ? formatCurrency(ticket.price) : "Free"}
                </span>
            ),
        },
        {
            key: "sold",
            header: "Sales",
            cell: (ticket) => {
                const total = ticket.quantity || 100;
                const percentage = Math.min(100, (ticket.sold / total) * 100);
                return (
                    <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">{ticket.sold} / {total}</span>
                            <span className="text-gray-400">{Math.round(percentage)}%</span>
                        </div>
                        <Progress value={percentage} className="h-1.5 bg-gray-100" />
                    </div>
                );
            },
        },
        {
            key: "revenue",
            header: "Revenue",
            cell: (ticket) => (
                <span className="text-sm text-gray-600">
                    {formatCurrency(ticket.sold * ticket.price)}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            cell: (ticket) => (
                ticket.sold >= ticket.quantity ?
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">Sold Out</span> :
                    <span className="px-2 py-0.5 rounded-full bg-[#E85A6B]/10 text-[#E85A6B] text-xs font-medium">Active</span>
            ),
        },
        {
            key: "actions",
            header: "",
            cell: () => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Ticket
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            className: "w-10",
        },
    ];

    const totalSold = tickets.reduce((sum, t) => sum + t.sold, 0);
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.sold * t.price), 0);

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
                title="Tickets"
                description="Manage ticket types and sales across your events"
                action={{
                    label: "Create Ticket",
                    onClick: () => setIsCreateOpen(true),
                    icon: "plus",
                }}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card padding="md" className="border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                            <TicketIcon className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ticket Types</p>
                            <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                        </div>
                    </div>
                </Card>
                <Card padding="md" className="border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#E85A6B]/10 flex items-center justify-center border border-[#E85A6B]/20">
                            <TicketIcon className="w-5 h-5 text-[#E85A6B]" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Sold</p>
                            <p className="text-2xl font-bold text-gray-900">{totalSold}</p>
                        </div>
                    </div>
                </Card>
                <Card padding="md" className="border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-black/5 flex items-center justify-center border border-black/10">
                            <div className="w-5 h-5 text-black font-bold flex items-center justify-center">$</div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <DataTable
                data={tickets}
                columns={columns}
                searchable
                searchPlaceholder="Search tickets..."
                searchKey="name"
                emptyState={
                    <EmptyState
                        icon="ticket"
                        title="No tickets created"
                        description="Create ticket types for your events to start selling."
                        action={{
                            label: "Create Ticket",
                            onClick: () => setIsCreateOpen(true),
                        }}
                    />
                }
            />

            {/* Create Ticket Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Event</Label>
                            <Select
                                value={newTicket.eventId}
                                onValueChange={(val) => setNewTicket({ ...newTicket, eventId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select event" />
                                </SelectTrigger>
                                <SelectContent>
                                    {events.map((e) => (
                                        <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                placeholder="e.g., VIP Pass"
                                value={newTicket.name}
                                onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                            />
                        </div>

                        {/* Form Selection */}
                        <div className="space-y-2">
                            <Label>Registration Form (Optional)</Label>
                            <Select
                                value={newTicket.formId}
                                onValueChange={(val) => setNewTicket({ ...newTicket, formId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a form..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Form (Standard Checkout)</SelectItem>
                                    {forms.map((f) => (
                                        <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-gray-500">Attendees must complete this form before checkout.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="What's included?"
                                value={newTicket.description}
                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Price ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="0 for free"
                                    value={newTicket.price}
                                    onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={newTicket.quantity}
                                    onChange={(e) => setNewTicket({ ...newTicket, quantity: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTicket} disabled={creating} className="bg-[#E85A6B] hover:bg-[#d64556]">
                            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Ticket
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
