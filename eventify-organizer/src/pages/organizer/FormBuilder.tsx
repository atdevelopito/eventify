import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2, GripVertical, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/organizer/shared"; // Or ui/card if shared not expose raw Card
import api from "@/lib/axios";
import { toast } from "sonner";

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export function FormBuilder() {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<any>(null);
    const [fields, setFields] = useState<any[]>([]);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await api.get(`/forms/${formId}`);
                setForm(res.data);
                setFields(res.data.fields || []);
            } catch (error) {
                toast.error("Failed to load form");
                navigate('/organizer/forms');
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [formId, navigate]);

    const addField = (type: string) => {
        const newField = {
            id: generateId(),
            type,
            label: "New Question",
            required: false,
            options: type === 'select' || type === 'radio' ? ["Option 1", "Option 2"] : []
        };
        setFields([...fields, newField]);
    };

    const updateField = (id: string, updates: any) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === fields.length - 1)) return;
        const newFields = [...fields];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];
        setFields(newFields);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/forms/${formId}`, {
                ...form,
                fields
            });
            toast.success("Form saved successfully");
        } catch (error) {
            toast.error("Failed to save form");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/organizer/forms')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <Input
                            value={form?.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="text-lg font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0"
                        />
                        <p className="text-xs text-gray-500">
                            {fields.length} fields • {form?.updated_at ? "Last saved just now" : "Unsaved changes"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/organizer/forms')}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-[#E85A6B] hover:bg-[#d64556]">
                        {saving ? "Saving..." : "Save Form"}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Tools */}
                <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Add Field</h3>
                    <div className="space-y-2">
                        {[
                            { type: 'text', label: 'Short Text', icon: 'Aa' },
                            { type: 'textarea', label: 'Long Text', icon: '¶' },
                            { type: 'number', label: 'Number', icon: '#' },
                            { type: 'email', label: 'Email', icon: '@' },
                            { type: 'select', label: 'Dropdown', icon: '▼' },
                            { type: 'checkbox', label: 'Checkbox', icon: '☑' },
                        ].map((tool) => (
                            <button
                                key={tool.type}
                                onClick={() => addField(tool.type)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#E85A6B] hover:bg-[#E85A6B]/5 transition-all text-left group"
                            >
                                <span className="w-6 h-6 rounded bg-gray-100 group-hover:bg-white flex items-center justify-center text-xs font-bold text-gray-500">
                                    {tool.icon}
                                </span>
                                <span className="text-sm font-medium text-gray-700">{tool.label}</span>
                                <Plus className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-[#E85A6B]" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Canvas - Editor */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-2xl mx-auto space-y-4">
                        {fields.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                <p className="text-gray-400">Select a field type from the left to add it to your form.</p>
                            </div>
                        )}

                        {fields.map((field, index) => (
                            <div key={field.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm group hover:border-[#E85A6B]/30 transition-all relative">
                                {/* Field Header / Controls */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="flex flex-col gap-1 text-gray-300">
                                        <button onClick={() => moveField(index, 'up')} className="hover:text-gray-600 disabled:opacity-20" disabled={index === 0}>▲</button>
                                        <button onClick={() => moveField(index, 'down')} className="hover:text-gray-600 disabled:opacity-20" disabled={index === fields.length - 1}>▼</button>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <Label className="text-xs text-gray-500 mb-1 block">Label</Label>
                                                <Input
                                                    value={field.label}
                                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                    className="font-medium"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <Label className="text-xs text-gray-500 mb-1 block">Type</Label>
                                                <div className="text-sm font-medium py-2 px-3 bg-gray-50 rounded border border-gray-200 capitalize text-gray-500">
                                                    {field.type}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Options Editor for Select/Radio */}
                                        {(field.type === 'select' || field.type === 'radio') && (
                                            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                                <Label className="text-xs text-gray-500">Options (comma separated)</Label>
                                                <Input
                                                    value={field.options?.join(', ')}
                                                    onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                                    placeholder="Option 1, Option 2"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-6 pt-2">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={field.required}
                                                    onCheckedChange={(c) => updateField(field.id, { required: c })}
                                                    id={`req-${field.id}`}
                                                />
                                                <Label htmlFor={`req-${field.id}`} className="cursor-pointer">Required</Label>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                                                onClick={() => removeField(field.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Remove Field
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
