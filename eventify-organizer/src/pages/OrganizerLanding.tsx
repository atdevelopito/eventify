import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRole } from "@/components/RoleContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
    Calendar,
    Users,
    TrendingUp,
    Shield,
    Zap,
    Headphones,
    ArrowRight,
    Star,
    CreditCard,
    Percent,
    Clock
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const rotatingWords = ['concerts', 'workshops', 'festivals', 'meetups', 'conferences'];

export const OrganizerLanding = () => {
    const navigate = useNavigate();
    const { user, isPro, isVerified } = useRole();
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    const handleStartHosting = () => {
        // If already verified, go to dashboard
        if (user && isVerified) {
            navigate('/organizer');
            return;
        }

        // Otherwise go to verification (form handles auth if needed)
        navigate('/verification');
    };

    useEffect(() => {
        const wordInterval = setInterval(() => {
            setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
        }, 2500);

        return () => clearInterval(wordInterval);
    }, []);

    const features = [
        {
            icon: Calendar,
            title: "Easy Event Creation",
            description: "Create and manage events with our intuitive dashboard. Set up tickets, descriptions, and schedules in minutes."
        },
        {
            icon: Users,
            title: "Attendee Management",
            description: "Track registrations, send updates, and manage your guest list all in one place."
        },
        {
            icon: TrendingUp,
            title: "Real-time Analytics",
            description: "Get insights into ticket sales, attendee demographics, and event performance."
        },
        {
            icon: Shield,
            title: "Secure Payments",
            description: "Accept payments safely with our integrated payment system. Fast payouts guaranteed."
        },
        {
            icon: Zap,
            title: "Instant Publishing",
            description: "Go live instantly. Your events are visible to thousands of potential attendees immediately."
        },
        {
            icon: Headphones,
            title: "24/7 Support",
            description: "Our dedicated support team is always ready to help you succeed with your events."
        }
    ];

    const stats = [
        { value: "50K+", label: "Events Hosted" },
        { value: "2M+", label: "Tickets Sold" },
        { value: "98%", label: "Satisfaction Rate" },
        { value: "50+", label: "Cities" }
    ];

    const testimonials = [
        {
            name: "Rafiq Ahmed",
            role: "Music Festival Organizer",
            content: "This platform transformed how I run my events. The analytics alone saved me countless hours of work.",
            rating: 5
        },
        {
            name: "Fatima Khan",
            role: "Corporate Event Planner",
            content: "Professional, reliable, and incredibly easy to use. My clients are always impressed with the seamless experience.",
            rating: 5
        },
        {
            name: "Karim Hassan",
            role: "Community Leader",
            content: "From small meetups to large conferences, this platform handles everything beautifully.",
            rating: 5
        }
    ];

    const steps = [
        { step: "01", title: "Apply", description: "Fill out our simple application form with your event details" },
        { step: "02", title: "Get Approved", description: "Our team reviews your application within 24-48 hours" },
        { step: "03", title: "Create Events", description: "Access your dashboard and start creating amazing events" },
        { step: "04", title: "Grow", description: "Reach thousands of attendees and grow your brand" }
    ];

    const pricingFeatures = [
        { icon: CreditCard, text: "Free to create and publish events" },
        { icon: Percent, text: "Only 5% fee on paid tickets" },
        { icon: Clock, text: "Instant payouts to your account" },
        { icon: Shield, text: "No hidden fees or monthly charges" }
    ];

    const faqs = [
        {
            question: "How do I become an event host?",
            answer: "Simply click on 'Apply Now' and fill out our application form with your details and event information. Our team will review your application within 24-48 hours and get back to you."
        },
        {
            question: "What types of events can I host?",
            answer: "You can host any type of event including concerts, workshops, conferences, meetups, festivals, corporate events, and more. We support both free and paid events."
        },
        {
            question: "How much does it cost to host events?",
            answer: "Creating and publishing events is completely free. We only charge a 5% fee on paid ticket sales. For free events, there are no charges at all."
        },
        {
            question: "How do I receive payments for ticket sales?",
            answer: "Payments are processed securely through our platform. You can withdraw your earnings to your bank account or mobile wallet. Payouts are processed within 2-3 business days."
        },
        {
            question: "Can I customize my event page?",
            answer: "Yes! You have full control over your event page. Add images, descriptions, multiple ticket types, and customize the look to match your brand."
        },
        {
            question: "What support do you offer to hosts?",
            answer: "We provide 24/7 support through chat and email. You'll also have access to our comprehensive knowledge base and video tutorials to help you succeed."
        }
    ];

    return (
        <div className="min-h-screen bg-white text-black selection:bg-[#E85A6B] selection:text-white">
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
                <Navbar />
            </div>

            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 bg-white relative">
                {/* Background Gradients */}
                <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#E85A6B]/5 to-transparent pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    {/* Headline with bordered boxes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8 md:mb-12"
                    >
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-black">
                            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                                <motion.span
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="border border-black px-3 py-2 md:px-6 md:py-3"
                                >
                                    Host
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="bg-[#E85A6B] border border-black px-3 py-2 md:px-6 md:py-3 rounded-full overflow-hidden min-w-[140px] md:min-w-[220px] relative text-white"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={rotatingWords[currentWordIndex]}
                                            initial={{ y: 40, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -40, opacity: 0 }}
                                            transition={{
                                                duration: 0.4,
                                                ease: [0.23, 1, 0.32, 1]
                                            }}
                                            className="inline-block"
                                        >
                                            {rotatingWords[currentWordIndex]}
                                        </motion.span>
                                    </AnimatePresence>
                                </motion.span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-0 mt-2 md:mt-3">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    className="border border-black px-3 py-2 md:px-6 md:py-3"
                                >
                                    that
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    className="border border-black border-l-0 px-3 py-2 md:px-6 md:py-3"
                                >
                                    inspire
                                </motion.span>
                            </div>
                        </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="text-base md:text-lg text-black/60 max-w-xl mx-auto mb-10 md:mb-14"
                    >
                        Join thousands of successful organizers who trust us to power their events.
                        From intimate gatherings to massive festivals, we've got you covered.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={handleStartHosting}
                            className="group relative overflow-hidden bg-black text-white px-8 py-4 text-sm font-medium uppercase tracking-wider transition-all duration-300 hover:bg-[#E85A6B] hover:text-white hover:border-[#E85A6B] border border-black"
                        >
                            Start Hosting Today
                            <ArrowRight className="inline-block ml-2 h-4 w-4" />
                        </button>
                        <button
                            onClick={() => navigate('/discover')}
                            className="border border-black/30 px-8 py-4 text-sm font-medium uppercase tracking-wider transition-all duration-300 hover:bg-black hover:text-white hover:border-black"
                        >
                            Explore Events
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section - Light themed */}
            <section className="px-4 md:px-8 py-12 md:py-20 bg-white text-black relative overflow-hidden border-y border-black/5">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#E85A6B] rounded-full -translate-y-1/2 translate-x-1/2 opacity-5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#E85A6B] rounded-full translate-y-1/2 -translate-x-1/2 opacity-5 blur-3xl" />

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center p-6 border border-black/10 hover:border-[#E85A6B]/50 hover:bg-[#E85A6B]/5 transition-all duration-300"
                            >
                                <div className="text-4xl md:text-5xl font-bold mb-2 text-[#E85A6B]">{stat.value}</div>
                                <div className="text-sm text-black/50 uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-4 md:px-8 py-12 md:py-20 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-0 mb-6"
                        >
                            <span className="border border-black px-4 py-2 text-xl md:text-2xl font-medium">Everything</span>
                            <span className="border border-black border-l-0 px-4 py-2 text-xl md:text-2xl font-medium">You</span>
                            <span className="bg-[#E85A6B] border border-black border-l-0 px-4 py-2 text-xl md:text-2xl font-medium text-white">Need</span>
                        </motion.div>
                        <p className="text-black/60 max-w-xl mx-auto">
                            Powerful tools designed specifically for event organizers like you
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 border border-black/10 hover:bg-[#E85A6B]/5 hover:border-[#E85A6B]/50 transition-colors group relative"
                            >
                                <div className="w-14 h-14 border-2 border-black/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#E85A6B] group-hover:border-[#E85A6B] transition-colors">
                                    <feature.icon className="h-6 w-6 text-black group-hover:text-white" />
                                </div>
                                <h3 className="text-lg font-medium mb-3 text-black">{feature.title}</h3>
                                <p className="text-sm text-black/60 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="px-4 md:px-8 py-12 md:py-20 bg-gray-50 border-y border-black/5">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-0 mb-6"
                        >
                            <span className="border border-black px-4 py-2 text-xl md:text-2xl font-medium">How</span>
                            <span className="border border-black border-l-0 px-4 py-2 text-xl md:text-2xl font-medium">It</span>
                            <span className="bg-[#E85A6B] border border-black border-l-0 px-4 py-2 text-xl md:text-2xl font-medium text-white">Works</span>
                        </motion.div>
                        <p className="text-black/60 max-w-xl mx-auto">
                            Get started in four simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="relative"
                            >
                                {/* Connector line for desktop */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px border-t-2 border-dashed border-black/10" />
                                )}

                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-white border-2 border-black mb-6 group hover:border-[#E85A6B] transition-colors">
                                        <span className="text-2xl font-bold text-black group-hover:text-[#E85A6B] transition-colors">{item.step}</span>
                                    </div>
                                    <h3 className="text-xl font-medium mb-3 text-black">{item.title}</h3>
                                    <p className="text-black/60 text-sm leading-relaxed">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="px-4 md:px-8 py-12 md:py-20 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-0 mb-6"
                        >
                            <span className="border border-black px-4 py-2 text-xl md:text-2xl font-medium">Loved</span>
                            <span className="border border-black border-l-0 px-4 py-2 text-xl md:text-2xl font-medium">By</span>
                            <span className="bg-[#E85A6B] border border-black border-l-0 px-4 py-2 text-xl md:text-2xl font-medium text-white">Organizers</span>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-0">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 border border-black/10 hover:border-[#E85A6B] transition-colors"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-[#E85A6B] text-[#E85A6B]" />
                                    ))}
                                </div>
                                <p className="text-sm mb-6 text-black/70 leading-relaxed">"{testimonial.content}"</p>
                                <div className="border-t border-black/5 pt-4">
                                    <div className="font-medium text-black">{testimonial.name}</div>
                                    <div className="text-xs text-black/40 uppercase tracking-wider">{testimonial.role}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="px-4 md:px-8 py-12 md:py-20 bg-gray-50 text-black relative overflow-hidden border-t border-black/5">
                {/* Decorative elements */}
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-[#E85A6B] rounded-full translate-x-1/2 -translate-y-1/2 opacity-5 blur-[100px]" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-0 mb-6"
                        >
                            <span className="border border-black px-4 py-2 text-xl md:text-2xl font-medium">Simple</span>
                            <span className="bg-[#E85A6B] text-white border border-[#E85A6B] px-4 py-2 text-xl md:text-2xl font-medium">Pricing</span>
                        </motion.div>
                        <p className="text-black/60 max-w-xl mx-auto">
                            No hidden fees. No surprises. Pay only when you succeed.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 gap-8 items-center"
                    >
                        <div className="space-y-6">
                            {pricingFeatures.map((feature, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-10 h-10 border border-[#E85A6B] rounded-full flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="h-5 w-5 text-[#E85A6B]" />
                                    </div>
                                    <span className="text-black/90">{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <div className="border-2 border-black p-8 mb-6 relative overflow-hidden bg-white">
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="w-20 h-20 bg-[#E85A6B]/10 rounded-full blur-xl"></div>
                                </div>
                                <div className="text-6xl md:text-7xl font-bold text-[#E85A6B] mb-2">5%</div>
                                <div className="text-black/60 uppercase tracking-wider text-sm">Per Ticket Sold</div>
                                <div className="mt-4 pt-4 border-t border-black/10">
                                    <span className="text-2xl font-bold">৳0</span>
                                    <span className="text-black/60 ml-2">for free events</span>
                                </div>
                            </div>
                            <button
                                onClick={handleStartHosting}
                                className="w-full bg-[#E85A6B] text-white px-8 py-4 text-sm font-medium uppercase tracking-wider transition-all duration-300 hover:bg-black hover:text-white"
                            >
                                Apply Now
                                <ArrowRight className="inline-block ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="px-4 md:px-8 py-12 md:py-20 bg-white text-black">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-0 mb-6"
                        >
                            <span className="border border-black px-4 py-2 text-xl md:text-2xl font-medium">Frequently</span>
                            <span className="border border-black border-l-0 px-4 py-2 text-xl md:text-2xl font-medium">Asked</span>
                            <span className="bg-[#E85A6B] border border-black border-l-0 px-4 py-2 text-xl md:text-2xl font-medium text-white">Questions</span>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Accordion type="single" collapsible className="space-y-0">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border border-black/10 border-b-0 last:border-b last:border-black/10 px-6 data-[state=open]:bg-[#E85A6B]/5"
                                >
                                    <AccordionTrigger className="text-left font-medium hover:no-underline py-5 text-black">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-black/70 pb-5">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-4 md:px-8 py-16 md:py-24 bg-gray-50 border-t border-black/5">
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl md:text-3xl font-medium mb-4 text-black">
                            Ready to Host Your First Event?
                        </h2>
                        <p className="text-black/60 mb-8">
                            Join our community of successful organizers and start creating unforgettable experiences today.
                        </p>
                        <button
                            onClick={handleStartHosting}
                            className="bg-black text-white px-8 py-4 text-sm font-medium uppercase tracking-wider transition-all duration-300 hover:bg-[#E85A6B] hover:text-white"
                        >
                            Become a Host
                            <ArrowRight className="inline-block ml-2 h-4 w-4" />
                        </button>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};


