import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, ClipboardList, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { FormBuilder } from './FormBuilder';

interface Form {
    id: string;
    title: string;
    fields: any[];
    created_at: string;
}

export const OrganizerForms = () => {
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/forms/organizer');
            setForms(data);
        } catch (error) {
            console.error('Error fetching forms:', error);
            toast.error('Failed to load forms');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this form?')) return;
        try {
            await api.delete(`/forms/${id}`);
            toast.success('Form deleted');
            setForms(forms.filter(f => f.id !== id));
        } catch (error) {
            console.error('Error deleting form:', error);
            toast.error('Failed to delete form');
        }
    };

    const handleSave = (success: boolean) => {
        if (success) fetchForms();
        setView('list');
        setSelectedFormId(null);
    };

    if (view === 'create' || view === 'edit') {
        return (
            <FormBuilder
                formId={selectedFormId || undefined}
                onSave={(success) => handleSave(success)}
                onCancel={() => {
                    setView('list');
                    setSelectedFormId(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Custom Forms</h2>
                    <p className="text-muted-foreground">Create forms for attendee questionnaires.</p>
                </div>
                <Button onClick={() => { setSelectedFormId(null); setView('create'); }} className="rounded-full">
                    <Plus className="w-4 h-4 mr-2" /> Create Form
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : forms.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl">
                    <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No forms created</h3>
                    <p className="text-muted-foreground mb-4">Create your first form to collect attendee details.</p>
                    <Button onClick={() => { setSelectedFormId(null); setView('create'); }} variant="outline">Create Form</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map(form => (
                        <div key={form.id} className="bg-card border rounded-xl p-5 hover:border-foreground/50 transition-colors group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-muted rounded-lg">
                                    <ClipboardList className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setSelectedFormId(form.id); setView('edit'); }} className="p-2 hover:bg-muted rounded-full">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(form.id)} className="p-2 hover:bg-red-100 text-red-500 rounded-full">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{form.title}</h3>
                            <p className="text-sm text-muted-foreground">{form.fields?.length || 0} Questions</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
