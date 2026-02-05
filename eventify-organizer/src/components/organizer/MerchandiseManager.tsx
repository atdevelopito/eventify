import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Pencil, Trash2, Upload, ShoppingBag, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface Merchandise {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    description: string | null;
    link: string | null;
    organizer_id: string;
}

interface MerchandiseManagerProps {
    userId: string | undefined;
}

export const MerchandiseManager: React.FC<MerchandiseManagerProps> = ({ userId }) => {
    const [items, setItems] = useState<Merchandise[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Merchandise | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        link: '',
        image_url: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (userId) {
            fetchItems();
        }
    }, [userId]);

    const fetchItems = async () => {
        try {
            const { data } = await api.get(`/merchandise/${userId}`);
            // Ensure data is array
            setItems(Array.isArray(data) ? data.map((item: any) => ({
                id: item._id, // map _id to id
                name: item.name,
                price: item.price,
                image_url: item.image_url,
                description: item.description,
                link: item.link,
                organizer_id: item.organizer_id
            })) : []);
        } catch (error) {
            console.error('Error fetching merchandise:', error);
            toast.error('Failed to load merchandise');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            link: '',
            image_url: ''
        });
        setEditingItem(null);
    };

    const handleOpenDialog = (item?: Merchandise) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                price: item.price.toString(),
                description: item.description || '',
                link: item.link || '',
                image_url: item.image_url || ''
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        try {
            toast.loading("Uploading image...");

            const formData = new FormData();
            formData.append('image', file);

            const { data: uploadPath } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const publicUrl = `${backendUrl}${uploadPath}`;

            setFormData(prev => ({ ...prev, image_url: publicUrl }));
            toast.dismiss();
            toast.success("Image uploaded");

        } catch (error) {
            console.error('Error uploading image:', error);
            toast.dismiss();
            toast.error('Failed to upload image');
        }
    };

    const handleSave = async () => {
        if (!userId) return;
        if (!formData.name || !formData.price) {
            toast.error("Name and Price are required");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description,
                link: formData.link,
                image_url: formData.image_url,
                // organizer_id is set by backend from token or checked against userId
            };

            if (editingItem) {
                // Determine API endpoint. Assuming PUT /merchandise/:id or similar?
                // I haven't implemented update/put in merchandiseRoutes yet unless I did batch?
                // merchandiseRoutes has GET, POST, DELETE. No PUT.
                // I'll add PUT to merchandiseRoutes.js shortly.
                // Assuming it will be available.
                await api.put(`/merchandise/${editingItem.id}`, payload);
                toast.success("Item updated");
            } else {
                await api.post('/merchandise', payload);
                toast.success("Item added");
            }

            setIsDialogOpen(false);
            fetchItems();
        } catch (error: any) {
            console.error('Error saving item:', error);
            toast.error('Failed to save item: ' + (error.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.delete(`/merchandise/${id}`);

            toast.success("Item deleted");
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (error: any) {
            console.error("Error deleting item:", error);
            toast.error("Failed to delete item: " + (error.message || 'Unknown error'));
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Merchandise</h2>
                    <p className="text-muted-foreground">Manage your store items displayed on your profile.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
            </div>

            {items.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No merchandise yet</h3>
                        <p className="text-muted-foreground mb-4">Add items to sell to your followers.</p>
                        <Button onClick={() => handleOpenDialog()} variant="outline">Create your first item</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => (
                        <Card key={item.id} className="overflow-hidden">
                            <div className="aspect-square relative bg-secondary/20">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag className="w-12 h-12 text-muted-foreground/20" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleOpenDialog(item)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                    <span className="font-bold text-green-600">${item.price}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            </CardContent>
                            <CardFooter>
                                {item.link && (
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center hover:underline">
                                        View Store Link <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Item' : 'Add Merchandise'}</DialogTitle>
                        <DialogDescription>
                            Add details about your merchandise.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex justify-center mb-4">
                            <div className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:bg-secondary/10"
                                onClick={() => fileInputRef.current?.click()}>
                                {formData.image_url ? (
                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-2">
                                        <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Upload Image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input id="price" type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="link">Store Link (Optional)</Label>
                            <Input id="link" placeholder="https://..." value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
