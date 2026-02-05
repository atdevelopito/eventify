import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    Plus,
    Trash2,
    GripVertical,
    Type,
    Hash,
    List,
    CheckCircle2,
    Save,
    X,
    AlignLeft
} from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';

interface FormField {
    id: string;
    type: 'text' | 'number' | 'select' | 'radio' | 'textarea';
    label: string;
    required: boolean;
    options?: string[]; // comma separated for editing
}

interface FormBuilderProps {
    formId?: string;
    onSave: (success: boolean) => void;
    onCancel: () => void;
}

const FieldItem = ({ field, index, updateField, removeField }: {
    field: FormField;
    index: number;
    updateField: (id: string, updates: Partial<FormField>) => void;
    removeField: (id: string) => void;
}) => {
    const controls = useDragControls();

    return (
        <Reorder.Item value={field} id={field.id} dragListener={false} dragControls={controls}>
            <div className="bg-card border rounded-xl p-4 mb-3 shadow-sm select-none">
                <div className="flex items-start gap-3">
                    <div
                        className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
                        onPointerDown={(e) => controls.start(e)}
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-md pointer-events-none">
                                {field.type === 'text' && <Type className="w-4 h-4" />}
                                {field.type === 'number' && <Hash className="w-4 h-4" />}
                                {field.type === 'textarea' && <AlignLeft className="w-4 h-4" />}
                                {(field.type === 'select' || field.type === 'radio') && <List className="w-4 h-4" />}
                            </div>
                            <Input
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                placeholder="Question / Label"
                                className="font-medium"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeField(field.id)}
                                className="text-muted-foreground hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="pl-12 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={field.required}
                                    onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                />
                                <span className="text-sm text-muted-foreground">Required</span>
                            </div>

                            {(field.type === 'select' || field.type === 'radio') && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold">Options (comma separated)</Label>
                                    <Input
                                        value={field.options?.join(', ') || ''}
                                        onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                        placeholder="Option 1, Option 2, Option 3"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Reorder.Item>
    );
};

export const FormBuilder = ({ formId, onSave, onCancel }: FormBuilderProps) => {
    const [title, setTitle] = useState('');
    const [fields, setFields] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (formId) {
            fetchForm();
        }
    }, [formId]);

    const fetchForm = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/forms/${formId}`);
            setTitle(data.title);
            setFields(data.fields || []);
        } catch (error) {
            console.error('Error fetching form:', error);
            toast.error('Failed to load form details');
        } finally {
            setLoading(false);
        }
    };

    const addField = (type: FormField['type']) => {
        const newField: FormField = {
            id: crypto.randomUUID(),
            type,
            label: '',
            required: false,
            options: (type === 'select' || type === 'radio') ? [] : undefined
        };
        setFields([...fields, newField]);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Please enter a form title');
            return;
        }
        if (fields.length === 0) {
            toast.error('Please add at least one question');
            return;
        }

        try {
            setSaving(true);
            const payload = { title, fields };

            if (formId) {
                await api.put(`/forms/${formId}`, payload);
                toast.success('Form updated successfully');
            } else {
                await api.post('/forms', payload);
                toast.success('Form created successfully');
            }
            onSave(true);
        } catch (error) {
            console.error('Error saving form:', error);
            toast.error('Failed to save form');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
                <div className="flex items-center gap-4 flex-1 mr-4">
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <X className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Form Title (e.g. Pre-Event Survey)"
                            className="text-lg font-bold border-transparent hover:border-input focus:border-input px-2 h-auto py-1"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving} className="min-w-[100px]">
                        {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Form</>}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-4 pb-20">
                    {fields.map((field, index) => (
                        <FieldItem
                            key={field.id}
                            field={field}
                            index={index}
                            updateField={updateField}
                            removeField={removeField}
                        />
                    ))}
                </Reorder.Group>

                {fields.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
                        <p>Start adding questions to your form</p>
                    </div>
                )}
            </div>

            {/* Toolbox */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-popover border shadow-lg rounded-full p-2 flex gap-2 overflow-x-auto max-w-[90vw]">
                <Button variant="ghost" size="sm" onClick={() => addField('text')} className="flex flex-col h-auto py-2 gap-1 min-w-[60px]">
                    <Type className="w-4 h-4" /> <span className="text-[10px]">Text</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => addField('textarea')} className="flex flex-col h-auto py-2 gap-1 min-w-[60px]">
                    <AlignLeft className="w-4 h-4" /> <span className="text-[10px]">Long Text</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => addField('number')} className="flex flex-col h-auto py-2 gap-1 min-w-[60px]">
                    <Hash className="w-4 h-4" /> <span className="text-[10px]">Number</span>
                </Button>
                <div className="w-px bg-border my-1" />
                <Button variant="ghost" size="sm" onClick={() => addField('select')} className="flex flex-col h-auto py-2 gap-1 min-w-[60px]">
                    <List className="w-4 h-4" /> <span className="text-[10px]">Dropdown</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => addField('radio')} className="flex flex-col h-auto py-2 gap-1 min-w-[60px]">
                    <CheckCircle2 className="w-4 h-4" /> <span className="text-[10px]">Radio</span>
                </Button>
            </div>
        </div>
    );
};
