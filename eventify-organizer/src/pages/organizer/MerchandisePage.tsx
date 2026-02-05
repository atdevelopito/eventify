import { useState, useEffect } from "react";
import { PageHeader, DataTable, Column, StatusBadge, EmptyState, Card } from "@/components/organizer/shared";
import { MoreHorizontal, Edit, EyeOff, Trash2, ShoppingBag, Plus, Package, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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

export function MerchandisePage() {
    const { user, loading: authLoading } = useRole();
    const [merchandise, setMerchandise] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newItem, setNewItem] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "other"
    });

    const fetchMerchandise = async () => {
        if (!user) return;
        try {
            const res = await api.get('/merchandise');
            setMerchandise(res.data);
        } catch (error) {
            console.error("Failed to fetch merchandise", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchMerchandise();
        }
    }, [user, authLoading]);

    const handleCreate = async () => {
        if (!newItem.name || !newItem.price || !newItem.stock) {
            toast.error("Please fill in required fields");
            return;
        }

        setCreating(true);
        try {
            await api.post('/merchandise', newItem);
            toast.success("Product created successfully");
            setIsCreateOpen(false);
            setNewItem({ name: "", description: "", price: "", stock: "", category: "other" });
            fetchMerchandise();
        } catch (error) {
            toast.error("Failed to create product");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/merchandise/${id}`);
            toast.success("Product deleted");
            setMerchandise(merchandise.filter(m => m.id !== id));
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const totalRevenue = merchandise.reduce((sum, m) => sum + ((m.sold || 0) * m.price), 0);
    const totalSold = merchandise.reduce((sum, m) => sum + (m.sold || 0), 0);

    const columns: Column<any>[] = [
        {
            key: "name",
            header: "Product",
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "price",
            header: "Price",
            cell: (item) => (
                <span className="text-sm font-medium text-gray-900">{formatCurrency(item.price)}</span>
            ),
        },
        {
            key: "stock",
            header: "Stock",
            cell: (item) => {
                const sold = item.sold || 0;
                const total = item.stock + sold;
                const percentage = total > 0 ? (item.stock / total) * 100 : 0;
                return (
                    <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600 font-medium">{item.stock} left</span>
                        </div>
                        <Progress value={percentage} className="h-1.5 bg-gray-100" />
                    </div>
                );
            },
        },
        {
            key: "sold",
            header: "Sold",
            cell: (item) => (
                <span className="text-sm text-gray-700">{item.sold || 0}</span>
            ),
        },
        {
            key: "revenue",
            header: "Revenue",
            cell: (item) => (
                <span className="text-sm font-bold text-gray-900">{formatCurrency((item.sold || 0) * item.price)}</span>
            ),
        },
        {
            key: "status",
            header: "Status",
            cell: (item) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {item.status}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            cell: (item) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600 focus:text-red-600">
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

    return (
        <div className="space-y-8 min-h-screen bg-white text-black p-1">
            <PageHeader
                title="Merchandise"
                description="Manage event merchandise and product listings"
                action={{
                    label: "Add Product",
                    onClick: () => setIsCreateOpen(true),
                    icon: "plus",
                }}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card padding="md" className="border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                            <ShoppingBag className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{merchandise.length}</p>
                        </div>
                    </div>
                </Card>
                <Card padding="md" className="border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#E85A6B]/10 flex items-center justify-center border border-[#E85A6B]/20">
                            <Package className="w-5 h-5 text-[#E85A6B]" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Items Sold</p>
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
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <DataTable
                data={merchandise}
                columns={columns}
                searchable
                searchPlaceholder="Search products..."
                searchKey="name"
                emptyState={
                    <EmptyState
                        icon="shopping"
                        title="No merchandise yet"
                        description="Add products to sell at your events"
                        action={{
                            label: "Add Product",
                            onClick: () => setIsCreateOpen(true),
                        }}
                    />
                }
            />

            {/* Create Product Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                placeholder="e.g., Event T-Shirt"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Brief product description"
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Price ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="25"
                                    value={newItem.price}
                                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stock</Label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={newItem.stock}
                                    onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={newItem.category}
                                onValueChange={(val) => setNewItem({ ...newItem, category: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="apparel">Apparel</SelectItem>
                                    <SelectItem value="accessories">Accessories</SelectItem>
                                    <SelectItem value="stationery">Stationery</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={creating} className="bg-[#E85A6B] hover:bg-[#d64556]">
                            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Add Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
