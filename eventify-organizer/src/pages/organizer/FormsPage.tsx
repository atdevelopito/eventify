import { useState, useEffect } from "react";
import { PageHeader, DataTable, Column, StatusBadge, EmptyState, Card } from "@/components/organizer/shared";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2, FileText, Plus, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function FormsPage() {
    const { user, loading: authLoading } = useRole();
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [title, setTitle] = useState("");
    const navigate = useNavigate();

    const fetchForms = async () => {
        if (!user) return;
        try {
            const res = await api.get('/forms/organizer');
            setForms(res.data);
        } catch (error) {
            console.error("Failed to fetch forms", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchForms();
        }
    }, [user, authLoading]);

    const handleCreate = async () => {
        if (!title) return toast.error("Title is required");
        try {
            const res = await api.post('/forms', { title, fields: [] });
            toast.success("Form created");
            setIsCreateOpen(false);
            // Navigate to builder
            navigate(`/organizer/forms/${res.data.id}`);
        } catch (error) {
            toast.error("Failed to create form");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This form might be attached to tickets.")) return;
        try {
            await api.delete(`/forms/${id}`);
            toast.success("Form deleted");
            setForms(forms.filter(f => f.id !== id));
        } catch (error) {
            toast.error("Failed to delete form");
        }
    };

    const columns: Column<any>[] = [
        {
            key: "title",
            header: "Form Title",
            cell: (form) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{form.title}</p>
                        <p className="text-xs text-gray-500">{form.fields?.length || 0} fields</p>
                    </div>
                </div>
            ),
        },
        {
            key: "updated",
            header: "Last Updated",
            cell: (form) => {
                try {
                    return (
                        <span className="text-sm text-gray-500">
                            {form.updated_at ? format(new Date(form.updated_at), "MMM d, yyyy") : "-"}
                        </span>
                    );
                } catch (e) {
                    return <span className="text-sm text-gray-500">-</span>;
                }
            },
        },
        {
            key: "actions",
            header: "",
            cell: (form) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/organizer/forms/${form.id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Builder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(form.id)} className="text-red-600 focus:text-red-600">
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
                title="Forms"
                description="Create and manage custom registration forms"
                action={{
                    label: "Create Form",
                    onClick: () => setIsCreateOpen(true),
                    icon: "plus",
                }}
            />

            <DataTable
                data={forms}
                columns={columns}
                searchable
                searchPlaceholder="Search forms..."
                searchKey="title"
                emptyState={
                    <EmptyState
                        icon="file"
                        title="No forms created"
                        description="Create forms to collect attendee information"
                        action={{
                            label: "Create Form",
                            onClick: () => setIsCreateOpen(true),
                        }}
                    />
                }
            />

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Form</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Form Title</Label>
                            <Input
                                placeholder="e.g., Post-Event Survey"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} className="bg-[#E85A6B] hover:bg-[#d64556]">
                            Create & Build
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
