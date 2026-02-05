import { HelmetProvider, Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const helpTopics = [
    {
      category: "Getting Started",
      items: [
        { question: "How do I create an account?", answer: "Click the 'Sign Up' button in the navigation bar and fill in your details. You'll receive a confirmation email to verify your account." },
        { question: "How do I find events near me?", answer: "Use the search bar on the Discover page to find events. You can filter by location, date, and category to find events that match your interests." },
        { question: "How do I register for an event?", answer: "Navigate to the event page and click the 'Register' button. If the event requires tickets, you'll be guided through the purchase process." },
      ]
    },
    {
      category: "For Event Organizers",
      items: [
        { question: "How do I create an event?", answer: "Go to 'Create Event' from the navigation menu. Fill in the event details including title, description, date, time, and location. Upload an image to make your event stand out." },
        { question: "Can I edit my event after publishing?", answer: "Yes! Go to 'My Events' and click the edit button on any event you've created. Changes will be reflected immediately." },
        { question: "How do I manage registrations?", answer: "Access your Organizer Dashboard to view all registrations, attendee information, and event analytics." },
      ]
    },
    {
      category: "Account & Settings",
      items: [
        { question: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page. Enter your email address and we'll send you a reset link." },
        { question: "How do I update my profile?", answer: "Go to your account settings to update your display name, profile picture, and other personal information." },
        { question: "How do I delete my account?", answer: "Contact our support team to request account deletion. Please note this action is irreversible." },
      ]
    }
  ];

  const filteredTopics = helpTopics.map(topic => ({
    ...topic,
    items: topic.items.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(topic => topic.items.length > 0);

  return (
    <HelmetProvider>
      <Helmet>
        <title>Help Center | Event Platform</title>
        <meta name="description" content="Get help with your event management questions. Find answers to common questions and contact our support team." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Help Center</h1>
            <p className="text-muted-foreground text-center mb-8">
              Find answers to your questions or contact our support team
            </p>

            {/* Search */}
            <div className="relative mb-12">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Help Topics */}
            {filteredTopics.map((topic, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{topic.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {topic.items.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`${index}-${itemIndex}`}>
                      <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            {/* Contact Support */}
            <div className="bg-muted rounded-lg p-8 mt-12">
              <h2 className="text-2xl font-semibold mb-4 text-center">Still need help?</h2>
              <p className="text-muted-foreground text-center mb-6">
                Our support team is here to assist you
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-background p-6 rounded-lg text-center">
                  <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Email Us</h3>
                  <p className="text-sm text-muted-foreground">support@eventplatform.com</p>
                </div>
                <div className="bg-background p-6 rounded-lg text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground">Available 9am - 5pm</p>
                </div>
                <div className="bg-background p-6 rounded-lg text-center">
                  <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default HelpCenter;
