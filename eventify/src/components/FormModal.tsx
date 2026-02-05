import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';

interface FormQuestion {
    id: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'email' | 'phone';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[]; // For select, radio, checkbox
    description?: string;
}

interface Form {
    _id: string; // Mongo ID
    title: string;
    description?: string;
    fields: FormQuestion[]; // Backend uses 'fields' not 'questions'
}

interface FormModalProps {
    formId: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (responseId: string, answers: any) => void;
    ticketName?: string;
}

export const FormModal: React.FC<FormModalProps> = ({ formId, isOpen, onClose, onSubmit, ticketName }) => {
    const [form, setForm] = useState<Form | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && formId) {
            fetchForm();
        }
    }, [isOpen, formId]);

    const fetchForm = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/forms/${formId}`);
            setForm(data);

            // Initialize default answers structure
            const initialAnswers: Record<string, any> = {};
            if (data.fields) {
                data.fields.forEach((q: FormQuestion) => {
                    if (q.type === 'checkbox') initialAnswers[q.id] = [];
                    else initialAnswers[q.id] = '';
                });
            }
            setAnswers(initialAnswers);

        } catch (error) {
            console.error('Error fetching form:', error);
            toast.error('Failed to load the required form.');
            onClose(); // Close if we can't load the form
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
        setAnswers(prev => {
            const current = prev[questionId] || [];
            if (checked) {
                return { ...prev, [questionId]: [...current, option] };
            } else {
                return { ...prev, [questionId]: current.filter((item: string) => item !== option) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;

        // Validation
        if (form.fields) {
            for (const q of form.fields) {
                if (q.required) {
                    const val = answers[q.id];
                    if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
                        toast.error(`Please answer "${q.label}"`);
                        return;
                    }
                }
            }
        }

        setSubmitting(true);
        try {
            // We don't save the response to DB here separately? 
            // Actually usually we might want to just pass the answers back to the checkout flow 
            // OR save it and pass the ID.
            // Based on previous plan: "Update registration_routes.py to store form responses" implies we probably send answers with registration
            // BUT if we want to save it as a "FormResponse" document distinct from Registration, we'd POST here.
            // Let's assume we pass the answers back to the parent component to bundle with the registration request.
            // Wait, the prop says `onSubmit: (responseId: string, answers: any) => void;`
            // If the backend expects `form_responses` in the registration payload, we should just pass `answers`.

            // However, if we want to follow a "submit form then complete checkout" flow where form is independent:
            // Let's adopt a simple approach: user fills form -> we pass data to TicketCheckout -> TicketCheckout sends correct payload.

            onSubmit(form._id, answers);
            onClose();

        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to process form.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{form?.title || 'Additional Information Required'}</DialogTitle>
                    {ticketName && <p className="text-sm text-gray-500">For ticket: {ticketName}</p>}
                    {form?.description && (
                        <p className="text-sm text-gray-600 mt-2">{form.description}</p>
                    )}
                </DialogHeader>

                {loading ? (
                    <div className="py-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        {form?.fields?.map((q) => (
                            <div key={q.id} className="space-y-2">
                                <Label htmlFor={q.id} className="text-sm font-medium">
                                    {q.label} {q.required && <span className="text-red-500">*</span>}
                                </Label>

                                {q.description && (
                                    <p className="text-xs text-gray-500 mb-1">{q.description}</p>
                                )}

                                {/* Render input based on type */}
                                {q.type === 'textarea' ? (
                                    <Textarea
                                        id={q.id}
                                        placeholder={q.placeholder}
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                                        required={q.required}
                                    />
                                ) : q.type === 'select' ? (
                                    <select
                                        id={q.id}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                                        required={q.required}
                                    >
                                        <option value="">Select an option...</option>
                                        {q.options?.map((opt, idx) => (
                                            <option key={idx} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : q.type === 'radio' ? (
                                    <RadioGroup
                                        value={answers[q.id]}
                                        onValueChange={(val) => handleInputChange(q.id, val)}
                                    >
                                        {q.options?.map((opt, idx) => (
                                            <div key={idx} className="flex items-center space-x-2">
                                                <RadioGroupItem value={opt} id={`${q.id}-${idx}`} />
                                                <Label htmlFor={`${q.id}-${idx}`}>{opt}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                ) : q.type === 'checkbox' ? (
                                    <div className="space-y-2">
                                        {q.options?.map((opt, idx) => (
                                            <div key={idx} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${q.id}-${idx}`}
                                                    checked={(answers[q.id] || []).includes(opt)}
                                                    onCheckedChange={(checked) => handleCheckboxChange(q.id, opt, checked as boolean)}
                                                />
                                                <Label htmlFor={`${q.id}-${idx}`}>{opt}</Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // Default text/number/email/date/phone
                                    <Input
                                        id={q.id}
                                        type={q.type === 'phone' ? 'tel' : q.type}
                                        placeholder={q.placeholder}
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                                        required={q.required}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save & Continue'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};
