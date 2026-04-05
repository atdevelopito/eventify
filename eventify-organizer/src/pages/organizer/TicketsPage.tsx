import { useState, useEffect } from "react";
import { DataTable, Column, EmptyState } from "@/components/organizer/shared";
import { MoreHorizontal, Edit, Trash2, Ticket as TicketIcon, Loader2, FileText, Plus, DollarSign, Tag } from "lucide-react";
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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TicketsPage() {
    const { user, loading: authLoading } = useRole();
    const [tickets, setTickets] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newTicket, setNewTicket] = useState({
        eventId: "",
        name: "",
        description: "",
        price: "",
        quantity: "",
        formId: "none"
    });

    // Edit ticket state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editTicket, setEditTicket] = useState<any>({
        eventId: "",
        originalName: "",
        name: "",
        description: "",
        price: "",
        quantity: "",
        formId: "none"
    });

    const fetchData = async () => {
        if (!user) return;
        try {
            const [ticketsRes, eventsRes, formsRes] = await Promise.all([
                api.get('/organizer/tickets'),
                api.get('/organizer/events'),
                api.get('/forms/organizer')
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
        if (!authLoading) fetchData();
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
                form_id: newTicket.formId === "none" ? null : newTicket.formId,
                sold: 0
            };

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

    const handleOpenEdit = (ticket: any) => {
        // ticket.id is like "eventId_ticketName", ticket.event_id is the event ID
        const eventId = ticket.event_id;
        const event = events.find(e => e.id === eventId);
        const ticketConfig = event?.tickets?.find((t: any) => t.name === ticket.name);

        setEditTicket({
            eventId,
            originalName: ticket.name,
            name: ticket.name,
            description: ticketConfig?.description || "",
            price: String(ticket.price),
            quantity: String(ticket.quantity),
            formId: ticketConfig?.form_id || "none"
        });
        setIsEditOpen(true);
    };

    const handleEditTicket = async () => {
        if (!editTicket.name || !editTicket.price || !editTicket.quantity) {
            toast.error("Please fill in all required fields");
            return;
        }

        setEditing(true);
        try {
            const event = events.find(e => e.id === editTicket.eventId);
            if (!event) throw new Error("Event not found");

            const currentTickets = event.tickets || [];
            const updatedTickets = currentTickets.map((t: any) => {
                if (t.name === editTicket.originalName) {
                    return {
                        ...t,
                        name: editTicket.name,
                        description: editTicket.description,
                        price: parseFloat(editTicket.price),
                        quantity: parseInt(editTicket.quantity),
                        form_id: editTicket.formId === "none" ? null : editTicket.formId,
                    };
                }
                return t;
            });

            await api.put(`/events/${editTicket.eventId}`, {
                tickets: updatedTickets
            });

            toast.success("Ticket updated successfully");
            setIsEditOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed to update ticket", error);
            toast.error("Failed to update ticket");
        } finally {
            setEditing(false);
        }
    };

    const handleDeleteTicket = async (ticket: any) => {
        const eventId = ticket.event_id;
        try {
            const event = events.find(e => e.id === eventId);
            if (!event) throw new Error("Event not found");

            const currentTickets = event.tickets || [];
            const updatedTickets = currentTickets.filter((t: any) => t.name !== ticket.name);

            await api.put(`/events/${eventId}`, {
                tickets: updatedTickets
            });

            toast.success("Ticket deleted successfully");
            fetchData();
        } catch (error) {
            console.error("Failed to delete ticket", error);
            toast.error("Failed to delete ticket");
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
                <div className="py-2">
                    <p className="font-bold text-gray-900 leading-tight">{ticket.name}</p>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase mt-0.5 max-w-[200px] truncate">{ticket.event?.title}</p>
                </div>
            ),
        },
        {
            key: "form",
            header: "Form",
            cell: (ticket) => {
                if (!ticket.form_id) return <span className="text-xs font-medium text-gray-400">None</span>;
                const form = forms.find(f => f.id === ticket.form_id);
                return (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-black bg-[#F8F9FA] px-2.5 py-1 rounded-md border border-gray-100 w-fit">
                        <FileText className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">{form ? form.title : "Custom Form"}</span>
                    </div>
                )
            }
        },
        {
            key: "price",
            header: "Price",
            cell: (ticket) => (
                <span className="text-sm font-black text-black">
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
                const isSoldOut = ticket.sold >= total;
                return (
                    <div className="w-40 py-2">
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className={cn(isSoldOut ? "text-red-500" : "text-black")}>
                                {ticket.sold} <span className="text-gray-400 font-medium">/ {total}</span>
                            </span>
                            <span className="text-gray-400">{Math.round(percentage)}%</span>
                        </div>
                        <Progress 
                            value={percentage} 
                            className="h-2 bg-gray-100 overflow-hidden"
                            type={isSoldOut ? "error" : "default"}
                        />
                    </div>
                );
            },
        },
        {
            key: "revenue",
            header: "Revenue",
            cell: (ticket) => (
                <span className="text-sm font-bold text-gray-600">
                    {formatCurrency(ticket.sold * ticket.price)}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            cell: (ticket) => {
                const isSoldOut = ticket.sold >= ticket.quantity;
                return (
                    <span className={cn(
                        "px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
                        isSoldOut 
                            ? "bg-gray-100 text-gray-400" 
                            : "bg-[#E85A6B] text-white shadow-sm shadow-[#E85A6B]/20"
                    )}>
                        {isSoldOut ? "Sold Out" : "Active"}
                    </span>
                );
            }
        },
        {
            key: "actions",
            header: "",
            cell: (ticket) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-lg">
                            <MoreHorizontal className="w-4 h-4 text-black" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-gray-100">
                        <DropdownMenuItem className="font-medium cursor-pointer" onClick={() => handleOpenEdit(ticket)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Ticket
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 font-medium cursor-pointer focus:text-red-700" onClick={() => handleDeleteTicket(ticket)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            className: "w-12",
        },
    ];

    const totalSold = tickets.reduce((sum, t) => sum + t.sold, 0);
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.sold * t.price), 0);

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
                        Tickets
                    </h1>
                    <p className="text-gray-500 font-medium">Manage ticket types and sales across your events</p>
                </div>
                
                <Button 
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-black text-white hover:bg-gray-900 rounded-xl px-6 h-12 font-bold transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Ticket
                </Button>
            </div>

            {/* Premium Bento Stats Grid */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <div className="bg-[#F8F9FA] p-6 rounded-2xl flex flex-col justify-center border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-bold tracking-wide text-gray-500 uppercase">Ticket Types</p>
                    </div>
                    <p className="text-3xl font-black text-black">{tickets.length}</p>
                </div>

                <div className="bg-[#F8F9FA] p-6 rounded-2xl flex flex-col justify-center border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <TicketIcon className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-bold tracking-wide text-gray-500 uppercase">Total Sold</p>
                    </div>
                    <p className="text-3xl font-black text-black">{totalSold}</p>
                </div>

                <div className="bg-black text-white p-6 rounded-2xl flex flex-col justify-center shadow-xl shadow-black/10">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-bold tracking-wide text-gray-400 uppercase">Revenue</p>
                    </div>
                    <p className="text-4xl font-black text-white">{formatCurrency(totalRevenue)}</p>
                </div>
            </motion.div>

            <motion.div 
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <DataTable
                    data={tickets}
                    columns={columns}
                    searchable
                    searchPlaceholder="Search tickets..."
                    searchKey="name"
                    emptyState={
                        <div className="py-24 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                                <TicketIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-1">No tickets created</h3>
                            <p className="text-gray-500 font-medium mb-6">Create ticket types to start selling passes.</p>
                            <Button 
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-black text-white hover:bg-gray-900 rounded-xl px-6 font-bold"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Ticket
                            </Button>
                        </div>
                    }
                />
            </motion.div>

            {/* Create Ticket Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="rounded-2xl sm:max-w-md border-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Create Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-black uppercase tracking-wide">Event</Label>
                            <Select
                                value={newTicket.eventId}
                                onValueChange={(val) => setNewTicket({ ...newTicket, eventId: val })}
                            >
                                <SelectTrigger className="h-12 bg-[#F8F9FA] border-gray-200 rounded-xl font-medium focus:ring-black">
                                    <SelectValue placeholder="Select event" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {events.map((e) => (
                                        <SelectItem key={e.id} value={e.id} className="font-medium cursor-pointer">{e.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-black uppercase tracking-wide">Ticket Name</Label>
                            <Input
                                placeholder="e.g., VIP Pass"
                                value={newTicket.name}
                                onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                                className="h-12 bg-[#F8F9FA] border-gray-200 rounded-xl font-medium focus-visible:ring-black"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-black uppercase tracking-wide">Custom Form (Optional)</Label>
                            <Select
                                value={newTicket.formId}
                                onValueChange={(val) => setNewTicket({ ...newTicket, formId: val })}
                            >
                                <SelectTrigger className="h-12 bg-[#F8F9FA] border-gray-200 rounded-xl font-medium focus:ring-black">
                                    <SelectValue placeholder="Select a form..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="none" className="font-medium cursor-pointer">No Form (Quick Checkout)</SelectItem>
                                    {forms.map((f) => (
                                        <SelectItem key={f.id} value={f.id} className="font-medium cursor-pointer">{f.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] font-medium text-gray-500">Require specific data collection before purchase.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-black uppercase tracking-wide">Description</Label>
                            <Textarea
                                placeholder="What's included with this ticket?"
                                value={newTicket.description}
                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                className="bg-[#F8F9FA] border-gray-200 rounded-xl font-medium resize-none min-h-[80px] focus-visible:ring-black"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-black uppercase tracking-wide">Price ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="0 = Free"
                                    value={newTicket.price}
                                    onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
                                    className="h-12 bg-[#F8F9FA] border-gray-200 rounded-xl font-medium focus-visible:ring-black"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-black uppercase tracking-wide">Quantity</Label>
                                <Input
                                    type="number"
                                    placeholder="Capacity"
                                    value={newTicket.quantity}
                                    onChange={(e) => setNewTicket({ ...newTicket, quantity: e.target.value })}
                                    className="h-12 bg-[#F8F9FA] border-gray-200 rounded-xl font-medium focus-visible:ring-black"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsCreateOpen(false)}
                            className="h-12 font-bold rounded-xl hover:bg-gray-100 text-gray-500"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreateTicket} 
                            disabled={creating} 
                            className="bg-black text-white hover:bg-gray-900 h-12 font-bold rounded-xl px-8"
                        >
                            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Ticket
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Ticket Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="rounded-2xl sm:max-w-md border-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Edit Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-black uppercase tracking-wide">Ticket Name</Label>
                            <Input
                                placeholder="e.g., VIP Pass"
                                value={editTicket.name}
                                onChange={(e) => setEditTicket({ ...editTicket, name: e.target.value })}
                                className="h-12 bg-[#F8F9FA] border-gray-200 rounded-xl font-medium focus-visible:ring-black"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-black uppercase tracking-wide">Custom Form (Optional)</Label>
                            <Select
                                value={editTicket.formId}
                                onValueChange={(val) => setEditTicket({ ...editTicket, formId: val })}
                            >
                                <SelectTrigger className="h-12 bg-[#F8F9FA] border-gray-200 rounded-xl font-medium focus:ring-black">
                                    <SelectValue placeholder="Select a form..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="none" className="font-medium cursor-pointer">No Form (Quick Checkout)</SelectItem>
                                    {forms.map((f) => (
                                        <SelectItem key={f.id} value={f.id} className="font-medium cursor-pointer">{f.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-black uppercase tracking-wide">Description</Label>
                            <Textarea
                                placeholder="What's included with this ticket?"
                                value={editTicket.description}
                                onChange={(e) => setEditTicket({ ...editTicket, description: e.target.value })}
                                className="bg-[#F8F9FA] border-gray-200 rounded-xl font-medium resize-none min-h-[80px] focus-visible:ring-black"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-black uppercase tracking-wide">Price ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="0 = Free"
                                    value={editTicket.price}
                                    onChange={(e) => setEditTicket({ ...editTicket, price: e.target.value })}
                                    className="h-12 bg-[#F8F9FA] border-gray-200 rounded-xl font-medium focus-visible:ring-black"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-black uppercase tracking-wide">Quantity</Label>
                                <Input
                                    type="number"
                                    placeholder="Capacity"
                                    value={editTicket.quantity}
                                    onChange={(e) => setEditTicket({ ...editTicket, quantity: e.target.value })}
                                    className="h-12 bg-[#F8F9FA] border-gray-200 rounded-xl font-medium focus-visible:ring-black"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsEditOpen(false)}
                            className="h-12 font-bold rounded-xl hover:bg-gray-100 text-gray-500"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleEditTicket} 
                            disabled={editing} 
                            className="bg-black text-white hover:bg-gray-900 h-12 font-bold rounded-xl px-8"
                        >
                            {editing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
