import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from '@/components/ui/toast';
import { Mail, MapPin, Phone, Clock, Send, MessageSquare, Headphones, Building } from "lucide-react";

const contactSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
    subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
    message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
    {
        icon: Mail,
        title: "Email Us",
        value: "hello@eventify.com",
        description: "We'll respond within 24 hours",
    },
    {
        icon: Phone,
        title: "Call Us",
        value: "+1 (555) 123-4567",
        description: "Mon-Fri, 9AM-6PM EST",
    },
    {
        icon: MapPin,
        title: "Visit Us",
        value: "123 Event Street, NYC",
        description: "New York, NY 10001",
    },
    {
        icon: Clock,
        title: "Business Hours",
        value: "Mon - Fri: 9AM - 6PM",
        description: "Weekend support available",
    },
];

const supportOptions = [
    {
        icon: MessageSquare,
        title: "General Inquiry",
        description: "Questions about our platform",
    },
    {
        icon: Headphones,
        title: "Event Support",
        description: "Help with your events",
    },
    {
        icon: Building,
        title: "Enterprise",
        description: "Large scale event solutions",
    },
];

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success(
            "We'll get back to you as soon as possible.",
            { title: "Message sent!" }
        );

        form.reset();
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-white">
            <SEOHead
                title="Contact Us | Eventify"
                description="Get in touch with the Eventify team. We're here to help with your events."
            />
            <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <Navbar />
            </div>

            {/* Hero Section */}
            <section className="pt-32 md:pt-40 lg:pt-48 pb-6 md:pb-16 lg:pb-24 px-4 md:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-6 md:mb-10 inline-flex flex-col items-center">
                        <div className="flex items-center">
                            <span className="border border-black px-3 md:px-6 py-2 md:py-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>Get in</span>
                            <span className="bg-[#E85A6B] border border-black px-3 md:px-6 py-2 md:py-4 rounded-[20px] md:rounded-[40px] -ml-px animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>touch</span>
                        </div>
                    </h1>
                    <p className="text-sm md:text-base lg:text-[18px] text-black max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
                        Have a question or want to work together? We'd love to hear from you.
                    </p>
                </div>
            </section>

            {/* Support Options */}
            <section className="px-4 md:px-8 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {supportOptions.map((option, index) => (
                            <button
                                key={option.title}
                                className="group p-6 border border-black bg-white hover:bg-black hover:text-white transition-all duration-300 text-left animate-fade-in rounded-xl"
                                style={{ animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: 'both' }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border border-current flex items-center justify-center group-hover:bg-[#E85A6B] group-hover:border-[#E85A6B] group-hover:text-black transition-all duration-300 rounded-lg">
                                        <option.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm">{option.title}</h3>
                                        <p className="text-xs mt-1 opacity-70">{option.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="px-4 md:px-8 py-12 md:py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Contact Form */}
                        <div className="border border-black p-6 md:p-10 animate-fade-in rounded-2xl" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                            <div className="mb-8">
                                <h2 className="text-2xl font-medium mb-2">Send a Message</h2>
                                <p className="text-muted-foreground text-sm">Fill out the form and we'll get back to you shortly.</p>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-medium uppercase tracking-wide">Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Your name"
                                                            className="border-black focus:ring-0 focus:border-[#E85A6B] rounded-lg"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-medium uppercase tracking-wide">Email</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder="your@email.com"
                                                            className="border-black focus:ring-0 focus:border-[#E85A6B] rounded-lg"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium uppercase tracking-wide">Subject</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="What's this about?"
                                                        className="border-black focus:ring-0 focus:border-[#E85A6B] rounded-lg"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium uppercase tracking-wide">Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell us more about your inquiry..."
                                                        className="border-black focus:ring-0 focus:border-[#E85A6B] min-h-[150px] resize-none rounded-lg"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-black text-white py-4 font-medium hover:bg-[#E85A6B] hover:text-black transition-colors border border-black flex items-center justify-center gap-2 disabled:opacity-50 rounded-lg"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Send Message
                                                <Send className="w-4 h-4" />
                                            </span>
                                        )}
                                    </button>
                                </form>
                            </Form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                                <h2 className="text-2xl font-medium mb-2">Contact Info</h2>
                                <p className="text-muted-foreground text-sm">Reach out through any of these channels.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {contactInfo.map((info, index) => (
                                    <div
                                        key={info.title}
                                        className="group p-6 border border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 animate-fade-in rounded-xl"
                                        style={{ animationDelay: `${0.7 + index * 0.1}s`, animationFillMode: 'both' }}
                                    >
                                        <div className="w-12 h-12 border border-black flex items-center justify-center mb-4 group-hover:bg-[#E85A6B] transition-colors rounded-lg">
                                            <info.icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                                            {info.title}
                                        </h3>
                                        <p className="font-medium">{info.value}</p>
                                        <p className="text-muted-foreground text-sm mt-1">{info.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Map Placeholder */}
                            <div className="relative h-64 border border-black overflow-hidden bg-muted/30 animate-fade-in rounded-2xl" style={{ animationDelay: '1.1s', animationFillMode: 'both' }}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center space-y-2">
                                        <MapPin className="w-8 h-8 mx-auto text-muted-foreground" />
                                        <p className="text-muted-foreground text-sm font-medium">Interactive map coming soon</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
