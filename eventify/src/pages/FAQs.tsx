import { HelmetProvider, Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FAQs = () => {
  const faqCategories = {
    general: [
      {
        question: "What is this platform?",
        answer: "Our platform is a comprehensive event management solution that allows you to discover, create, and manage events. Whether you're looking to attend local events or organize your own, we provide all the tools you need."
      },
      {
        question: "Is it free to use?",
        answer: "Yes! Creating an account and browsing events is completely free. Event organizers can create free events at no cost. For paid events, a small service fee may apply to ticket sales."
      },
      {
        question: "How do I get started?",
        answer: "Simply create an account using your email address. Once verified, you can start discovering events or create your own event in just a few minutes."
      },
      {
        question: "What types of events can I find here?",
        answer: "We host a wide variety of events including conferences, workshops, concerts, meetups, networking events, festivals, and more. Use our filters to find events that match your interests."
      }
    ],
    attendees: [
      {
        question: "How do I register for an event?",
        answer: "Find an event you're interested in, click on it to view details, and click the 'Register' button. For free events, you'll be registered immediately. For paid events, you'll be guided through the checkout process."
      },
      {
        question: "Can I get a refund for my ticket?",
        answer: "Refund policies are set by individual event organizers. Check the event details page for the specific refund policy. Generally, refunds are available up to 48 hours before the event."
      },
      {
        question: "How do I find my tickets?",
        answer: "All your registered events and tickets can be found in the 'My Events' section of your account. You'll also receive a confirmation email with ticket details."
      },
      {
        question: "Can I transfer my ticket to someone else?",
        answer: "Ticket transfer availability depends on the event organizer's settings. Contact the event organizer directly if you need to transfer your ticket."
      }
    ],
    organizers: [
      {
        question: "How do I create an event?",
        answer: "Log in to your account, click 'Create Event' in the navigation, and fill in your event details including title, description, date, location, and image. You can save as draft or publish immediately."
      },
      {
        question: "Can I edit my event after publishing?",
        answer: "Yes, you can edit your event at any time from your Organizer Dashboard. Any changes will be immediately visible to attendees."
      },
      {
        question: "How do I manage attendee registrations?",
        answer: "Access your Organizer Dashboard to view all registrations, export attendee lists, and communicate with registered attendees."
      },
      {
        question: "What analytics are available for my events?",
        answer: "Our analytics dashboard provides insights on page views, registration trends, attendee demographics, and engagement metrics to help you optimize your events."
      },
      {
        question: "Can I create recurring events?",
        answer: "Yes, you can create recurring events by duplicating an existing event and adjusting the dates, or by setting up a recurring schedule when creating a new event."
      }
    ],
    payments: [
      {
        question: "What payment methods are accepted?",
        answer: "We accept all major credit and debit cards, mobile payments like bKash and Pathao Pay, and various local payment methods depending on your region."
      },
      {
        question: "When do organizers receive their payouts?",
        answer: "Payouts are processed within 5-7 business days after the event concludes. You can track your earnings in the Organizer Dashboard."
      },
      {
        question: "Are there any fees for selling tickets?",
        answer: "A small service fee (typically 2-5%) is applied to ticket sales to cover payment processing and platform maintenance. Free events have no fees."
      },
      {
        question: "How do I issue refunds?",
        answer: "Organizers can issue refunds through the Organizer Dashboard. Navigate to the registration, select the attendee, and click 'Issue Refund'. Refunds are typically processed within 5-10 business days."
      }
    ]
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>FAQs | Event Platform</title>
        <meta name="description" content="Find answers to frequently asked questions about our event platform." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-center mb-12">
              Find quick answers to common questions
            </p>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="attendees">Attendees</TabsTrigger>
                <TabsTrigger value="organizers">Organizers</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>

              {Object.entries(faqCategories).map(([category, faqs]) => (
                <TabsContent key={category} value={category}>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-12 text-center p-8 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Can't find what you're looking for?</h2>
              <p className="text-muted-foreground mb-4">
                Visit our Help Center for more detailed guides or contact our support team.
              </p>
              <a href="/help" className="text-primary font-semibold hover:underline">
                Go to Help Center →
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default FAQs;
