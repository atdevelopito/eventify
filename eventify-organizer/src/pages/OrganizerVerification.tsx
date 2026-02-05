import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useRole } from '@/components/RoleContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, Sparkles, Building2, Calendar, FileText, Link as LinkIcon, Phone, Mail, User as UserIcon, Twitter, Instagram, Linkedin } from 'lucide-react';
import { z } from 'zod';

const applicationSchema = z.object({
    full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
    email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
    phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20, "Phone number must be less than 20 characters"),
    organization_name: z.string().trim().max(200, "Organization name must be less than 200 characters").optional(),
    organization_type: z.string().min(1, "Please select an organization type"),
    event_type: z.string().min(1, "Please select an event type"),
    event_description: z.string().trim().min(50, "Please provide at least 50 characters describing your event").max(2000, "Description must be less than 2000 characters"),
    expected_attendees: z.string().min(1, "Please select expected attendees"),
    event_frequency: z.string().min(1, "Please select event frequency"),
    website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    social_media_links: z.string().max(500, "Social media links must be less than 500 characters").optional(),
    portfolio_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    additional_info: z.string().max(1000, "Additional info must be less than 1000 characters").optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export const OrganizerVerification = () => {
    const navigate = useNavigate();
    // const { toast } = useToast(); // Removed
    const { user } = useRole();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existingApplication, setExistingApplication] = useState<{
        status: string;
        created_at: string;
    } | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});

    const [formData, setFormData] = useState<ApplicationFormData>({
        full_name: '',
        email: '',
        phone: '',
        organization_name: '',
        organization_type: '',
        event_type: '',
        event_description: '',
        expected_attendees: '',
        event_frequency: '',
        website_url: '',
        social_media_links: '',
        portfolio_url: '',
        additional_info: '',
    });

    useEffect(() => {
        const checkAuth = async () => {
            // RoleProvider handles auth state, here we just fetch application status
            // actually verify user is logged in first via RoleContext user object
            // But for drafting, we might not have user.
            // This component should probably just rely on `user` from useRole()
        };
        // We can just rely on `user` prop from useRole hook which is available in component scope
    }, []);

    // Effect to check application status if user is logged in
    useEffect(() => {
        if (user) {
            fetchApplicationStatus();
            setFormData(prev => ({ ...prev, email: user.email }));
        } else {
            const draft = sessionStorage.getItem('organizer_application_draft');
            if (draft) {
                try {
                    setFormData(prev => ({ ...prev, ...JSON.parse(draft) }));
                } catch (e) { console.error(e); }
            }
            setLoading(false);
        }
    }, [user]);

    const fetchApplicationStatus = async () => {
        try {
            const { data } = await api.get('/host-applications/me');
            if (data) {
                setExistingApplication(data);
            }
        } catch (error) {
            // No application found is 404 possibly, or empty return.
            // Backend should handle it.
            console.log('No existing application or error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            // Save to session storage as draft
            if (!user) {
                sessionStorage.setItem('organizer_application_draft', JSON.stringify(newData));
            }
            return newData;
        });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            sessionStorage.setItem('organizer_application_draft', JSON.stringify(formData));
            toast.error('Please sign in to submit your application.');
            navigate('/login?next=/verification');
            return;
        }

        // Validate form first
        const result = applicationSchema.safeParse(formData);
        if (!result.success) {
            const zodError = result.error;
            // Zod 3.x uses .issues, older versions might use .errors. Checking both.
            const issues = zodError.issues || zodError.errors || [];

            if (Array.isArray(issues) && issues.length > 0) {
                const fieldErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
                issues.forEach(err => {
                    const field = err.path[0] as keyof ApplicationFormData;
                    fieldErrors[field] = err.message;
                });
                setErrors(fieldErrors);

                // Scroll to first error
                const firstErrorField = issues[0].path[0] as string;
                const element = document.getElementById(firstErrorField);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }

                toast.error('Please fix the highlighted errors.', { title: 'Validation Failed' });
            } else {
                console.error("Unexpected error structure received:", result);
                toast.error('An unexpected validation error occurred.');
            }
            return;
        }

        setSubmitting(true);

        try {
            await api.post('/host-applications', {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                organization_name: formData.organization_name || null,
                organization_type: formData.organization_type,
                event_type: formData.event_type,
                event_description: formData.event_description,
                expected_attendees: formData.expected_attendees,
                event_frequency: formData.event_frequency,
                website_url: formData.website_url || null,
                social_media_links: formData.social_media_links || null,
                portfolio_url: formData.portfolio_url || null,
                additional_info: formData.additional_info || null
            });

            sessionStorage.removeItem('organizer_application_draft');

            toast.success('We will review your application and get back to you soon.', { title: 'Application Submitted!' });

            // For anonymous users, we can't show "existingApplication" status because we don't know who they are after reload.
            // So we just show the success state using a local state flag instead.
            setExistingApplication({
                status: 'pending',
                created_at: new Date().toISOString()
            });

        } catch (error: any) {
            toast.error(error.message || 'Failed to submit application.', { title: 'Error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Show status if user has existing application
    if (existingApplication) {
        return (
            <div className="min-h-screen bg-white">
                <SEOHead
                    title="Host Application Status"
                    description="Check the status of your host application."
                />
                <Navbar />

                <main className="pt-24 pb-16 px-4 md:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="border border-black p-8 md:p-12"
                        >
                            {existingApplication.status === 'pending' && (
                                <>
                                    <Clock className="w-16 h-16 mx-auto mb-6 text-yellow-500" />
                                    <h1 className="text-3xl font-medium mb-4">Application Submitted!</h1>
                                    <p className="text-black/60 mb-6">
                                        We have received your application. We will review it and reach out to you within 5 hours.
                                    </p>

                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        <p className="text-sm font-medium uppercase tracking-wider mb-4">Follow us for updates</p>
                                        <div className="flex justify-center gap-4">
                                            <a href="#" className="w-10 h-10 border border-black flex items-center justify-center hover:bg-[#E85A6B] hover:border-[#E85A6B] transition-all duration-300">
                                                <Twitter className="w-5 h-5" />
                                            </a>
                                            <a href="#" className="w-10 h-10 border border-black flex items-center justify-center hover:bg-[#E85A6B] hover:border-[#E85A6B] transition-all duration-300">
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                            <a href="#" className="w-10 h-10 border border-black flex items-center justify-center hover:bg-[#E85A6B] hover:border-[#E85A6B] transition-all duration-300">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>

                                    <p className="text-sm text-black/40 mt-8">
                                        Submitted on {new Date(existingApplication.created_at).toLocaleDateString()}
                                    </p>
                                </>
                            )}

                            {existingApplication.status === 'approved' && (
                                <>
                                    <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-green-500" />
                                    <h1 className="text-3xl font-medium mb-4">Congratulations!</h1>
                                    <p className="text-black/60 mb-6">
                                        Your application has been approved. You can now create and manage events.
                                    </p>
                                    <Button
                                        onClick={() => navigate('/organizer')}
                                        className="bg-black text-white hover:bg-black/90"
                                    >
                                        Go to Host Dashboard
                                    </Button>
                                </>
                            )}

                            {existingApplication.status === 'rejected' && (
                                <>
                                    <XCircle className="w-16 h-16 mx-auto mb-6 text-red-500" />
                                    <h1 className="text-3xl font-medium mb-4">Application Not Approved</h1>
                                    <p className="text-black/60 mb-6">
                                        Unfortunately, we couldn't approve your application at this time.
                                        Please contact our support team for more information.
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    // ALLOW ANONYMOUS USERS TO SEE THE FORM
    // We modified the original "if !user return prompt" logic to just let them see the form
    // But checking the user req ("NO NEED TO LOGIN... TO SEE THAT PAGE"), they likely want to see the form immediately.
    // The provided code had an entire `if (!user)` block that returned a specific "Sign In to Apply" UI.
    // I will keep the form visible but maybe change the "Submit" button to "Sign In to Submit".
    // Actually, I'll merge the "CheckAuth" logic I wrote earlier: 
    // If not user, save draft and redirect on submit.

    // Wait, looking at the User's code again:
    // "Sign In to submit your application and start hosting events." + Button "Sign In to Apply"
    // This is what the user SENT. 
    // BUT their request was "NO NEED TO LOGIN... TO SEE THAT PAGE".
    // If I use their code exactly, it HIDES the form behind that prompt.
    // I should probably SHOW the form, and let `handleSubmit` handle the auth redirect.

    // So I will REMOVE the `if (!user) return ...` block that hides the form.

    return (
        <div className="min-h-screen bg-white">
            <SEOHead
                title="Become a Host"
                description="Apply to become an event host. Submit your details and start creating amazing events."
            />
            <Navbar />

            <main className="pt-24 pb-16 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 border border-black px-4 py-2 mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Host Application</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-medium mb-4">Become a Host</h1>
                        <p className="text-black/60 max-w-2xl mx-auto">
                            Ready to create amazing events? Fill out the application below and our team will review your submission.
                        </p>
                    </motion.div>

                    {/* Application Form */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        onSubmit={handleSubmit}
                        className="space-y-8"
                    >
                        {/* Personal Information Section */}
                        <div className="border border-black p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <UserIcon className="w-5 h-5" />
                                <h2 className="text-xl font-medium">Personal Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name *</Label>
                                    <Input
                                        id="full_name"
                                        value={formData.full_name}
                                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                                        placeholder="John Doe"
                                        className={errors.full_name ? 'border-red-500' : ''}
                                    />
                                    {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="you@example.com"
                                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="+880 1XXX-XXXXXX"
                                            className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Organization Information Section */}
                        <div className="border border-black p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Building2 className="w-5 h-5" />
                                <h2 className="text-xl font-medium">Organization Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="organization_name">Organization Name (if applicable)</Label>
                                    <Input
                                        id="organization_name"
                                        value={formData.organization_name}
                                        onChange={(e) => handleInputChange('organization_name', e.target.value)}
                                        placeholder="Your Company or Organization"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Organization Type *</Label>
                                    <Select
                                        value={formData.organization_type}
                                        onValueChange={(value) => handleInputChange('organization_type', value)}
                                    >
                                        <SelectTrigger className={errors.organization_type ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Individual / Freelancer</SelectItem>
                                            <SelectItem value="company">Company / Business</SelectItem>
                                            <SelectItem value="ngo">NGO / Non-Profit</SelectItem>
                                            <SelectItem value="educational">Educational Institution</SelectItem>
                                            <SelectItem value="government">Government Organization</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.organization_type && <p className="text-red-500 text-sm">{errors.organization_type}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Event Details Section */}
                        <div className="border border-black p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Calendar className="w-5 h-5" />
                                <h2 className="text-xl font-medium">Event Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <Label>Event Type *</Label>
                                    <Select
                                        value={formData.event_type}
                                        onValueChange={(value) => handleInputChange('event_type', value)}
                                    >
                                        <SelectTrigger className={errors.event_type ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select event type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="concert">Concert / Music Event</SelectItem>
                                            <SelectItem value="conference">Conference / Summit</SelectItem>
                                            <SelectItem value="workshop">Workshop / Training</SelectItem>
                                            <SelectItem value="seminar">Seminar / Webinar</SelectItem>
                                            <SelectItem value="exhibition">Exhibition / Trade Show</SelectItem>
                                            <SelectItem value="sports">Sports Event</SelectItem>
                                            <SelectItem value="festival">Festival / Cultural Event</SelectItem>
                                            <SelectItem value="networking">Networking Event</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.event_type && <p className="text-red-500 text-sm">{errors.event_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Expected Attendees *</Label>
                                    <Select
                                        value={formData.expected_attendees}
                                        onValueChange={(value) => handleInputChange('expected_attendees', value)}
                                    >
                                        <SelectTrigger className={errors.expected_attendees ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-50">1 - 50 attendees</SelectItem>
                                            <SelectItem value="50-100">50 - 100 attendees</SelectItem>
                                            <SelectItem value="100-500">100 - 500 attendees</SelectItem>
                                            <SelectItem value="500-1000">500 - 1,000 attendees</SelectItem>
                                            <SelectItem value="1000+">1,000+ attendees</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.expected_attendees && <p className="text-red-500 text-sm">{errors.expected_attendees}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Event Frequency *</Label>
                                    <Select
                                        value={formData.event_frequency}
                                        onValueChange={(value) => handleInputChange('event_frequency', value)}
                                    >
                                        <SelectTrigger className={errors.event_frequency ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="How often?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one-time">One-time Event</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.event_frequency && <p className="text-red-500 text-sm">{errors.event_frequency}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="event_description">Tell us about your event(s) *</Label>
                                <Textarea
                                    id="event_description"
                                    value={formData.event_description}
                                    onChange={(e) => handleInputChange('event_description', e.target.value)}
                                    placeholder="Describe the type of events you want to host, your target audience, goals, and any past experience organizing events..."
                                    rows={5}
                                    className={errors.event_description ? 'border-red-500' : ''}
                                />
                                <p className="text-sm text-gray-500">Minimum 50 characters</p>
                                {errors.event_description && <p className="text-red-500 text-sm">{errors.event_description}</p>}
                            </div>
                        </div>

                        {/* Links & Portfolio Section */}
                        <div className="border border-black p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <LinkIcon className="w-5 h-5" />
                                <h2 className="text-xl font-medium">Links & Portfolio</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <Label htmlFor="website_url">Website URL</Label>
                                    <Input
                                        id="website_url"
                                        type="url"
                                        value={formData.website_url}
                                        onChange={(e) => handleInputChange('website_url', e.target.value)}
                                        placeholder="https://yourwebsite.com"
                                        className={errors.website_url ? 'border-red-500' : ''}
                                    />
                                    {errors.website_url && <p className="text-red-500 text-sm">{errors.website_url}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="portfolio_url">Portfolio / Past Events URL</Label>
                                    <Input
                                        id="portfolio_url"
                                        type="url"
                                        value={formData.portfolio_url}
                                        onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                                        placeholder="https://portfolio.com"
                                        className={errors.portfolio_url ? 'border-red-500' : ''}
                                    />
                                    {errors.portfolio_url && <p className="text-red-500 text-sm">{errors.portfolio_url}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="social_media_links">Social Media Links</Label>
                                <Textarea
                                    id="social_media_links"
                                    value={formData.social_media_links}
                                    onChange={(e) => handleInputChange('social_media_links', e.target.value)}
                                    placeholder="Instagram: @yourhandle&#10;Facebook: facebook.com/yourpage&#10;LinkedIn: linkedin.com/in/yourprofile"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Additional Information Section */}
                        <div className="border border-black p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <FileText className="w-5 h-5" />
                                <h2 className="text-xl font-medium">Additional Information</h2>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="additional_info">Anything else you'd like us to know?</Label>
                                <Textarea
                                    id="additional_info"
                                    value={formData.additional_info}
                                    onChange={(e) => handleInputChange('additional_info', e.target.value)}
                                    placeholder="Any additional information, special requirements, or questions..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#E85A6B] text-black hover:bg-[#990e3d] px-12 py-6 text-lg font-medium uppercase tracking-wider border border-black"
                            >
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </div>
                    </motion.form>
                </div>
            </main>

            <Footer />
        </div>
    );
};
