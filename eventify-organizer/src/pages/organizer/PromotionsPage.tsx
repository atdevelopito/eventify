import { useState, useEffect } from "react";
import { PageHeader, DataTable, Column, StatusBadge, EmptyState, FilterSelect, Card } from "@/components/organizer/shared";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Copy, Pause, Play, Trash2, Tag, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext";
import { toast } from "sonner";

export function PromotionsPage() {
    const { user, loading: authLoading } = useRole();
    const [promotions, setPromotions] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    // Create Promo State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newPromo, setNewPromo] = useState({
        code: "",
        description: "",
        type: "percentage",
        amount: "",
        usage_limit: "",
        event_id: "all"
    });

    const fetchData = async () => {
        if (!user) return;
        try {
            // Fetch Promotions
            const promRes = await api.get('/promotions');
            setPromotions(promRes.data);

            // Fetch Events (for dropdown)
            const eventsRes = await api.get('/organizer/events');
            setEvents(eventsRes.data);
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

    const handleCreate = async () => {
        if (!newPromo.code || !newPromo.amount || !newPromo.usage_limit) {
            toast.error("Please fill in required fields");
            return;
        }

        setCreating(true);
        try {
            const payload = {
                ...newPromo,
                event_id: newPromo.event_id === 'all' ? null : newPromo.event_id
            };

            await api.post('/promotions', payload);
            toast.success("Promotion created successfully");
            setIsCreateOpen(false);
            setNewPromo({ code: "", description: "", type: "percentage", amount: "", usage_limit: "", event_id: "all" });
            fetchData();
        } catch (error: any) {
            console.error("Create promo error", error);
            toast.error(error.response?.data?.message || "Failed to create promotion");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this promotion?")) return;
        try {
            await api.delete(`/promotions/${id}`);
            toast.success("Promotion deleted");
            setPromotions(promotions.filter(p => p.id !== id));
        } catch (error) {
            toast.error("Failed to delete promotion");
        }
    };

    const filteredPromotions = promotions.filter(promo => {
        if (statusFilter !== "all" && promo.status !== statusFilter) return false;
        return true;
    });

    const columns: Column<any>[] = [
        {
            key: "code",
            header: "Code",
            cell: (promo) => (
                <div>
                    <code className="px-2 py-1 rounded bg-gray-100 text-[#E85A6B] text-sm font-mono font-bold border border-gray-200">
                        {promo.code}
                    </code>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{promo.description || promo.event_title}</p>
                </div>
            ),
        },
        {
            key: "discount",
            header: "Discount",
            cell: (promo) => (
                <span className="text-sm font-bold text-gray-900">
                    {promo.type === 'percentage'
                        ? `${promo.amount}%`
                        : `$${promo.amount}`}
                </span>
            ),
        },
        {
            key: "usage",
            header: "Usage",
            cell: (promo) => {
                const limit = promo.usage_limit || 100; // Default if 0/unlimited not handled visually
                const count = promo.used_count || 0;
                const percentage = Math.min(100, (count / limit) * 100);
                return (
                    <div className="w-28">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">{count} / {limit === 0 ? '∞' : limit}</span>
                        </div>
                        <Progress value={percentage} className="h-1.5 bg-gray-100" />
                    </div>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            cell: (promo) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${promo.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {promo.status}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            cell: (promo) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDelete(promo.id)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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

    const activePromos = promotions.filter(p => p.status === 'active').length;
    const totalUsage = promotions.reduce((sum, p) => sum + (p.used_count || 0), 0);

    return (
        <div className="space-y-8 min-h-screen bg-white text-black p-1">
            <PageHeader
                title="Promotions"
                description={`Manage discount codes • ${activePromos} active`}
                action={{
                    label: "Create Promotion",
                    onClick: () => setIsCreateOpen(true),
                    icon: "plus",
                }}
            />

            {/* Active Promotions Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {promotions
                    .filter(p => p.status === 'active')
                    .slice(0, 3)
                    .map((promo) => (
                        <Card key={promo.id} padding="md" className="border-gray-100 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <code className="text-sm font-mono font-bold text-[#E85A6B] bg-[#E85A6B]/5 px-2 py-0.5 rounded">
                                        {promo.code}
                                    </code>
                                    <p className="text-2xl font-bold mt-2 text-gray-900">
                                        {promo.type === 'percentage'
                                            ? `${promo.amount}% off`
                                            : `$${promo.amount} off`}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {promo.used_count || 0} used
                                    </p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Tag className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </Card>
                    ))}
            </div>

            <DataTable
                data={filteredPromotions}
                columns={columns}
                searchable
                searchPlaceholder="Search codes..."
                searchKey="code"
                emptyState={
                    <EmptyState
                        icon="megaphone"
                        title="No promotions created"
                        description="Create discount codes to boost ticket sales"
                        action={{
                            label: "Create Promotion",
                            onClick: () => setIsCreateOpen(true),
                        }}
                    />
                }
            />

            {/* Create Promotion Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Promotion</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Event Scope</Label>
                            <Select
                                value={newPromo.event_id}
                                onValueChange={(val) => setNewPromo({ ...newPromo, event_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Events" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Global (All Events)</SelectItem>
                                    {events.map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Promo Code</Label>
                            <Input
                                placeholder="e.g., SUMMER20"
                                className="uppercase font-mono"
                                value={newPromo.code}
                                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="Brief description"
                                value={newPromo.description}
                                onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Discount Type</Label>
                                <Select
                                    value={newPromo.type}
                                    onValueChange={(val) => setNewPromo({ ...newPromo, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Value</Label>
                                <Input
                                    type="number"
                                    placeholder="20"
                                    value={newPromo.amount}
                                    onChange={(e) => setNewPromo({ ...newPromo, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Usage Limit</Label>
                            <Input
                                type="number"
                                placeholder="100 (0 for unlimited)"
                                value={newPromo.usage_limit}
                                onChange={(e) => setNewPromo({ ...newPromo, usage_limit: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={creating} className="bg-[#E85A6B] hover:bg-[#d64556]">
                            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Promotion
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
